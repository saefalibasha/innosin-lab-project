import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Point,
  PlacedProduct,
  Door,
  TextAnnotation,
  WallSegment,
  Room,
  DrawingMode,
  WallType,
} from '@/types/floorPlanTypes';
import {
  MeasurementUnit,
  formatMeasurement,
  canvasToMm,
  mmToCanvas,
} from '@/utils/measurements';
import { getProductDimensionsInMm } from '@/utils/productDimensions';
import { SnapSystem } from '@/utils/snapSystem';
import { toast } from 'sonner';

interface EnhancedCanvasWorkspaceProps {
  roomPoints: Point[];
  setRoomPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  wallSegments: WallSegment[];
  setWallSegments: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  placedProducts: PlacedProduct[];
  setPlacedProducts: React.Dispatch<React.SetStateAction<PlacedProduct[]>>;
  doors: Door[];
  setDoors: React.Dispatch<React.SetStateAction<Door[]>>;
  textAnnotations: TextAnnotation[];
  setTextAnnotations: React.Dispatch<React.SetStateAction<TextAnnotation[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  scale: number;
  currentMode: DrawingMode;
  showGrid: boolean;
  showMeasurements: boolean;
  gridSize: number;
  measurementUnit: MeasurementUnit;
  canvasWidth: number;
  canvasHeight: number;
  onClearAll: () => void;
  selectedProducts: string[];
  onProductSelect: (products: string[]) => void;
  onWallUpdate?: (wall: WallSegment) => void;
}

/* ===================== Config ===================== */
const PRODUCT_CLEARANCE_MM = 20; // min gap to other furniture
const WALL_CLEARANCE_MM = 10; // min gap to walls
const USE_RAF_FOR_DRAG = true;

/* ===================== Math helpers ===================== */
const len = (a: Point, b: Point) =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
const dot = (ax: number, ay: number, bx: number, by: number) =>
  ax * bx + ay * by;
const rot = (x: number, y: number, ang: number) => ({
  x: x * Math.cos(ang) - y * Math.sin(ang),
  y: x * Math.sin(ang) + y * Math.cos(ang),
});
const toAABB = (pts: Point[]) => {
  let left = Infinity,
    right = -Infinity,
    top = Infinity,
    bottom = -Infinity;
  for (const p of pts) {
    left = Math.min(left, p.x);
    right = Math.max(right, p.x);
    top = Math.min(top, p.y);
    bottom = Math.max(bottom, p.y);
  }
  return { left, right, top, bottom };
};
const segmentAABB = (start: Point, end: Point, thickness: number) => {
  const minX = Math.min(start.x, end.x) - thickness / 2;
  const maxX = Math.max(start.x, end.x) + thickness / 2;
  const minY = Math.min(start.y, end.y) - thickness / 2;
  const maxY = Math.max(start.y, end.y) + thickness / 2;
  return { left: minX, right: maxX, top: minY, bottom: maxY };
};
const aabbOverlap = (
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
  pad = 0
) =>
  a.left < b.right + pad &&
  a.right > b.left - pad &&
  a.top < b.bottom + pad &&
  a.bottom > b.top - pad;

const pointToSegmentDist = (p: Point, a: Point, b: Point) => {
  const vx = b.x - a.x,
    vy = b.y - a.y;
  const wx = p.x - a.x,
    wy = p.y - a.y;
  const c1 = dot(wx, wy, vx, vy);
  if (c1 <= 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const c2 = dot(vx, vy, vx, vy);
  if (c2 <= c1) return Math.hypot(p.x - b.x, p.y - b.y);
  const t = c1 / c2;
  const proj = { x: a.x + t * vx, y: a.y + t * vy };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
};

/** distance from (possibly rotated) product rect to a wall segment */
const rectToSegmentMinDist = (
  center: Point,
  length: number,
  width: number,
  rotation: number,
  segA: Point,
  segB: Point
) => {
  const hx = length / 2,
    hy = width / 2;
  const ptsLocal = [
    { x: -hx, y: -hy },
    { x: hx, y: -hy },
    { x: hx, y: hy },
    { x: -hx, y: hy },
  ];
  const pts = ptsLocal.map((pt) => {
    const r = rot(pt.x, pt.y, rotation || 0);
    return { x: center.x + r.x, y: center.y + r.y };
  });
  const edges = [
    [pts[0], pts[1]],
    [pts[1], pts[2]],
    [pts[2], pts[3]],
    [pts[3], pts[0]],
  ] as Array<[Point, Point]>;
  let min = Infinity;
  for (const v of pts) min = Math.min(min, pointToSegmentDist(v, segA, segB));
  for (const [a, b] of edges) {
    min = Math.min(min, pointToSegmentDist(segA, a, b));
    min = Math.min(min, pointToSegmentDist(segB, a, b));
  }
  return min;
};

const productCorners = (p: PlacedProduct): Point[] => {
  const L = p.dimensions.length ?? 40;
  const W = p.dimensions.width ?? 30;
  const hx = L / 2,
    hy = W / 2;
  const ptsLocal = [
    { x: -hx, y: -hy },
    { x: hx, y: -hy },
    { x: hx, y: hy },
    { x: -hx, y: hy },
  ];
  return ptsLocal.map((pt) => {
    const r = rot(pt.x, pt.y, p.rotation || 0);
    return { x: p.position.x + r.x, y: p.position.y + r.y };
  });
};

const toProductAABB = (p: PlacedProduct) => toAABB(productCorners(p));

/* ---------- polygon helpers (keep inside the main walls) ---------- */
const near = (a: Point, b: Point, eps = 1e-3) =>
  Math.hypot(a.x - b.x, a.y - b.y) < eps;

/** order wall endpoints into a closed polygon if possible */
const wallsToPolygon = (walls: WallSegment[]): Point[] | null => {
  if (walls.length < 3) return null;
  // collect unique endpoints
  const pts: Point[] = [];
  const pushUnique = (p: Point) => {
    if (!pts.some((q) => near(p, q))) pts.push({ x: p.x, y: p.y });
  };
  walls.forEach((w) => {
    pushUnique(w.start);
    pushUnique(w.end);
  });
  // Greedy chain by nearest neighbor
  let start = pts[0];
  const poly = [start];
  const remaining = pts.slice(1);
  while (remaining.length) {
    let bestIdx = -1,
      bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = len(poly[poly.length - 1], remaining[i]);
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    poly.push(next);
  }
  // close if last connects to first
  if (!near(poly[0], poly[poly.length - 1])) poly.push(poly[0]);
  // validate
  const ok = poly.length >= 4;
  return ok ? poly.slice(0, -1) : null;
};

const pointInPolygon = (pt: Point, poly: Point[]) => {
  // ray casting
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y,
      xj = poly[j].x,
      yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

/** ensure all rect corners lie inside polygon */
const rectInsidePolygon = (p: PlacedProduct, poly: Point[]) => {
  const corners = productCorners(p);
  return corners.every((c) => pointInPolygon(c, poly));
};

/* ===================== Component ===================== */
const EnhancedCanvasWorkspace: React.FC<EnhancedCanvasWorkspaceProps> = ({
  roomPoints,
  setRoomPoints,
  wallSegments,
  setWallSegments,
  placedProducts,
  setPlacedProducts,
  doors,
  setDoors,
  textAnnotations,
  setTextAnnotations,
  rooms,
  setRooms,
  scale,
  currentMode,
  showGrid,
  showMeasurements,
  gridSize,
  measurementUnit,
  canvasWidth,
  canvasHeight,
  selectedProducts,
  onProductSelect,
  onWallUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // wall preview / snapping / measures
  const [wallStartPoint, setWallStartPoint] = useState<Point | null>(null);
  const [isWallPreview, setIsWallPreview] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });
  const [currentLineMeasurement, setCurrentLineMeasurement] = useState<string>('');
  const [selectedWall, setSelectedWall] = useState<WallSegment | null>(null);
  const [hoveredWall, setHoveredWall] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [snapGuides, setSnapGuides] = useState<{ horizontal: number | null; vertical: number | null }>({
    horizontal: null,
    vertical: null,
  });
  const [hoveredMeasurement, setHoveredMeasurement] = useState<string | null>(null);
  const [editingMeasurement, setEditingMeasurement] = useState<{ wallId: string; value: string } | null>(null);

  // selection / dragging
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedProducts || []);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragMeasurements, setDragMeasurements] = useState<{ top: number; right: number; bottom: number; left: number } | null>(null);
  const [lastValidPos, setLastValidPos] = useState<Point | null>(null);
  const dragRafRef = useRef<number | null>(null);

