import React, { useRef, useEffect, useState, useCallback, useRef as useRef2 } from 'react';
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

/* ───────────────────────────────── constants ───────────────────────────────── */

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

const PRODUCT_CLEARANCE_MM = 20;
const WALL_CLEARANCE_MM = 12;
const USE_RAF_FOR_DRAG = true;

const SNAP_TO_PRODUCT_GAP_MM = 0;           // flush
const SNAP_TO_PRODUCT_TOL_MM = 6;           // if within this, snap & link
const GROUP_MOVE_COLLISION_LEADER_ONLY = true;

/* ───────────────────────────── math / geometry utils ───────────────────────── */

const len = (a: Point, b: Point) =>
  Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** oriented rectangle (center, L/W, rotation) → corner list in canvas px */
function rectCorners(cx: number, cy: number, L: number, W: number, rot = 0): Point[] {
  const hl = L / 2, hw = W / 2;
  const c = Math.cos(rot), s = Math.sin(rot);
  const pts = [
    { x: -hl, y: -hw }, { x:  hl, y: -hw },
    { x:  hl, y:  hw }, { x: -hl, y:  hw },
  ];
  return pts.map(p => ({ x: cx + p.x * c - p.y * s, y: cy + p.x * s + p.y * c }));
}

function dot(ax: number, ay: number, bx: number, by: number) { return ax*bx + ay*by; }

/** SAT overlap between 2 convex quads (rects) */
function rectsOverlapSAT(a: Point[], b: Point[]): boolean {
  const axes: Point[] = [];
  const pushAxes = (poly: Point[]) => {
    for (let i=0;i<poly.length;i++){
      const p1 = poly[i], p2 = poly[(i+1)%poly.length];
      const nx = -(p2.y - p1.y), ny = (p2.x - p1.x); // edge normal
      const nlen = Math.hypot(nx, ny) || 1;
      axes.push({ x: nx/nlen, y: ny/nlen });
    }
  };
  pushAxes(a); pushAxes(b);

  const project = (poly: Point[], ax: Point) => {
    let min = Infinity, max = -Infinity;
    for (const p of poly) {
      const d = p.x*ax.x + p.y*ax.y;
      min = Math.min(min, d); max = Math.max(max, d);
    }
    return {min, max};
  };

  for (const ax of axes) {
    const pa = project(a, ax), pb = project(b, ax);
    if (pa.max < pb.min || pb.max < pa.min) return false;
  }
  return true;
}

/** Build a wall as an oriented rectangle so we can SAT against products */
function wallRect(w: WallSegment, inflatePx: number): Point[] {
  const cx = (w.start.x + w.end.x)/2;
  const cy = (w.start.y + w.end.y)/2;
  const L = len(w.start, w.end);
  const W = (w.thickness ?? 10) + inflatePx * 2;
  const rot = Math.atan2(w.end.y - w.start.y, w.end.x - w.start.x);
  return rectCorners(cx, cy, L, W, rot);
}

