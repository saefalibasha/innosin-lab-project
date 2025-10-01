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
import { wallsToPolygon, pointInPolygon, rectInsidePolygon, getWallMidpoints, findClosestWallMidpoint, isValidFloorPolygon } from '@/utils/polygonUtils';
import { toast } from 'sonner';
import ProductCornerDots from './ProductCornerDots';
import WallLengthEditor from '../floorplan/WallLengthEditor';

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

const PRODUCT_CLEARANCE_MM = 0; // Allow seamless adjacency for 4-corner snapping
const WALL_CLEARANCE_MM = 10;    // min gap to walls
const USE_RAF_FOR_DRAG = true;

/* ===================== Math helpers ===================== */

const len = (a: Point, b: Point) =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const dot = (ax:number, ay:number, bx:number, by:number) => ax*bx + ay*by;

const rot = (x:number, y:number, ang:number) => ({
  x: x*Math.cos(ang) - y*Math.sin(ang),
  y: x*Math.sin(ang) + y*Math.cos(ang),
});

const toAABB = (pts: Point[]) => {
  let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
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

const pointToSegmentDist = (p:Point, a:Point, b:Point) => {
  const vx = b.x - a.x, vy = b.y - a.y;
  const wx = p.x - a.x, wy = p.y - a.y;
  const c1 = dot(wx, wy, vx, vy);
  if (c1 <= 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const c2 = dot(vx, vy, vx, vy);
  if (c2 <= c1) return Math.hypot(p.x - b.x, p.y - b.y);
  const t = c1 / c2;
  const proj = { x: a.x + t*vx, y: a.y + t*vy };
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
  const hx = length/2, hy = width/2;
  const ptsLocal = [
    {x:-hx, y:-hy}, {x:hx, y:-hy}, {x:hx, y:hy}, {x:-hx, y:hy}
  ];
  const pts = ptsLocal.map(pt => {
    const r = rot(pt.x, pt.y, rotation||0);
    return { x: center.x + r.x, y: center.y + r.y };
  });

  const edges = [
    [pts[0], pts[1]], [pts[1], pts[2]],
    [pts[2], pts[3]], [pts[3], pts[0]],
  ] as Array<[Point,Point]>;

  let min = Infinity;
  for (const v of pts) min = Math.min(min, pointToSegmentDist(v, segA, segB));
  for (const [a,b] of edges) {
    min = Math.min(min, pointToSegmentDist(segA, a, b));
    min = Math.min(min, pointToSegmentDist(segB, a, b));
  }
  return min;
};

const productCorners = (p:PlacedProduct): Point[] => {
  const L = p.dimensions.length ?? 40;
  const W = p.dimensions.width ?? 30;
  const hx = L/2, hy = W/2;
  const ptsLocal = [
    {x:-hx, y:-hy}, {x:hx, y:-hy}, {x:hx, y:hy}, {x:-hx, y:hy}
  ];
  return ptsLocal.map(pt => {
    const r = rot(pt.x, pt.y, p.rotation || 0);
    return { x: p.position.x + r.x, y: p.position.y + r.y };
  });
};

const toProductAABB = (p: PlacedProduct) => toAABB(productCorners(p));

/* ---------- polygon helpers (keep inside the main walls) ---------- */

const near = (a:Point, b:Point, eps=1e-3) => Math.hypot(a.x-b.x, a.y-b.y) < eps;

// (moved snapping helpers into component scope)

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
      snapDistance: 40, // Increased for easier snapping
      strength: 'strong', // Stronger snapping behavior
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

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

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

  // Helper functions inside component scope
  const snapToWallMidpoint = useCallback(
    (point: Point): Point => {
      // For interior-wall mode, snap to any point along wall centerlines
      if (currentMode === 'interior-wall') {
        let closestPoint = null;
        let minDistance = Infinity;
        
        wallSegments.forEach(wall => {
          // Project point onto wall line to find closest point on wall
          const wallVector = { x: wall.end.x - wall.start.x, y: wall.end.y - wall.start.y };
          const wallLength = Math.sqrt(wallVector.x * wallVector.x + wallVector.y * wallVector.y);
          
          if (wallLength > 0) {
            const unitVector = { x: wallVector.x / wallLength, y: wallVector.y / wallLength };
            const toPoint = { x: point.x - wall.start.x, y: point.y - wall.start.y };
            
            // Project onto wall line
            const projection = toPoint.x * unitVector.x + toPoint.y * unitVector.y;
            const clampedProjection = Math.max(0, Math.min(wallLength, projection));
            
            const projectedPoint = {
              x: wall.start.x + unitVector.x * clampedProjection,
              y: wall.start.y + unitVector.y * clampedProjection
            };
            
            const distance = Math.sqrt(
              Math.pow(point.x - projectedPoint.x, 2) + 
              Math.pow(point.y - projectedPoint.y, 2)
            );
            
            if (distance < 80 && distance < minDistance) { // Increased snap range
              minDistance = distance;
              closestPoint = projectedPoint;
            }
          }
        });
        
        return closestPoint || point;
      }
      // For other modes, use standard distance threshold
      const closestMidpoint = findClosestWallMidpoint(point, wallSegments, 75); // Increased for easier snapping
      return closestMidpoint ? closestMidpoint.point : point;
    },
    [wallSegments, currentMode]
  );

  const snapProductToProducts = useCallback(
    (candidate: PlacedProduct, others: PlacedProduct[]): Point => {
      const threshold = 25; // Increased for easier snapping
      let bestSnap: Point | null = null;
      let bestDistance = threshold;

      const candidateCorners = productCorners(candidate);

      for (const other of others) {
        if (other.id === candidate.id) continue;

        const otherCorners = productCorners(other);

        for (const candidateCorner of candidateCorners) {
          for (const otherCorner of otherCorners) {
            const dx = candidateCorner.x - candidate.position.x;
            const dy = candidateCorner.y - candidate.position.y;
            const distance = len(candidateCorner, otherCorner);
            if (distance < bestDistance) {
              bestDistance = distance;
              bestSnap = { x: otherCorner.x - dx, y: otherCorner.y - dy };
            }
          }
        }

        const otherL = other.dimensions.length ?? 40;
        const otherW = other.dimensions.width ?? 30;
        const candidateL = candidate.dimensions.length ?? 40;
        const candidateW = candidate.dimensions.width ?? 30;

        const rightEdge = other.position.x + otherL / 2;
        const leftEdge = other.position.x - otherL / 2;
        const candidateLeft = candidate.position.x - candidateL / 2;
        const candidateRight = candidate.position.x + candidateL / 2;

        const rightSnapX = rightEdge + candidateL / 2;
        const rightDist = Math.abs(candidateLeft - rightEdge);
        if (
          rightDist < bestDistance &&
          Math.abs(candidate.position.y - other.position.y) < candidateW / 2 + otherW / 2
        ) {
          bestDistance = rightDist;
          bestSnap = { x: rightSnapX, y: candidate.position.y };
        }

        const leftSnapX = leftEdge - candidateL / 2;
        const leftDist = Math.abs(candidateRight - leftEdge);
        if (
          leftDist < bestDistance &&
          Math.abs(candidate.position.y - other.position.y) < candidateW / 2 + otherW / 2
        ) {
          bestDistance = leftDist;
          bestSnap = { x: leftSnapX, y: candidate.position.y };
        }
      }

      return bestSnap || candidate.position;
    },
    []
  );

  const findWallEndpoints = useCallback((): Point[] => {
    const out: Point[] = [];
    wallSegments.forEach((w) => out.push(w.start, w.end));
    return out;
  }, [wallSegments]);

  const snapToEndpoints = useCallback(
    (p: Point): { point: Point | null; showGuides: boolean; isSnapping: boolean } => {
      const SNAP = 80; // Increased for easier endpoint snapping
      for (const ep of findWallEndpoints()) {
        if (len(p, ep) <= SNAP) return { point: ep, showGuides: true, isSnapping: true };
      }
      return { point: null, showGuides: false, isSnapping: false };
    },
    [findWallEndpoints]
  );

  const constrainToOrtho = useCallback((start: Point, p: Point): Point => {
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    return Math.abs(dx) > Math.abs(dy) ? { x: p.x, y: start.y } : { x: start.x, y: p.y };
  }, []);

  /* ---------- Robust wall + inside-room checks ---------- */

  const outerPolygon = useCallback(() => {
    // prefer a drawn room polygon if present; else derive from walls using shared utils
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
        const d = rectToSegmentMinDist(prod.position, L, W, prod.rotation || 0, w.start, w.end);
        if (d < need) return true;
      }
      return false;
    },
    [wallSegments, scale]
  );

  const rectOutsideWalls = useCallback(
    (prod:PlacedProduct): boolean => {
      const poly = outerPolygon();
      // Allow placement when no valid polygon exists (no walls or invalid wall configuration)
      if (!poly || poly.length < 3) return false;
      // require center and all corners be inside polygon
      if (!pointInPolygon(prod.position, poly)) return true;
      const corners = productCorners(prod);
      return !corners.every((c) => pointInPolygon(c, poly));
    },
    [outerPolygon]
  );

  const collidesWithFurniture = useCallback(
    (prod: PlacedProduct, exceptId?: string): boolean => {
      const pad = 0; // Allow seamless adjacency for snapping
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

  const blockReasons = useCallback((candidate:PlacedProduct, exceptId?:string) => {
    // Check furniture collisions first (always applies)
    if (collidesWithFurniture(candidate, exceptId)) return 'overlap_furniture';
    
    // If no walls exist, allow placement anywhere
    if (wallSegments.length === 0) return null;
    
    // Check if walls form a valid closed polygon for a floor
    if (!isValidFloorPolygon(wallSegments)) {
      return 'incomplete_floor'; // Special case for incomplete floor
    }
    
    // With valid floor, enforce inside placement and wall clearance
    if (rectOutsideWalls(candidate)) return 'outside_walls';
    if (rectTooCloseToAnyWall(candidate)) return 'near_wall';
    
    return null;
  }, [rectOutsideWalls, rectTooCloseToAnyWall, collidesWithFurniture, wallSegments]);

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
        const horiz = Math.abs(w.start.y - w.end.y) < Math.abs(w.start.x - w.end.x);
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
        prod.name?.toLowerCase().includes('bench') ||
        prod.name?.toLowerCase().includes('island') ||
        prod.category?.toLowerCase().includes('bench');
      if (!isBench) return prod.position;

      const d = calculateWallDistances(prod.position);
      const thr = 50; // mm
      let pos = { ...prod.position };
      if (Math.abs(d.left - targetMm) < thr) pos.x += (targetMm - d.left) * (scale / 10);
      if (Math.abs(d.right - targetMm) < thr) pos.x -= (targetMm - d.right) * (scale / 10);
      if (Math.abs(d.top - targetMm) < thr) pos.y += (targetMm - d.top) * (scale / 10);
      if (Math.abs(d.bottom - targetMm) < thr) pos.y -= (targetMm - d.bottom) * (scale / 10);
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
        if (p.x >= aabb.left && p.x <= aabb.right && p.y >= aabb.top && p.y <= aabb.bottom) return prod;
      }
      return null;
    },
    [placedProducts]
  );

  const distanceToLineSegment = useCallback((p: Point, a: Point, b: Point) => pointToSegmentDist(p,a,b), []);

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
        if (nearp(w.start, t.start) || nearp(w.start, t.end) || nearp(w.end, t.start) || nearp(w.end, t.end)) {
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
      const dir = { x: (t.end.x - t.start.x) / curPx, y: (t.end.y - t.start.y) / curPx };
      const newEnd = { x: t.start.x + dir.x * newPx, y: t.start.y + dir.y * newPx };
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
      if (mode === 'interior-wall') {
        // For interior walls, prioritize wall midpoints first
        const midpointSnap = snapToWallMidpoint(constrained);
        if (midpointSnap !== constrained) return midpointSnap;
        
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
    [constrainToOrtho, snapToWallLength, snapToEndpoints, snapToGrid, snapToWallMidpoint]
  );

  /* ===================== Mouse handlers ===================== */

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const p = getCanvasPoint(e);
      const snapped = snapToGrid(p);
      setLastMousePos(snapped);

      if (currentMode === 'select') {
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
            const next = now.includes(prod.id) ? now.filter((id) => id !== prod.id) : [...now, prod.id];
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

      if (currentMode === 'move') {
        const prod = findProductAtPoint(snapped);
        if (prod) {
          setDraggedItem(prod.id);
          setIsDragging(true);
          setDragOffset({ x: snapped.x - prod.position.x, y: snapped.y - prod.position.y });
          setLastValidPos(prod.position);
          return;
        }
      }

      if (currentMode === 'wall' || currentMode === 'interior-wall') {
        if (!wallStartPoint) {
          // For interior walls, prioritize wall midpoints
          if (currentMode === 'interior-wall') {
            const midpointSnap = snapToWallMidpoint(p);
            if (midpointSnap !== p) {
              setWallStartPoint(midpointSnap);
            } else {
              const ep = snapToEndpoints(p);
              if (ep.point && ep.isSnapping) setWallStartPoint(ep.point);
              else setWallStartPoint(snapToGrid(p));
            }
          } else {
            const ep = snapToEndpoints(p);
            if (ep.point && ep.isSnapping) setWallStartPoint(ep.point);
            else setWallStartPoint(snapToGrid(p));
          }
          setIsWallPreview(true);
        } else {
          const end = finalPointForPreview(wallStartPoint, p, currentMode);
          const seg: WallSegment = {
            id: `wall-${Date.now()}`,
            start: wallStartPoint,
            end,
            thickness: currentMode === 'interior-wall' ? 6 : 10,
            color: currentMode === 'interior-wall' ? '#999999' : '#666666',
            type: currentMode === 'interior-wall' ? WallType.PARTITION : WallType.EXTERIOR,
          };
          setWallSegments((prev) => [...prev, seg]);
          setWallStartPoint(null);
          setIsWallPreview(false);
          setCurrentLineMeasurement('');
          setSnapGuides({ horizontal: null, vertical: null });
        }
        return;
      }

      if (currentMode === 'room') {
        setRoomPoints((prev) => [...prev, snapped]);
        return;
      }

      if (currentMode === 'door') {
        const s = snapSystem.snapDoorToWall(p, wallSegments);
        if (s.snapped && s.target) {
          const wall = s.target as WallSegment;
          const dx = Math.abs(wall.end.x - wall.start.x);
          const dy = Math.abs(wall.end.y - wall.start.y);
          const facing: 'horizontal' | 'vertical' = dx > dy ? 'horizontal' : 'vertical';
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
          toast.success('Door placed on wall');
        } else {
          const door: Door = {
            id: `door-${Date.now()}`,
            position: snapped,
            width: 80,
            wallId: undefined,
            wallSegmentId: undefined,
            wallPosition: undefined,
            isEmbedded: false,
            facing: 'horizontal',
          };
          setDoors((prev) => [...prev, door]);
          toast.info('Door placed without wall alignment');
        }
        return;
      }

      if (currentMode === 'text') {
        const text = prompt('Enter text:');
        if (text) {
          const ann: TextAnnotation = {
            id: `text-${Date.now()}`,
            position: snapped,
            text,
            fontSize: 14,
            color: '#000000',
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
      const raw = { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };

      let pos = { x: raw.x - dragOffset.x, y: raw.y - dragOffset.y };
      pos = snapToGrid(pos);

      const dragged = placedProducts.find((p) => p.id === draggedItem);
      if (!dragged) return;

      pos = clampToCanvas(pos, dragged.dimensions);

      let candidate: PlacedProduct = { ...dragged, position: pos };

      // Apply four-corner product snapping first
      candidate.position = snapProductToProducts(candidate, placedProducts);

      // optional spacing snap for benches/islands
      candidate.position = snapIslandBenchDistance(candidate);

      const reason = blockReasons(candidate, draggedItem);

      if (!reason) {
        setPlacedProducts((prev) => prev.map((p) => (p.id === draggedItem ? { ...p, position: candidate.position } : p)));
        setLastValidPos(candidate.position);
        setDragMeasurements(calculateWallDistances(candidate.position));
      } else if (lastValidPos) {
        // gentle rubber-banding back to last valid
        const alpha = 0.35;
        const smooth = {
          x: lastValidPos.x * (1 - alpha) + candidate.position.x * alpha,
          y: lastValidPos.y * (1 - alpha) + candidate.position.y * alpha,
        };
        setPlacedProducts((prev) => prev.map((p) => (p.id === draggedItem ? { ...p, position: smooth } : p)));
      }
    },
    [
      isDragging,
      draggedItem,
      dragOffset,
      snapToGrid,
      placedProducts,
      clampToCanvas,
      snapProductToProducts,
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

      if (isDragging && draggedItem && currentMode === 'move') {
        if (USE_RAF_FOR_DRAG) {
          if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
          dragRafRef.current = requestAnimationFrame(() => applyDragAt(e.clientX, e.clientY));
        } else {
          applyDragAt(e.clientX, e.clientY);
        }
      } else {
        setDragMeasurements(null);
      }

      if (isWallPreview && wallStartPoint && (currentMode === 'wall' || currentMode === 'interior-wall')) {
        const end = finalPointForPreview(wallStartPoint, p, currentMode);
        setLastMousePos(end);

        let show = false;
        const constrained = constrainToOrtho(wallStartPoint, p);
        if (currentMode === 'interior-wall') {
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
        setCurrentLineMeasurement(formatMeasurement(mm, measurementUnit, measurementUnit === 'mm' ? 0 : 2));

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
        if ((currentMode === 'wall' || currentMode === 'interior-wall') && !isWallPreview) {
          setCurrentLineMeasurement('');
        }
      }

      if (currentMode === 'door') {
        const s = snapSystem.snapDoorToWall(p, wallSegments);
        if (s.snapped && s.target) setDoorSnapPreview({ point: s.point, wall: s.target as WallSegment });
        else setDoorSnapPreview(null);
      } else {
        setDoorSnapPreview(null);
      }

      if (currentMode === 'select') {
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
    if (currentMode === 'room' && roomPoints.length >= 3) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: `Room ${rooms.length + 1}`,
        points: [...roomPoints],
        area: (() => {
          let area = 0;
          for (let i = 0; i < roomPoints.length; i++) {
            const j = (i + 1) % roomPoints.length;
            area += roomPoints[i].x * roomPoints[j].y - roomPoints[j].x * roomPoints[i].y;
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
        color: '#e3f2fd',
      };
      setRooms((prev) => [...prev, newRoom]);
      setRoomPoints([]);
    }
  }, [currentMode, roomPoints, rooms.length, setRooms, setRoomPoints]);

  /* ===================== Drawing ===================== */

  const wallAngleAndNormal = (w:WallSegment) => {
    const vx = w.end.x - w.start.x;
    const vy = w.end.y - w.start.y;
    const ang = Math.atan2(vy, vx);
    const nx = -Math.sin(ang);
    const ny =  Math.cos(ang);
    return { ang, nx, ny };
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // grid
    if (showGrid) {
      const g = gridSize * scale;
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= CANVAS_WIDTH; x += g) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += g) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
      // major
      const mg = g * 5;
      ctx.strokeStyle = '#d1d1d1';
      ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_WIDTH; x += mg) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += mg) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }

    // rooms
    rooms.forEach((r) => {
      if (r.points.length >= 3) {
        ctx.fillStyle = r.color;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(r.points[0].x, r.points[0].y);
        r.points.slice(1).forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });

    // walls + dimension (upright, larger)
    wallSegments.forEach((w) => {
      const isSel = selectedWall?.id === w.id;
      const isHov = hoveredWall === w.id;

      ctx.strokeStyle = isSel ? '#ff4444' : isHov ? '#ffaa00' : w.color;
      ctx.lineWidth = (w.thickness ?? 10) + (isSel ? 4 : isHov ? 2 : 0);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(w.start.x, w.start.y);
      ctx.lineTo(w.end.x, w.end.y);
      ctx.stroke();

      // endpoints
      [w.start, w.end].forEach((pt) => {
        const snap = snapToEndpoints(pt);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? '#ff4444' : isHov ? '#ffaa00' : snap.isSnapping ? '#ef4444' : '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // dimension label (parallel to wall, never upside-down)
      if (showMeasurements) {
        const d = len(w.start, w.end);
        const mm = canvasToMm(d, scale);
        const txt = formatMeasurement(mm, measurementUnit, measurementUnit === 'mm' ? 0 : 2);

        const { ang, nx, ny } = wallAngleAndNormal(w);

        // choose outward side away from room center if we have one
        let dir = 1;
        if (rooms.length && rooms[0].points.length) {
          const mid = { x:(w.start.x+w.end.x)/2, y:(w.start.y+w.end.y)/2 };
          const room = rooms[0];
          const cx = room.points.reduce((s,p)=>s+p.x,0)/room.points.length;
          const cy = room.points.reduce((s,p)=>s+p.y,0)/room.points.length;
          const vx = mid.x - cx, vy = mid.y - cy;
          dir = (vx*nx + vy*ny) > 0 ? 1 : -1;
        }

        const offset = (w.thickness ?? 10) * 1.2 + 22;
        const mid = { x: (w.start.x + w.end.x)/2 + nx*offset*dir, y: (w.start.y + w.end.y)/2 + ny*offset*dir };

        // keep text upright
        let textAng = ang;
        if (textAng > Math.PI/2 || textAng < -Math.PI/2) textAng += Math.PI;

        ctx.save();
        ctx.translate(mid.x, mid.y);
        ctx.rotate(textAng);

        // leader ticks
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4,2]);
        ctx.beginPath();
        ctx.moveTo(-d/2, 0);
        ctx.lineTo(-d/2, (offset*0.6)*(-dir));
        ctx.moveTo( d/2, 0);
        ctx.lineTo( d/2, (offset*0.6)*(-dir));
        ctx.stroke();
        ctx.setLineDash([]);

        // label box (bigger font)
        ctx.font = 'bold 28px Arial';
        const tw = ctx.measureText(txt).width;
        const pad = 8;
        ctx.fillStyle = 'rgba(255,255,255,0.96)';
        ctx.strokeStyle = isSel ? '#ff4444' : isHov ? '#3b82f6' : '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(-tw/2 - pad, -18, tw + pad*2, 34);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, 0, -1);
        ctx.restore();
      }
    });

    // Draw red dots at wall midpoints for interior wall snapping
    const wallMidpoints = getWallMidpoints(wallSegments);
    wallMidpoints.forEach((midpoint) => {
      ctx.beginPath();
      ctx.arc(midpoint.x, midpoint.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0000';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // active room polyline
    if (roomPoints.length > 0) {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
      roomPoints.slice(1).forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
      roomPoints.forEach((pt) => {
        ctx.fillStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // wall preview
    if (isWallPreview && wallStartPoint) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(wallStartPoint.x, wallStartPoint.y);
      ctx.lineTo(lastMousePos.x, lastMousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // endpoints
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(wallStartPoint.x, wallStartPoint.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(lastMousePos.x, lastMousePos.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // doors
    doors.forEach((door) => {
      const x = door.position.x;
      const y = door.position.y;

      let nearest: WallSegment | null = null;
      let min = Infinity;
      for (const w of wallSegments) {
        const d = distanceToLineSegment(door.position, w.start, w.end);
        if (d < min) { min = d; nearest = w; }
      }
      
      const wth = nearest?.thickness ?? 10;
      const doorTh = Math.max(wth * 0.7, 6);
      const doorW = Math.min(Math.max(door.width, 60), 120);

      // Calculate wall angle for proper door alignment
      let wallAngle = 0;
      if (nearest) {
        wallAngle = Math.atan2(nearest.end.y - nearest.start.y, nearest.end.x - nearest.start.x);
      }
      
      // Check if wall is more horizontal or vertical
      const isWallHorizontal = Math.abs(Math.cos(wallAngle)) > Math.abs(Math.sin(wallAngle));
      
      // Door should be perpendicular to wall
      const rw = isWallHorizontal ? doorTh : doorW;
      const rh = isWallHorizontal ? doorW : doorTh;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(wallAngle + (isWallHorizontal ? Math.PI / 2 : 0));
      
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 1;
      ctx.strokeRect(-rw / 2, -rh / 2, rw, rh);
      
      ctx.restore();
    });

    // text annotations
    textAnnotations.forEach((t) => {
      ctx.fillStyle = t.color;
      ctx.font = `${t.fontSize}px Arial`;
      ctx.fillText(t.text, t.position.x, t.position.y);
    });

    // furniture
    placedProducts.forEach((prod) => {
      ctx.save();
      ctx.translate(prod.position.x, prod.position.y);
      ctx.rotate(prod.rotation || 0);

      const L = prod.dimensions.length ?? 40;
      const W = prod.dimensions.width ?? 30;

      ctx.fillStyle = prod.color || '#4caf50';
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 2;
      ctx.fillRect(-L / 2, -W / 2, L, W);
      ctx.strokeRect(-L / 2, -W / 2, L, W);

      if (selectedItems?.includes(prod.id)) {
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(-L / 2 - 5, -W / 2 - 5, L + 10, W + 10);
        
        // Draw corner snapping dots
        const corners = [
          { x: -L / 2, y: -W / 2 }, // top-left
          { x: L / 2, y: -W / 2 },  // top-right
          { x: L / 2, y: W / 2 },   // bottom-right
          { x: -L / 2, y: W / 2 }   // bottom-left
        ];
        
        corners.forEach(corner => {
          ctx.fillStyle = '#2563eb';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(corner.x, corner.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });

        ctx.fillStyle = '#ff4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(L / 2 + 20, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });

    // rotation hint
    if (selectedItems?.length) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      const hint = `Press R to rotate selected products (${selectedItems.length})`;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      const tw = ctx.measureText(hint).width;
      ctx.fillRect(CANVAS_WIDTH / 2 - tw / 2 - 10, 10, tw + 20, 25);
      ctx.fillStyle = '#fff';
      ctx.fillText(hint, CANVAS_WIDTH / 2, 28);
      ctx.textAlign = 'start';
    }

    // snap lines
    if (snapLines.x !== null || snapLines.y !== null) {
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      if (snapLines.x !== null) {
        ctx.beginPath();
        ctx.moveTo(snapLines.x, 0);
        ctx.lineTo(snapLines.x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      if (snapLines.y !== null) {
        ctx.beginPath();
        ctx.moveTo(0, snapLines.y);
        ctx.lineTo(CANVAS_WIDTH, snapLines.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // live drag measures
    if (dragMeasurements && isDragging && draggedItem) {
      const prod = placedProducts.find((p) => p.id === draggedItem);
      if (prod) {
        const pos = prod.position;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';

        if (dragMeasurements.top > 0) {
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y - 50);
          ctx.lineTo(pos.x, pos.y - (dragMeasurements.top * scale) / 10);
          ctx.stroke();
          ctx.fillText(`${dragMeasurements.top}mm`, pos.x, pos.y - 60);
        }
        if (dragMeasurements.right > 0) {
          ctx.beginPath();
          ctx.moveTo(pos.x + 50, pos.y);
          ctx.lineTo(pos.x + (dragMeasurements.right * scale) / 10, pos.y);
          ctx.stroke();
        }
        if (dragMeasurements.bottom > 0) {
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y + 50);
          ctx.lineTo(pos.x, pos.y + (dragMeasurements.bottom * scale) / 10);
          ctx.stroke();
          ctx.fillText(`${dragMeasurements.bottom}mm`, pos.x, pos.y + 70);
        }
        if (dragMeasurements.left > 0) {
          ctx.beginPath();
          ctx.moveTo(pos.x - 50, pos.y);
          ctx.lineTo(pos.x - (dragMeasurements.left * scale) / 10, pos.y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
    }

    // door snap preview
    if (doorSnapPreview && currentMode === 'door') {
      const { point, wall } = doorSnapPreview;
      ctx.strokeStyle = 'rgba(16,185,129,0.8)';
      ctx.lineWidth = 6;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(16,185,129,0.6)';
      ctx.strokeStyle = 'rgb(16,185,129)';
      ctx.lineWidth = 2;
      ctx.fillRect(point.x - 40, point.y - 6, 80, 12);
      ctx.strokeRect(point.x - 40, point.y - 6, 80, 12);
    }

    // snap guides
    if (snapGuides.vertical !== null || snapGuides.horizontal !== null) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      if (snapGuides.vertical !== null) {
        ctx.beginPath();
        ctx.moveTo(snapGuides.vertical, 0);
        ctx.lineTo(snapGuides.vertical, CANVAS_HEIGHT);
        ctx.stroke();
      }
      if (snapGuides.horizontal !== null) {
        ctx.beginPath();
        ctx.moveTo(0, snapGuides.horizontal);
        ctx.lineTo(CANVAS_WIDTH, snapGuides.horizontal);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // live wall measure during preview
    if (isWallPreview && wallStartPoint && currentLineMeasurement) {
      const vx = lastMousePos.x - wallStartPoint.x;
      const vy = lastMousePos.y - wallStartPoint.y;
      let ang = Math.atan2(vy, vx);
      if (ang > Math.PI/2 || ang < -Math.PI/2) ang += Math.PI;

      const nx = -Math.sin(ang), ny = Math.cos(ang);
      const offset = 24;
      const mid = { x:(wallStartPoint.x+lastMousePos.x)/2 + nx*offset, y:(wallStartPoint.y+lastMousePos.y)/2 + ny*offset };

      ctx.save();
      ctx.translate(mid.x, mid.y);
      ctx.rotate(ang);
      ctx.font = 'bold 28px Arial';
      const tw = ctx.measureText(currentLineMeasurement).width;
      const pad = 8;
      ctx.fillStyle = 'rgba(239,68,68,0.95)';
      ctx.fillRect(-tw/2 - pad, -18, tw + pad*2, 34);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentLineMeasurement, 0, -1);
      ctx.restore();
    }
  }, [
    CANVAS_WIDTH, CANVAS_HEIGHT, showGrid, gridSize, scale, rooms, wallSegments,
    selectedWall, hoveredWall, snapToEndpoints, showMeasurements, measurementUnit,
    roomPoints, isWallPreview, wallStartPoint, lastMousePos, currentLineMeasurement,
    doors, distanceToLineSegment, placedProducts, selectedItems, snapLines,
    dragMeasurements, isDragging, draggedItem, doorSnapPreview, currentMode, snapGuides
  ]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  // Esc cancels wall preview + rotate selected
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWallPreview) {
        setWallStartPoint(null);
        setIsWallPreview(false);
        setCurrentLineMeasurement('');
        setSnapLines({ x: null, y: null });
        setSnapGuides({ horizontal: null, vertical: null });
      }
      if (e.key.toLowerCase() === 'r' && selectedItems.length) {
        setPlacedProducts((prev) =>
          prev.map((p) =>
            selectedItems.includes(p.id) ? { ...p, rotation: (p.rotation || 0) + Math.PI / 12 } : p
          )
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isWallPreview, selectedItems, setPlacedProducts]);

  /* ===================== JSX ===================== */

  return (
    <div className="relative w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ width: '100%', height: '100%', maxWidth: `${canvasWidth}px`, maxHeight: `${canvasHeight}px` }}
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
              originalDimensions: { length: dimsMm.width, width: dimsMm.depth, height: dimsMm.height },
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
            if (reason === 'incomplete_floor') { 
              toast.error('Complete the walls to place products inside the room.'); 
              return; 
            }
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
            newProd.position = wallSegments.length ? snapIslandBenchDistance(newProd) : newProd.position;

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
              setEditingMeasurement((prev) => (prev ? { ...prev, value: e.target.value } : null))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const mm = parseInt(editingMeasurement.value, 10);
                if (!isNaN(mm) && mm > 0) adjustWallLength(editingMeasurement.wallId, mm);
                setEditingMeasurement(null);
              } else if (e.key === 'Escape') {
                setEditingMeasurement(null);
              }
            }}
            onBlur={() => {
              const mm = parseInt(editingMeasurement.value, 10);
              if (!isNaN(mm) && mm > 0) adjustWallLength(editingMeasurement.wallId, mm);
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