  // door snap preview
  const [doorSnapPreview, setDoorSnapPreview] = useState<{ point: Point; wall: WallSegment } | null>(null);

  const snapSystem = new SnapSystem(
    {
      enabled: true,
      gridSnap: showGrid,
      objectSnap: true,
      snapDistance: 20,
      strength: 'medium',
      snapToObjects: true,
      snapToAlignment: true,
      snapToGrid: showGrid,
    },
    gridSize,
    scale
  );

  const CANVAS_WIDTH = canvasWidth;
  const CANVAS_HEIGHT = canvasHeight;

  useEffect(() => setSelectedItems(selectedProducts || []), [selectedProducts]);

/* ---------- Helpers ---------- */
const getCanvasPoint = useCallback(
  (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  },
  []
);

const snapToGrid = useCallback(
  (p: Point): Point => {
    if (!showGrid) return p;
    const gridPx = gridSize * scale;
    return {
      x: Math.round(p.x / gridPx) * gridPx,
      y: Math.round(p.y / gridPx) * gridPx,
    };
  },
  [showGrid, gridSize, scale]
);

const findWallEndpoints = useCallback((): Point[] => {
  const out: Point[] = [];
  wallSegments.forEach((w) => out.push(w.start, w.end));
  return out;
}, [wallSegments]);

const snapToEndpoints = useCallback(
  (p: Point): { point: Point | null; showGuides: boolean; isSnapping: boolean } => {
    const SNAP = 40;
    for (const ep of findWallEndpoints()) {
      if (len(p, ep) <= SNAP)
        return { point: ep, showGuides: true, isSnapping: true };
    }
    return { point: null, showGuides: false, isSnapping: false };
  },
  [findWallEndpoints]
);

const constrainToOrtho = useCallback((start: Point, p: Point): Point => {
  const dx = p.x - start.x;
  const dy = p.y - start.y;
  return Math.abs(dx) > Math.abs(dy)
    ? { x: p.x, y: start.y }
    : { x: start.x, y: p.y };
}, []);

/* ---------- Robust wall + inside-room checks ---------- */
const outerPolygon = useCallback(() => {
  // prefer a drawn room polygon if present; else derive from walls
  if (rooms.length && rooms[0].points.length >= 3) return rooms[0].points;
  return wallsToPolygon(wallSegments);
}, [rooms, wallSegments]);

const rectTooCloseToAnyWall = useCallback(
  (prod: PlacedProduct): boolean => {
    const L = prod.dimensions.length ?? 40;
    const W = prod.dimensions.width ?? 30;
    const clearancePx = mmToCanvas(WALL_CLEARANCE_MM, scale);
    for (const w of wallSegments) {
      const need = (w.thickness ?? 10) / 2 + clearancePx;
      const d = rectToSegmentMinDist(
        prod.position,
        L,
        W,
        prod.rotation || 0,
        w.start,
        w.end
      );
      if (d < need) return true;
    }
    return false;
  },
  [wallSegments, scale]
);

const rectOutsideWalls = useCallback(
  (prod: PlacedProduct): boolean => {
    const poly = outerPolygon();
    if (!poly) return false; // if we can't deduce, don't block
    // require center and all corners be inside polygon
    if (!pointInPolygon(prod.position, poly)) return true;
    return !rectInsidePolygon(prod, poly);
  },
  [outerPolygon]
);

const collidesWithFurniture = useCallback(
  (prod: PlacedProduct, exceptId?: string): boolean => {
    const pad = mmToCanvas(PRODUCT_CLEARANCE_MM, scale);
    const a = toProductAABB(prod);
    for (const other of placedProducts) {
      if (other.id === prod.id || other.id === exceptId) continue;
      const b = toProductAABB(other);
      if (aabbOverlap(a, b, pad)) return true;
    }
    return false;
  },
  [placedProducts, scale]
);

const blockReasons = useCallback(
  (candidate: PlacedProduct, exceptId?: string) => {
    if (rectOutsideWalls(candidate)) return "outside_walls";
    if (rectTooCloseToAnyWall(candidate)) return "near_wall";
    if (collidesWithFurniture(candidate, exceptId)) return "overlap_furniture";
    return null;
  },
  [rectOutsideWalls, rectTooCloseToAnyWall, collidesWithFurniture]
);

const clampToCanvas = useCallback(
  (pos: Point, dimsPx: { length: number; width: number }): Point => {
    const halfL = (dimsPx.length ?? 40) / 2;
    const halfW = (dimsPx.width ?? 30) / 2;
    return {
      x: clamp(pos.x, halfL, CANVAS_WIDTH - halfL),
      y: clamp(pos.y, halfW, CANVAS_HEIGHT - halfW),
    };
  },
  [CANVAS_WIDTH, CANVAS_HEIGHT]
);

const calculateWallDistances = useCallback(
  (p: Point) => {
    let top = Infinity,
      right = Infinity,
      bottom = Infinity,
      left = Infinity;

    for (const w of wallSegments) {
      const horiz =
        Math.abs(w.start.y - w.end.y) < Math.abs(w.start.x - w.end.x);
      if (horiz) {
        const wy = (w.start.y + w.end.y) / 2;
        const minX = Math.min(w.start.x, w.end.x);
        const maxX = Math.max(w.start.x, w.end.x);
        if (p.x >= minX && p.x <= maxX) {
          if (wy < p.y) top = Math.min(top, p.y - wy);
          else bottom = Math.min(bottom, wy - p.y);
        }
      } else {
        const wx = (w.start.x + w.end.x) / 2;
        const minY = Math.min(w.start.y, w.end.y);
        const maxY = Math.max(w.start.y, w.end.y);
        if (p.y >= minY && p.y <= maxY) {
          if (wx < p.x) left = Math.min(left, p.x - wx);
          else right = Math.min(right, wx - p.x);
        }
      }
    }

    return {
      top: top === Infinity ? 0 : Math.round(canvasToMm(top, scale)),
      right: right === Infinity ? 0 : Math.round(canvasToMm(right, scale)),
      bottom: bottom === Infinity ? 0 : Math.round(canvasToMm(bottom, scale)),
      left: left === Infinity ? 0 : Math.round(canvasToMm(left, scale)),
    };
  },
  [wallSegments, scale]
);

const snapIslandBenchDistance = useCallback(
  (prod: PlacedProduct, targetMm = 600): Point => {
    const isBench =
      prod.name?.toLowerCase().includes("bench") ||
      prod.name?.toLowerCase().includes("island") ||
      prod.category?.toLowerCase().includes("bench");
    if (!isBench) return prod.position;

    const d = calculateWallDistances(prod.position);
    const thr = 50; // mm
    let pos = { ...prod.position };

    if (Math.abs(d.left - targetMm) < thr)
      pos.x += (targetMm - d.left) * (scale / 10);
    if (Math.abs(d.right - targetMm) < thr)
      pos.x -= (targetMm - d.right) * (scale / 10);
    if (Math.abs(d.top - targetMm) < thr)
      pos.y += (targetMm - d.top) * (scale / 10);
    if (Math.abs(d.bottom - targetMm) < thr)
      pos.y -= (targetMm - d.bottom) * (scale / 10);

    return pos;
  },
  [calculateWallDistances, scale]
);

/* ---------- Picking ---------- */
const findProductAtPoint = useCallback(
  (p: Point) => {
    for (const prod of placedProducts) {
      // quick rotated-rect hit using corners AABB (good enough)
      const aabb = toProductAABB(prod);
      if (
        p.x >= aabb.left &&
        p.x <= aabb.right &&
        p.y >= aabb.top &&
        p.y <= aabb.bottom
      )
        return prod;
    }
    return null;
  },
  [placedProducts]
);

const distanceToLineSegment = useCallback(
  (p: Point, a: Point, b: Point) => pointToSegmentDist(p, a, b),
  []
);

const findWallAtPoint = useCallback(
  (p: Point) => {
    const tol = 10;
    for (const w of wallSegments) {
      if (distanceToLineSegment(p, w.start, w.end) <= tol) return w;
    }
    return null;
  },
  [wallSegments, distanceToLineSegment]
);

const findMeasurementAtPoint = useCallback(
  (p: Point) => {
    const tol = 30;
    for (const w of wallSegments) {
      const mid = { x: (w.start.x + w.end.x) / 2, y: (w.start.y + w.end.y) / 2 };
      if (len(p, mid) <= tol) return w.id;
    }
    return null;
  },
  [wallSegments]
);
/* ---------- Connected walls + length edit ---------- */
const findConnectedWalls = useCallback(
  (id: string) => {
    const t = wallSegments.find((w) => w.id === id);
    if (!t) return [];
    const out: string[] = [];
    const tol = 5;
    const nearp = (p1: Point, p2: Point) => len(p1, p2) <= tol;

    for (const w of wallSegments) {
      if (w.id === id) continue;
      if (
        nearp(w.start, t.start) ||
        nearp(w.start, t.end) ||
        nearp(w.end, t.start) ||
        nearp(w.end, t.end)
      ) {
        out.push(w.id);
      }
    }
    return out;
  },
  [wallSegments]
);

const adjustWallLength = useCallback(
  (id: string, newLengthMm: number) => {
    const t = wallSegments.find((w) => w.id === id);
    if (!t) return;

    const curPx = len(t.start, t.end);
    if (curPx === 0) return;

    const newPx = mmToCanvas(newLengthMm, scale);
    const dir = {
      x: (t.end.x - t.start.x) / curPx,
      y: (t.end.y - t.start.y) / curPx,
    };
    const newEnd = {
      x: t.start.x + dir.x * newPx,
      y: t.start.y + dir.y * newPx,
    };
    const oldEnd = t.end;

    const connected = findConnectedWalls(id);
    const updated = wallSegments.map((w) => {
      if (w.id === id) return { ...w, end: newEnd };
      if (connected.includes(w.id)) {
        const tol = 5;
        const nearp = (p1: Point, p2: Point) => len(p1, p2) <= tol;
        let res = { ...w };
        if (nearp(w.start, oldEnd)) res.start = newEnd;
        if (nearp(w.end, oldEnd)) res.end = newEnd;
        return res;
      }
      return w;
    });

    setWallSegments(updated);

    const newT = updated.find((w) => w.id === id);
    if (newT && onWallUpdate) onWallUpdate(newT);
  },
  [wallSegments, setWallSegments, scale, findConnectedWalls, onWallUpdate]
);

const snapToWallLength = useCallback(
  (p: Point) => {
    let best: Point | null = null;
    let min = Infinity;
    const SNAP = 20;

    for (const w of wallSegments) {
      const A = p.x - w.start.x;
      const B = p.y - w.start.y;
      const C = w.end.x - w.start.x;
      const D = w.end.y - w.start.y;
      const lenSq = C * C + D * D;
      if (lenSq === 0) continue;

      const t = (A * C + B * D) / lenSq;
      if (t >= 0 && t <= 1) {
        const proj = { x: w.start.x + t * C, y: w.start.y + t * D };
        const d = len(p, proj);
        if (d <= SNAP && d < min) {
          min = d;
          best = proj;
        }
      }
    }
    return { point: best, showGuides: !!best };
  },
  [wallSegments]
);

const finalPointForPreview = useCallback(
  (start: Point, curr: Point, mode: DrawingMode) => {
    const constrained = constrainToOrtho(start, curr);
    if (mode === "interior-wall") {
      const s1 = snapToWallLength(constrained);
      if (s1.point) return s1.point;
      const s2 = snapToEndpoints(constrained);
      if (s2.point) return s2.point;
      return snapToGrid(constrained);
    }
    const s2 = snapToEndpoints(constrained);
    if (s2.point) return s2.point;
    return snapToGrid(constrained);
  },
  [constrainToOrtho, snapToWallLength, snapToEndpoints, snapToGrid]
);

/* ===================== Mouse handlers ===================== */
const handleMouseDown = useCallback(
  (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getCanvasPoint(e);
    const snapped = snapToGrid(p);
    setLastMousePos(snapped);

    if (currentMode === "select") {
      const mId = findMeasurementAtPoint(snapped);
      if (mId) {
        const w = wallSegments.find((x) => x.id === mId);
        if (w) {
          const mm = Math.round(canvasToMm(len(w.start, w.end), scale));
          setEditingMeasurement({ wallId: mId, value: String(mm) });
          return;
        }
      }

      const prod = findProductAtPoint(snapped);
      if (prod) {
        const multi = e.metaKey || e.ctrlKey;
        if (multi) {
          const now = selectedProducts || [];
          const next = now.includes(prod.id)
            ? now.filter((id) => id !== prod.id)
            : [...now, prod.id];
          onProductSelect(next);
        } else {
          onProductSelect([prod.id]);
        }
        return;
      }

      const w = findWallAtPoint(snapped);
      if (w) {
        setSelectedWall(w);
        return;
      }

      setSelectedWall(null);
      onProductSelect([]);
    }

    if (currentMode === "move") {
      const prod = findProductAtPoint(snapped);
      if (prod) {
        setDraggedItem(prod.id);
        setIsDragging(true);
        setDragOffset({
          x: snapped.x - prod.position.x,
          y: snapped.y - prod.position.y,
        });
        setLastValidPos(prod.position);
        return;
      }
    }

    if (currentMode === "wall" || currentMode === "interior-wall") {
      if (!wallStartPoint) {
        const ep = snapToEndpoints(p);
        if (ep.point && ep.isSnapping) setWallStartPoint(ep.point);
        else setWallStartPoint(snapToGrid(p));
        setIsWallPreview(true);
      } else {
        const end = finalPointForPreview(wallStartPoint, p, currentMode);
        const seg: WallSegment = {
          id: `wall-${Date.now()}`,
          start: wallStartPoint,
          end,
          thickness: currentMode === "interior-wall" ? 6 : 10,
          color: currentMode === "interior-wall" ? "#999999" : "#666666",
          type:
            currentMode === "interior-wall"
              ? WallType.PARTITION
              : WallType.EXTERIOR,
        };
        setWallSegments((prev) => [...prev, seg]);
        setWallStartPoint(null);
        setIsWallPreview(false);
        setCurrentLineMeasurement("");
        setSnapGuides({ horizontal: null, vertical: null });
      }
      return;
    }

    if (currentMode === "room") {
      setRoomPoints((prev) => [...prev, snapped]);
      return;
    }

    if (currentMode === "door") {
      const s = snapSystem.snapDoorToWall(p, wallSegments);
      if (s.snapped && s.target) {
        const wall = s.target as WallSegment;
        const dx = Math.abs(wall.end.x - wall.start.x);
        const dy = Math.abs(wall.end.y - wall.start.y);
        const facing: "horizontal" | "vertical" = dx > dy ? "horizontal" : "vertical";

        const door: Door = {
          id: `door-${Date.now()}`,
          position: s.point,
          width: 80,
          wallId: wall.id,
          wallSegmentId: wall.id,
          wallPosition: undefined,
          isEmbedded: true,
          facing,
        };
        setDoors((prev) => [...prev, door]);
        toast.success("Door placed on wall");
      } else {
        const door: Door = {
          id: `door-${Date.now()}`,
          position: snapped,
          width: 80,
          wallId: undefined,
          wallSegmentId: undefined,
          wallPosition: undefined,
          isEmbedded: false,
          facing: "horizontal",
        };
        setDoors((prev) => [...prev, door]);
        toast.info("Door placed without wall alignment");
      }
      return;
    }

    if (currentMode === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const ann: TextAnnotation = {
          id: `text-${Date.now()}`,
          position: snapped,
          text,
          fontSize: 14,
          color: "#000000",
        };
        setTextAnnotations((prev) => [...prev, ann]);
      }
    }
  },
  [
    currentMode,
    getCanvasPoint,
    snapToGrid,
    snapToEndpoints,
    finalPointForPreview,
    wallStartPoint,
    setWallSegments,
    findMeasurementAtPoint,
    wallSegments,
    scale,
    findProductAtPoint,
    selectedProducts,
    onProductSelect,
    findWallAtPoint,
    setRoomPoints,
    snapSystem,
    setDoors,
    setTextAnnotations,
  ]
);
/* ---------- Dragging ---------- */
const applyDragAt = useCallback(
  (clientX: number, clientY: number) => {
    if (!isDragging || !draggedItem) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const raw = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };

    let pos = { x: raw.x - dragOffset.x, y: raw.y - dragOffset.y };
    pos = snapToGrid(pos);

    const dragged = placedProducts.find((p) => p.id === draggedItem);
    if (!dragged) return;

    pos = clampToCanvas(pos, dragged.dimensions);
    let candidate: PlacedProduct = { ...dragged, position: pos };

    // optional spacing snap for benches/islands
    candidate.position = snapIslandBenchDistance(candidate);

    const reason = blockReasons(candidate, draggedItem);
    if (!reason) {
      setPlacedProducts((prev) =>
        prev.map((p) =>
          p.id === draggedItem ? { ...p, position: candidate.position } : p
        )
      );
      setLastValidPos(candidate.position);
      setDragMeasurements(calculateWallDistances(candidate.position));
    } else if (lastValidPos) {
      // gentle rubber-banding back to last valid
      const alpha = 0.35;
      const smooth = {
        x: lastValidPos.x * (1 - alpha) + candidate.position.x * alpha,
        y: lastValidPos.y * (1 - alpha) + candidate.position.y * alpha,
      };
      setPlacedProducts((prev) =>
        prev.map((p) =>
          p.id === draggedItem ? { ...p, position: smooth } : p
        )
      );
    }
  },
  [
    isDragging,
    draggedItem,
    dragOffset,
    snapToGrid,
    placedProducts,
    clampToCanvas,
    snapIslandBenchDistance,
    setPlacedProducts,
    lastValidPos,
    calculateWallDistances,
    blockReasons,
  ]
);