/* ────────────────────────────── component ────────────────────────────── */

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
  const [snapGuides, setSnapGuides] = useState<{ horizontal: number | null; vertical: number | null }>({ horizontal: null, vertical: null });
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

  // product linking (adjacent)
  const [links, setLinks] = useState<Record<string, string[]>>({});
  const groupStartRef = useRef<Record<string, Point> | null>(null);

  // door snap preview
  const [doorSnapPreview, setDoorSnapPreview] = useState<{ point: Point; wall: WallSegment } | null>(null);

  // snap system
  const snapSystem = new SnapSystem(
    { enabled: true, gridSnap: showGrid, objectSnap: true, snapDistance: 20, strength: 'medium', snapToObjects: true, snapToAlignment: true, snapToGrid: showGrid },
    gridSize,
    scale
  );

  const CANVAS_WIDTH = canvasWidth;
  const CANVAS_HEIGHT = canvasHeight;

  useEffect(() => setSelectedItems(selectedProducts || []), [selectedProducts]);

  /* ───────────────────────── helpers ───────────────────────── */

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const snapToGrid = useCallback((p: Point): Point => {
    if (!showGrid) return p;
    const gridPx = gridSize * scale;
    return {
      x: Math.round(p.x / gridPx) * gridPx,
      y: Math.round(p.y / gridPx) * gridPx,
    };
  }, [showGrid, gridSize, scale]);

  const findWallEndpoints = useCallback((): Point[] => {
    const out: Point[] = [];
    wallSegments.forEach((w) => out.push(w.start, w.end));
    return out;
  }, [wallSegments]);

  const snapToEndpoints = useCallback((p: Point) => {
    const SNAP = 40;
    for (const ep of findWallEndpoints()) {
      if (len(p, ep) <= SNAP) return { point: ep, showGuides: true, isSnapping: true };
    }
    return { point: null, showGuides: false, isSnapping: false };
  }, [findWallEndpoints]);

  const constrainToOrtho = useCallback((start: Point, p: Point): Point => {
    const dx = p.x - start.x, dy = p.y - start.y;
    return Math.abs(dx) > Math.abs(dy) ? { x: p.x, y: start.y } : { x: start.x, y: p.y };
  }, []);

  /* ───────────── upgraded collisions (SAT, rotation-aware) ───────────── */

  const productRect = useCallback((prod: PlacedProduct) => {
    const L = prod.dimensions.length ?? 40;
    const W = prod.dimensions.width ?? 30;
    return rectCorners(prod.position.x, prod.position.y, L, W, prod.rotation || 0);
  }, []);

  const collidesWithWalls = useCallback(
    (prod: PlacedProduct): boolean => {
      const inflatePx = mmToCanvas(WALL_CLEARANCE_MM, scale);
      const prodPoly = productRect(prod);
      for (const w of wallSegments) {
        const wallPoly = wallRect(w, inflatePx);
        if (rectsOverlapSAT(prodPoly, wallPoly)) return true;
      }
      return false;
    },
    [wallSegments, scale, productRect]
  );

  const collidesWithFurniture = useCallback(
    (prod: PlacedProduct, exceptId?: string): boolean => {
      const prodPoly = productRect(prod);
      for (const other of placedProducts) {
        if (other.id === prod.id || other.id === exceptId) continue;
        const otherPoly = productRect(other);
        if (rectsOverlapSAT(prodPoly, otherPoly)) return true;
      }
      return false;
    },
    [placedProducts, productRect]
  );

  const clampToCanvas = useCallback((pos: Point, dimsPx: { length: number; width: number }) => {
    const halfL = (dimsPx.length ?? 40) / 2;
    const halfW = (dimsPx.width ?? 30) / 2;
    return {
      x: clamp(pos.x, halfL, CANVAS_WIDTH - halfL),
      y: clamp(pos.y, halfW, CANVAS_HEIGHT - halfW),
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  const calculateWallDistances = useCallback((p: Point) => {
    let top = Infinity, right = Infinity, bottom = Infinity, left = Infinity;
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
  }, [wallSegments, scale]);

  const snapIslandBenchDistance = useCallback((prod: PlacedProduct, targetMm = 600) => {
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
  }, [calculateWallDistances, scale]);

  const findProductAtPoint = useCallback((p: Point) => {
    for (const prod of placedProducts) {
      const halfL = (prod.dimensions.length ?? 40) / 2;
      const halfW = (prod.dimensions.width ?? 30) / 2;
      // quick coarse check with AABB around unrotated center (fast path)
      if (p.x >= prod.position.x - halfL && p.x <= prod.position.x + halfL &&
          p.y >= prod.position.y - halfW && p.y <= prod.position.y + halfW) return prod;
      // fallback for rotated shapes
      const poly = productRect(prod);
      // point in polygon (convex)
      let inside = true;
      for (let i=0;i<4;i++){
        const a = poly[i], b = poly[(i+1)%4];
        if (((b.x-a.x)*(p.y-a.y) - (b.y-a.y)*(p.x-a.x)) < 0) { inside = false; break; }
      }
      if (inside) return prod;
    }
    return null;
  }, [placedProducts, productRect]);

  const distanceToLineSegment = useCallback((p: Point, a: Point, b: Point) => {
    const A = p.x - a.x, B = p.y - a.y, C = b.x - a.x, D = b.y - a.y;
    const dot = A*C + B*D;
    const lenSq = C*C + D*D;
    if (lenSq === 0) return Math.sqrt(A*A + B*B);
    let t = dot / lenSq; t = Math.max(0, Math.min(1, t));
    const proj = { x: a.x + t*C, y: a.y + t*D };
    return len(p, proj);
  }, []);

  const findWallAtPoint = useCallback((p: Point) => {
    const tol = 10;
    for (const w of wallSegments) {
      if (distanceToLineSegment(p, w.start, w.end) <= tol) return w;
    }
    return null;
  }, [wallSegments, distanceToLineSegment]);

  const findMeasurementAtPoint = useCallback((p: Point) => {
    const tol = 30;
    for (const w of wallSegments) {
      const mid = { x: (w.start.x + w.end.x) / 2, y: (w.start.y + w.end.y) / 2 };
      if (len(p, mid) <= tol) return w.id;
    }
    return null;
  }, [wallSegments]);

  const findConnectedWalls = useCallback((id: string) => {
    const t = wallSegments.find((w) => w.id === id);
    if (!t) return [];
    const out: string[] = [];
    const tol = 5;
    const near = (p1: Point, p2: Point) => len(p1, p2) <= tol;
    for (const w of wallSegments) {
      if (w.id === id) continue;
      if (near(w.start, t.start) || near(w.start, t.end) || near(w.end, t.start) || near(w.end, t.end)) out.push(w.id);
    }
    return out;
  }, [wallSegments]);

  const adjustWallLength = useCallback((id: string, newLengthMm: number) => {
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
        const near = (p1: Point, p2: Point) => len(p1, p2) <= tol;
        let res = { ...w };
        if (near(w.start, oldEnd)) res.start = newEnd;
        if (near(w.end, oldEnd)) res.end = newEnd;
        return res;
      }
      return w;
    });

    setWallSegments(updated);
    const newT = updated.find((w) => w.id === id);
    if (newT && onWallUpdate) onWallUpdate(newT);
  }, [wallSegments, setWallSegments, scale, findConnectedWalls, onWallUpdate]);

  const snapToWallLength = useCallback((p: Point) => {
    let best: Point | null = null, min = Infinity;
    const SNAP = 20;
    for (const w of wallSegments) {
      const A = p.x - w.start.x, B = p.y - w.start.y;
      const C = w.end.x - w.start.x, D = w.end.y - w.start.y;
      const lenSq = C*C + D*D;
      if (lenSq === 0) continue;
      const t = (A*C + B*D) / lenSq;
      if (t >= 0 && t <= 1) {
        const proj = { x: w.start.x + t*C, y: w.start.y + t*D };
        const d = len(p, proj);
        if (d <= SNAP && d < min) { min = d; best = proj; }
      }
    }
    return { point: best, showGuides: !!best };
  }, [wallSegments]);

  const finalPointForPreview = useCallback((start: Point, curr: Point, mode: DrawingMode) => {
    const constrained = constrainToOrtho(start, curr);
    if (mode === 'interior-wall') {
      const s1 = snapToWallLength(constrained);
      if (s1.point) return s1.point;
      const s2 = snapToEndpoints(constrained);
      if (s2.point) return s2.point;
      return snapToGrid(constrained);
    }
    const s2 = snapToEndpoints(constrained);
    if (s2.point) return s2.point;
    return snapToGrid(constrained);
  }, [constrainToOrtho, snapToWallLength, snapToEndpoints, snapToGrid]);

  /* ─────────────────────── product linking helpers ─────────────────────── */

  const linkProducts = useCallback((a: string, b: string) => {
    setLinks(prev => {
      const add = (map: Record<string,string[]>, k: string, v: string) => {
        const arr = map[k] ? [...map[k]] : [];
        if (!arr.includes(v)) arr.push(v);
        map[k] = arr;
      };
      const next = { ...prev };
      add(next, a, b);
      add(next, b, a);
      return next;
    });
  }, []);

  const getGroup = useCallback((rootId: string): string[] => {
    const visited = new Set<string>();
    const q = [rootId];
    while (q.length) {
      const id = q.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      for (const n of (links[id] || [])) q.push(n);
    }
    return Array.from(visited);
  }, [links]);

  const trySnapAndLinkToNeighbors = useCallback((moving: PlacedProduct, exceptId?: string) => {
    const gapPx = mmToCanvas(SNAP_TO_PRODUCT_GAP_MM, scale);
    const tolPx = mmToCanvas(SNAP_TO_PRODUCT_TOL_MM, scale);
    const L = moving.dimensions.length ?? 40;
    const W = moving.dimensions.width ?? 30;

    // Only support axis-aligned body snapping (most lab benches); works fine even if rotated multiples of 90deg.
    const rot = (moving.rotation || 0) % (Math.PI/2);
    if (Math.abs(rot) > 1e-3) return moving.position; // skip fancy snap when angled

    let pos = { ...moving.position };
    for (const other of placedProducts) {
      if (other.id === moving.id || other.id === exceptId) continue;

      const oL = other.dimensions.length ?? 40;
      const oW = other.dimensions.width ?? 30;

      // Overlap range on Y to snap horizontally; on X to snap vertically
      const yOverlap = !(pos.y + W/2 < other.position.y - oW/2 || pos.y - W/2 > other.position.y + oW/2);
      const xOverlap = !(pos.x + L/2 < other.position.x - oL/2 || pos.x - L/2 > other.position.x + oL/2);

      // snap left / right
      const wantLeft = other.position.x - oL/2 - (L/2 + gapPx);
      const wantRight = other.position.x + oL/2 + (L/2 + gapPx);
      if (yOverlap && Math.abs(pos.x - wantLeft) <= tolPx) {
        pos.x = wantLeft; linkProducts(moving.id, other.id);
      } else if (yOverlap && Math.abs(pos.x - wantRight) <= tolPx) {
        pos.x = wantRight; linkProducts(moving.id, other.id);
      }

      // snap top / bottom
      const wantTop = other.position.y - oW/2 - (W/2 + gapPx);
      const wantBottom = other.position.y + oW/2 + (W/2 + gapPx);
      if (xOverlap && Math.abs(pos.y - wantTop) <= tolPx) {
        pos.y = wantTop; linkProducts(moving.id, other.id);
      } else if (xOverlap && Math.abs(pos.y - wantBottom) <= tolPx) {
        pos.y = wantBottom; linkProducts(moving.id, other.id);
      }
    }
    return pos;
  }, [placedProducts, scale, linkProducts]);

  /* ───────────────────────────── mouse handlers ───────────────────────────── */

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getCanvasPoint(e);
    const snapped = snapToGrid(p);
    setLastMousePos(snapped);

    if (currentMode === 'select') {
      const mId = findMeasurementAtPoint(snapped);
      if (mId) {
        const w = wallSegments.find((x) => x.id === mId);
        if (w) {
          const mm = Math.round((len(w.start, w.end) / scale / 100) * 1000);
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
      if (w) { setSelectedWall(w); return; }
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
        // record group initial positions
        const groupIds = getGroup(prod.id);
        const map: Record<string, Point> = {};
        for (const id of groupIds) {
          const p = placedProducts.find(pp => pp.id === id);
          if (p) map[id] = { ...p.position };
        }
        groupStartRef.current = map;
        return;
      }
    }

    if (currentMode === 'wall' || currentMode === 'interior-wall') {
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

    if (currentMode === 'room') { setRoomPoints((prev) => [...prev, snapped]); return; }

    if (currentMode === 'door') {
      const s = snapSystem.snapDoorToWall(p, wallSegments);
      if (s.snapped && s.target) {
        const wall = s.target as WallSegment;
        const dx = Math.abs(wall.end.x - wall.start.x);
        const dy = Math.abs(wall.end.y - wall.start.y);
        const facing: 'horizontal' | 'vertical' = dx > dy ? 'horizontal' : 'vertical';
        const door: Door = { id: `door-${Date.now()}`, position: s.point, width: 80, wallId: wall.id, wallSegmentId: wall.id, wallPosition: undefined, isEmbedded: true, facing };
        setDoors((prev) => [...prev, door]);
        toast.success('Door placed on wall');
      } else {
        const door: Door = { id: `door-${Date.now()}`, position: snapped, width: 80, wallId: undefined, wallSegmentId: undefined, wallPosition: undefined, isEmbedded: false, facing: 'horizontal' };
        setDoors((prev) => [...prev, door]);
        toast.info('Door placed without wall alignment');
      }
      return;
    }

    if (currentMode === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const ann: TextAnnotation = { id: `text-${Date.now()}`, position: snapped, text, fontSize: 14, color: '#000000' };
        setTextAnnotations((prev) => [...prev, ann]);
      }
    }
  }, [
    currentMode, getCanvasPoint, snapToGrid, snapToEndpoints, finalPointForPreview, wallStartPoint,
    setWallSegments, findMeasurementAtPoint, wallSegments, scale, findProductAtPoint, selectedProducts,
    onProductSelect, findWallAtPoint, setRoomPoints, snapSystem, setDoors, setTextAnnotations,
    placedProducts, getGroup
  ]);

  // rAF-powered dragging
  const applyDragAt = useCallback((clientX: number, clientY: number) => {
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

    // apply product-to-product edge snap + link
    const snapPos = trySnapAndLinkToNeighbors({ ...dragged, position: pos }, draggedItem);
    pos = snapPos;

    let candidate: PlacedProduct = { ...dragged, position: pos };

    // wall distance snap for benches/islands
    pos = snapIslandBenchDistance(candidate);
    candidate.position = pos;

    const wallHit = collidesWithWalls(candidate);
    const furnHit = collidesWithFurniture(candidate, draggedItem);

    if (!wallHit && !furnHit) {
      // move leader
      const prev = dragged.position;
      const delta = { x: pos.x - prev.x, y: pos.y - prev.y };

      setPlacedProducts((prevList) => prevList.map((p) => (p.id === draggedItem ? { ...p, position: pos } : p)));

      // move linked group members by same delta (optional collision checks)
      const ids = getGroup(draggedItem).filter(id => id !== draggedItem);
      if (ids.length && groupStartRef.current) {
        setPlacedProducts((prevList) =>
          prevList.map((p) => {
            if (!ids.includes(p.id)) return p;
            const start = groupStartRef.current![p.id] || p.position;
            const next = { x: start.x + (pos.x - groupStartRef.current![draggedItem].x), y: start.y + (pos.y - groupStartRef.current![draggedItem].y) };
            // basic clamping
            const clamped = clampToCanvas(next, p.dimensions);
            if (GROUP_MOVE_COLLISION_LEADER_ONLY) return { ...p, position: clamped };
            // optional: check collisions for each follower
            const cand = { ...p, position: clamped };
            if (!collidesWithWalls(cand) && !collidesWithFurniture(cand, draggedItem)) return { ...p, position: clamped };
            return p; // if blocked, leave as-is
          })
        );
      }

      setLastValidPos(pos);
      setDragMeasurements(calculateWallDistances(pos));
    } else if (lastValidPos) {
      // soft rollback toward the last valid position
      const alpha = 0.35;
      const smooth = {
        x: lastValidPos.x * (1 - alpha) + pos.x * alpha,
        y: lastValidPos.y * (1 - alpha) + pos.y * alpha,
      };
      setPlacedProducts((prev) => prev.map((p) => (p.id === draggedItem ? { ...p, position: smooth } : p)));
    }
  }, [
    isDragging, draggedItem, dragOffset, snapToGrid, placedProducts, clampToCanvas, snapIslandBenchDistance,
    collidesWithWalls, collidesWithFurniture, setPlacedProducts, lastValidPos, calculateWallDistances,
    trySnapAndLinkToNeighbors, getGroup
  ]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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
  }, [
    currentMode, getCanvasPoint, isDragging, draggedItem, isWallPreview, wallStartPoint, finalPointForPreview,
    constrainToOrtho, snapToGrid, showGrid, gridSize, scale, findWallAtPoint, findMeasurementAtPoint,
    snapSystem, wallSegments, applyDragAt
  ]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
    dragRafRef.current = null;

    groupStartRef.current = null;

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

  /* ───────────────────────────── drawing ───────────────────────────── */

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
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += g) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
      }
      // major
      const mg = g * 5;
      ctx.strokeStyle = '#d1d1d1';
      ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_WIDTH; x += mg) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += mg) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
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
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    });

    // walls + dimension labels (offset off the wall normal)
    wallSegments.forEach((w) => {
      const isSel = selectedWall?.id === w.id;
      const isHov = hoveredWall === w.id;

      ctx.strokeStyle = isSel ? '#ff4444' : isHov ? '#ffaa00' : w.color;
      ctx.lineWidth = (w.thickness ?? 10) + (isSel ? 4 : isHov ? 2 : 0);
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(w.start.x, w.start.y); ctx.lineTo(w.end.x, w.end.y); ctx.stroke();

      // endpoints
      [w.start, w.end].forEach((pt) => {
        const snap = snapToEndpoints(pt);
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? '#ff4444' : isHov ? '#ffaa00' : snap.isSnapping ? '#ef4444' : '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

        // invisible hit
        ctx.globalAlpha = 0.1;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 15, 0, Math.PI * 2); ctx.fillStyle = '#3b82f6'; ctx.fill();
        ctx.globalAlpha = 1;
      });

      // measures
      if (showMeasurements) {
        const isHover = hoveredMeasurement === w.id;
        const d = len(w.start, w.end);
        const mid = { x: (w.start.x + w.end.x) / 2, y: (w.start.y + w.end.y) / 2 };
        const mm = canvasToMm(d, scale);
        const txt = formatMeasurement(mm, measurementUnit, measurementUnit === 'mm' ? 0 : 2);

        // push label off the wall along its normal so it never intersects
        const dx = w.end.x - w.start.x, dy = w.end.y - w.start.y;
        const L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L, ny = dx / L; // wall normal
        const offset = ((w.thickness ?? 10) / 2) + 14;
        const lx = mid.x + nx * offset;
        const ly = mid.y + ny * offset;

        ctx.font = 'bold 18px Arial';
        const tw = ctx.measureText(txt).width;
        const pad = 6;

        const bg = 'rgba(255,255,255,0.96)'; // neutral
        ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 3; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
        ctx.fillStyle = bg;
        ctx.fillRect(lx - tw / 2 - pad, ly - 14, tw + pad * 2, 28);

        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

        ctx.strokeStyle = isSel ? '#ef4444' : isHover ? '#3b82f6' : '#999';
        ctx.lineWidth = isHover ? 2.5 : 1.5;
        ctx.strokeRect(lx - tw / 2 - pad, ly - 14, tw + pad * 2, 28);

        ctx.fillStyle = '#111';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(txt, lx, ly);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
      }
    });

    // active room polyline
    if (roomPoints.length > 0) {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
      roomPoints.slice(1).forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
      roomPoints.forEach((pt) => { ctx.fillStyle = '#2196f3'; ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); ctx.fill(); });
    }

    // wall preview
    if (isWallPreview && wallStartPoint) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([5,5]);
      ctx.beginPath(); ctx.moveTo(wallStartPoint.x, wallStartPoint.y); ctx.lineTo(lastMousePos.x, lastMousePos.y); ctx.stroke();
      ctx.setLineDash([]);

      // endpoints
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(wallStartPoint.x, wallStartPoint.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(lastMousePos.x, lastMousePos.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }

    // doors
    doors.forEach((door) => {
      const x = door.position.x, y = door.position.y;
      let nearest: WallSegment | null = null, min = Infinity;
      for (const w of wallSegments) {
        const d = distanceToLineSegment(door.position, w.start, w.end);
        if (d < min) { min = d; nearest = w; }
      }
      const wth = nearest?.thickness ?? 10;
      const doorTh = Math.max(wth * 0.7, 6);
      const doorW = Math.min(Math.max(door.width, 60), 120);

      const horiz = door.facing === 'horizontal';
      const rw = horiz ? doorW : doorTh;
      const rh = horiz ? doorTh : doorW;

      ctx.fillStyle = '#8b4513'; ctx.fillRect(x - rw / 2, y - rh / 2, rw, rh);
      ctx.strokeStyle = '#654321'; ctx.lineWidth = 1; ctx.strokeRect(x - rw / 2, y - rh / 2, rw, rh);

      const R = doorW * 0.9;
      const start = horiz ? -Math.PI / 2 : 0;
      const hinge = horiz ? { x: x - rw / 2, y } : { x, y: y - rh / 2 };
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.arc(hinge.x, hinge.y, R, start, start + Math.PI / 2); ctx.stroke();
      ctx.setLineDash([]);
      const endX = hinge.x + R * Math.cos(start + Math.PI / 2);
      const endY = hinge.y + R * Math.sin(start + Math.PI / 2);
      ctx.setLineDash([2,3]); ctx.beginPath(); ctx.moveTo(hinge.x, hinge.y); ctx.lineTo(endX, endY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#654321'; ctx.beginPath(); ctx.arc(hinge.x, hinge.y, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    // text
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

      // selection adorners
      if (selectedItems?.includes(prod.id)) {
        ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 3;
        ctx.strokeRect(-L / 2 - 5, -W / 2 - 5, L + 10, W + 10);

        // rotation handle
        ctx.fillStyle = '#ff4444'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(L / 2 + 20, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // small arrow
        ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(L / 2 + 14, -3); ctx.lineTo(L / 2 + 20, 0); ctx.lineTo(L / 2 + 14, 3); ctx.stroke();

        // hint
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(-42, W / 2 + 10, 84, 20);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
        ctx.fillText('Press R to rotate', 0, W / 2 + 24);
        ctx.textAlign = 'start';
      }

      ctx.restore();
    });

    // global rotation hint
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
      ctx.strokeStyle = '#0066ff'; ctx.lineWidth = 1; ctx.setLineDash([5,5]);
      if (snapLines.x !== null) { ctx.beginPath(); ctx.moveTo(snapLines.x, 0); ctx.lineTo(snapLines.x, CANVAS_HEIGHT); ctx.stroke(); }
      if (snapLines.y !== null) { ctx.beginPath(); ctx.moveTo(0, snapLines.y); ctx.lineTo(CANVAS_WIDTH, snapLines.y); ctx.stroke(); }
      ctx.setLineDash([]);
    }

    // live drag measures
    if (dragMeasurements && isDragging && draggedItem) {
      const prod = placedProducts.find((p) => p.id === draggedItem);
      if (prod) {
        const pos = prod.position;
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1; ctx.setLineDash([2,2]);
        ctx.fillStyle = '#10b981'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';

        if (dragMeasurements.top > 0) {
          ctx.beginPath(); ctx.moveTo(pos.x, pos.y - 50);
          ctx.lineTo(pos.x, pos.y - (dragMeasurements.top * scale) / 10); ctx.stroke();
          ctx.fillText(`${dragMeasurements.top}mm`, pos.x, pos.y - 60);
        }
        if (dragMeasurements.right > 0) {
          ctx.beginPath(); ctx.moveTo(pos.x + 50, pos.y);
          ctx.lineTo(pos.x + (dragMeasurements.right * scale) / 10, pos.y); ctx.stroke();
          ctx.save(); ctx.translate(pos.x + 60, pos.y); ctx.rotate(-Math.PI / 2); ctx.fillText(`${dragMeasurements.right}mm`, 0, 0); ctx.restore();
        }
        if (dragMeasurements.bottom > 0) {
          ctx.beginPath(); ctx.moveTo(pos.x, pos.y + 50);
          ctx.lineTo(pos.x, pos.y + (dragMeasurements.bottom * scale) / 10); ctx.stroke();
          ctx.fillText(`${dragMeasurements.bottom}mm`, pos.x, pos.y + 70);
        }
        if (dragMeasurements.left > 0) {
          ctx.beginPath(); ctx.moveTo(pos.x - 50, pos.y);
          ctx.lineTo(pos.x - (dragMeasurements.left * scale) / 10, pos.y); ctx.stroke();
          ctx.save(); ctx.translate(pos.x - 60, pos.y); ctx.rotate(Math.PI / 2); ctx.fillText(`${dragMeasurements.left}mm`, 0, 0); ctx.restore();
        }
        ctx.setLineDash([]);
      }
    }

    // door snap preview
    if (doorSnapPreview && currentMode === 'door') {
      const { point, wall } = doorSnapPreview;
      ctx.strokeStyle = 'rgba(16,185,129,0.8)'; ctx.lineWidth = 6; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(wall.start.x, wall.start.y); ctx.lineTo(wall.end.x, wall.end.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(16,185,129,0.6)'; ctx.strokeStyle = 'rgb(16,185,129)'; ctx.lineWidth = 2;
      ctx.fillRect(point.x - 40, point.y - 6, 80, 12); ctx.strokeRect(point.x - 40, point.y - 6, 80, 12);
      ctx.fillStyle = 'rgb(16,185,129)'; ctx.beginPath(); ctx.arc(point.x, point.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }

    // snap guides
    if (snapGuides.vertical !== null || snapGuides.horizontal !== null) {
      ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 2; ctx.setLineDash([3,3]);
      if (snapGuides.vertical !== null) { ctx.beginPath(); ctx.moveTo(snapGuides.vertical, 0); ctx.lineTo(snapGuides.vertical, CANVAS_HEIGHT); ctx.stroke(); }
      if (snapGuides.horizontal !== null) { ctx.beginPath(); ctx.moveTo(0, snapGuides.horizontal); ctx.lineTo(CANVAS_WIDTH, snapGuides.horizontal); ctx.stroke(); }
      ctx.setLineDash([]);
    }

    // live wall measure box
    if (isWallPreview && wallStartPoint && currentLineMeasurement) {
      const midX = (wallStartPoint.x + lastMousePos.x) / 2;
      const midY = (wallStartPoint.y + lastMousePos.y) / 2;
      ctx.font = 'bold 16px Arial';
      const tw = ctx.measureText(currentLineMeasurement).width;
      const pad = 8;
      const rx = midX - tw / 2 - pad;
      const ry = midY - 16;
      const rw = tw + pad * 2;
      const rh = 28;

      ctx.fillStyle = 'rgba(239,68,68,0.95)'; ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.strokeRect(rx, ry, rw, rh);

      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(currentLineMeasurement, midX, midY);
      ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    }
  }, [
    CANVAS_WIDTH, CANVAS_HEIGHT, showGrid, gridSize, scale, rooms, wallSegments, selectedWall, hoveredWall,
    snapToEndpoints, showMeasurements, hoveredMeasurement, measurementUnit, roomPoints, isWallPreview,
    wallStartPoint, lastMousePos, currentLineMeasurement, doors, distanceToLineSegment, placedProducts,
    selectedItems, snapLines, dragMeasurements, isDragging, draggedItem, doorSnapPreview, currentMode, snapGuides
  ]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  // Esc cancels wall preview + keyboard rotate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWallPreview) {
        setWallStartPoint(null); setIsWallPreview(false); setCurrentLineMeasurement('');
        setSnapLines({ x: null, y: null }); setSnapGuides({ horizontal: null, vertical: null });
      }
      if (e.key.toLowerCase() === 'r' && selectedItems.length) {
        setPlacedProducts((prev) => prev.map((p) => selectedItems.includes(p.id) ? { ...p, rotation: (p.rotation || 0) + Math.PI / 12 } : p));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isWallPreview, selectedItems, setPlacedProducts]);

  /* ───────────────────────────── render ───────────────────────────── */

  return (
    <div className="relative w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ width: '100%', height: '100%', maxWidth: `${CANVAS_WIDTH}px`, maxHeight: `${CANVAS_HEIGHT}px` }}
        className={`w-full h-full bg-white border ${currentMode === 'select' && hoveredMeasurement ? 'cursor-pointer' : currentMode === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onDrop={(e) => {
          e.preventDefault();
          const canvas = canvasRef.current;
          if (!canvas) return;

          const data = e.dataTransfer.getData('application/json');
          if (!data) { toast.error('No product data in drop'); return; }

          try {
            const product = JSON.parse(data);
            const dimsMm = getProductDimensionsInMm(product);
            if (!dimsMm) { toast.error('Missing product dimensions'); return; }

            const dimsPx = {
              length: mmToCanvas(dimsMm.width, scale),
              width: mmToCanvas(dimsMm.depth, scale),
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

            let newProd: PlacedProduct = {
              id: `product-${Date.now()}`, productId: product.id, name: product.name,
              category: product.category || 'Unknown', position: pos, rotation: 0,
              dimensions: dimsPx,
              originalDimensions: { length: dimsMm.width, width: dimsMm.depth, height: dimsMm.height },
              color: product.color || '#4caf50', scale: 1, modelPath: product.modelPath,
              thumbnail: product.thumbnail, description: product.description,
              specifications: product.specifications, finishes: product.finishes, variants: product.variants,
            };

            // wall/furniture checks with SAT
            if (wallSegments.length && collidesWithWalls(newProd)) { toast.error('Cannot place product: overlaps a wall'); return; }
            if (collidesWithFurniture(newProd)) { toast.error('Cannot place product: overlaps another item'); return; }

            // edge snap + link on drop
            newProd.position = trySnapAndLinkToNeighbors(newProd);

            // bench/island distance snap
            newProd.position = wallSegments.length ? snapIslandBenchDistance(newProd) : newProd.position;

            setPlacedProducts((prev) => [...prev, newProd]);
            toast.success(`${newProd.name} placed`);
          } catch (err) {
            console.error(err);
            toast.error('Failed to parse dropped product');
          }
        }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      />

      {/* inline measurement editor */}
      {editingMeasurement && (
        <div className="absolute bg-white border-2 border-blue-500 rounded px-2 py-1 shadow-lg z-10"
             style={{ left: '50%', top: 20, transform: 'translateX(-50%)' }}>
          <input
            type="number"
            value={editingMeasurement.value}
            onChange={(e) => setEditingMeasurement((prev) => (prev ? { ...prev, value: e.target.value } : null))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const mm = parseInt(editingMeasurement.value, 10);
                if (!isNaN(mm) && mm > 0) adjustWallLength(editingMeasurement.wallId, mm);
                setEditingMeasurement(null);
              } else if (e.key === 'Escape') setEditingMeasurement(null);
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