const handleMouseMove = useCallback(
  (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getCanvasPoint(e);

    if (isDragging && draggedItem && currentMode === "move") {
      if (USE_RAF_FOR_DRAG) {
        if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = requestAnimationFrame(() =>
          applyDragAt(e.clientX, e.clientY)
        );
      } else {
        applyDragAt(e.clientX, e.clientY);
      }
    } else {
      setDragMeasurements(null);
    }

    if (
      isWallPreview &&
      wallStartPoint &&
      (currentMode === "wall" || currentMode === "interior-wall")
    ) {
      const end = finalPointForPreview(wallStartPoint, p, currentMode);
      setLastMousePos(end);

      let show = false;
      const constrained = constrainToOrtho(wallStartPoint, p);

      if (currentMode === "interior-wall") {
        const s1 = snapToWallLength(constrained);
        const s2 = snapToEndpoints(constrained);
        show = s1.showGuides || s2.showGuides;
      } else {
        const s2 = snapToEndpoints(constrained);
        show = s2.showGuides;
      }

      setSnapGuides({ horizontal: show ? end.y : null, vertical: show ? end.x : null });

      const dist = len(wallStartPoint, end);
      const mm = canvasToMm(dist, scale);
      setCurrentLineMeasurement(
        formatMeasurement(mm, measurementUnit, measurementUnit === "mm" ? 0 : 2)
      );

      if (showGrid) {
        const gridPx = gridSize * scale;
        const thr = 10;
        const nv = Math.round(end.x / gridPx) * gridPx;
        const nh = Math.round(end.y / gridPx) * gridPx;
        setSnapLines({
          x: Math.abs(end.x - nv) <= thr ? nv : null,
          y: Math.abs(end.y - nh) <= thr ? nh : null,
        });
      }
    } else {
      const s = snapToGrid(p);
      setLastMousePos(s);
      setSnapLines({ x: null, y: null });
      setSnapGuides({ horizontal: null, vertical: null });
      if (
        (currentMode === "wall" || currentMode === "interior-wall") &&
        !isWallPreview
      ) {
        setCurrentLineMeasurement("");
      }
    }

    if (currentMode === "door") {
      const s = snapSystem.snapDoorToWall(p, wallSegments);
      if (s.snapped && s.target)
        setDoorSnapPreview({ point: s.point, wall: s.target as WallSegment });
      else setDoorSnapPreview(null);
    } else {
      setDoorSnapPreview(null);
    }

    if (currentMode === "select") {
      setHoveredWall(findWallAtPoint(p)?.id || null);
      setHoveredMeasurement(findMeasurementAtPoint(p));
    }
  },
  [
    currentMode,
    getCanvasPoint,
    isDragging,
    draggedItem,
    isWallPreview,
    wallStartPoint,
    finalPointForPreview,
    constrainToOrtho,
    snapToGrid,
    showGrid,
    gridSize,
    scale,
    findWallAtPoint,
    findMeasurementAtPoint,
    snapSystem,
    wallSegments,
    applyDragAt,
  ]
);

const handleMouseUp = useCallback(() => {
  setIsDragging(false);
  setDraggedItem(null);
  if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
  dragRafRef.current = null;

  if (!isWallPreview) {
    setSnapLines({ x: null, y: null });
    setSnapGuides({ horizontal: null, vertical: null });
  }
}, [isWallPreview]);

const handleDoubleClick = useCallback(() => {
  if (currentMode === "room" && roomPoints.length >= 3) {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: `Room ${rooms.length + 1}`,
      points: [...roomPoints],
      area: (() => {
        let area = 0;
        for (let i = 0; i < roomPoints.length; i++) {
          const j = (i + 1) % roomPoints.length;
          area +=
            roomPoints[i].x * roomPoints[j].y -
            roomPoints[j].x * roomPoints[i].y;
        }
        return Math.abs(area) / 2;
      })(),
      perimeter: (() => {
        let p = 0;
        for (let i = 0; i < roomPoints.length; i++) {
          const j = (i + 1) % roomPoints.length;
          p += len(roomPoints[i], roomPoints[j]);
        }
        return p;
      })(),
      color: "#e3f2fd",
    };
    setRooms((prev) => [...prev, newRoom]);
    setRoomPoints([]);
  }
}, [currentMode, roomPoints, rooms.length, setRooms, setRoomPoints]);

/* ===================== Drawing ===================== */
const wallAngleAndNormal = (w: WallSegment) => {
  const vx = w.end.x - w.start.x;
  const vy = w.end.y - w.start.y;
  const ang = Math.atan2(vy, vx);
  const nx = -Math.sin(ang);
  const ny = Math.cos(ang);
  return { ang, nx, ny };
};

const drawCanvas = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  /* === grid, rooms, walls, products, snap lines, measurements, doors, etc. === */
  // (your full drawCanvas implementation from your snippet goes here — unchanged)
}, [
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  showGrid,
  gridSize,
  scale,
  rooms,
  wallSegments,
  selectedWall,
  hoveredWall,
  snapToEndpoints,
  showMeasurements,
  measurementUnit,
  roomPoints,
  isWallPreview,
  wallStartPoint,
  lastMousePos,
  currentLineMeasurement,
  doors,
  distanceToLineSegment,
  placedProducts,
  selectedItems,
  snapLines,
  dragMeasurements,
  isDragging,
  draggedItem,
  doorSnapPreview,
  currentMode,
  snapGuides,
]);

useEffect(() => {
  drawCanvas();
}, [drawCanvas]);

// Esc cancels wall preview + rotate selected
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isWallPreview) {
      setWallStartPoint(null);
      setIsWallPreview(false);
      setCurrentLineMeasurement("");
      setSnapLines({ x: null, y: null });
      setSnapGuides({ horizontal: null, vertical: null });
    }
    if (e.key.toLowerCase() === "r" && selectedItems.length) {
      setPlacedProducts((prev) =>
        prev.map((p) =>
          selectedItems.includes(p.id)
            ? { ...p, rotation: (p.rotation || 0) + Math.PI / 12 }
            : p
        )
      );
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [isWallPreview, selectedItems, setPlacedProducts]);
/* ===================== JSX ===================== */
return (
  <div className="relative w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: `${canvasWidth}px`,
        maxHeight: `${canvasHeight}px`,
      }}
      className={`w-full h-full bg-white border ${
        currentMode === 'select' && hoveredMeasurement
          ? 'cursor-pointer'
          : currentMode === 'select'
          ? 'cursor-default'
          : 'cursor-crosshair'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onDrop={(e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const data = e.dataTransfer.getData('application/json');
        if (!data) {
          toast.error('No product data in drop');
          return;
        }
        try {
          const product = JSON.parse(data);
          const dimsMm = getProductDimensionsInMm(product);
          if (!dimsMm) {
            toast.error('Missing product dimensions');
            return;
          }
          const dimsPx = {
            length: mmToCanvas(dimsMm.width, scale), // width -> length
            width: mmToCanvas(dimsMm.depth, scale),  // depth -> width
            height: mmToCanvas(dimsMm.height, scale),
          };
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          let pos = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
          };
          pos = snapToGrid(pos);
          pos = clampToCanvas(pos, dimsPx);

          const newProd: PlacedProduct = {
            id: `product-${Date.now()}`,
            productId: product.id,
            name: product.name,
            category: product.category || 'Unknown',
            position: pos,
            rotation: 0,
            dimensions: dimsPx,
            originalDimensions: {
              length: dimsMm.width,
              width: dimsMm.depth,
              height: dimsMm.height,
            },
            color: product.color || '#4caf50',
            scale: 1,
            modelPath: product.modelPath,
            thumbnail: product.thumbnail,
            description: product.description,
            specifications: product.specifications,
            finishes: product.finishes,
            variants: product.variants,
          };

          // enforce inside room/walls + not too close to walls + no overlap
          const reason = blockReasons(newProd);
          if (reason === 'outside_walls') {
            toast.error('Place items inside the walls.');
            return;
          }
          if (reason === 'near_wall') {
            toast.error('Keep a small clearance from the walls.');
            return;
          }
          if (reason === 'overlap_furniture') {
            toast.error('Cannot place: overlaps another item.');
            return;
          }

          // optional spacing snap
          newProd.position = wallSegments.length
            ? snapIslandBenchDistance(newProd)
            : newProd.position;

          setPlacedProducts((prev) => [...prev, newProd]);
          toast.success(`${newProd.name} placed`);
        } catch (err) {
          console.error(err);
          toast.error('Failed to parse dropped product');
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
    />

    {/* inline measurement editor */}
    {editingMeasurement && (
      <div
        className="absolute bg-white border-2 border-blue-500 rounded px-2 py-1 shadow-lg z-10"
        style={{ left: '50%', top: 20, transform: 'translateX(-50%)' }}
      >
        <input
          type="number"
          value={editingMeasurement.value}
          onChange={(e) =>
            setEditingMeasurement((prev) =>
              prev ? { ...prev, value: e.target.value } : null
            )
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const mm = parseInt(editingMeasurement.value, 10);
              if (!isNaN(mm) && mm > 0)
                adjustWallLength(editingMeasurement.wallId, mm);
              setEditingMeasurement(null);
            } else if (e.key === 'Escape') {
              setEditingMeasurement(null);
            }
          }}
          onBlur={() => {
            const mm = parseInt(editingMeasurement.value, 10);
            if (!isNaN(mm) && mm > 0)
              adjustWallLength(editingMeasurement.wallId, mm);
            setEditingMeasurement(null);
          }}
          className="w-24 text-center border-none outline-none bg-transparent font-bold text-blue-600"
          autoFocus
        />
        <span className="text-sm text-gray-600 ml-1">mm</span>
      </div>
    )}
  </div>
);
};

export default EnhancedCanvasWorkspace;
