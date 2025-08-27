import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode, WallType } from '@/types/floorPlanTypes';
import { GRID_SIZES, MeasurementUnit, formatMeasurement, canvasToMm, mmToCanvas } from '@/utils/measurements';
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
  onClearAll,
  selectedProducts,
  onProductSelect,
  onWallUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wallStartPoint, setWallStartPoint] = useState<Point | null>(null);
  const [isWallPreview, setIsWallPreview] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedProducts || []);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });
  const [currentLineMeasurement, setCurrentLineMeasurement] = useState<string>('');
  const [selectedWall, setSelectedWall] = useState<WallSegment | null>(null);
  const [hoveredWall, setHoveredWall] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [snapGuides, setSnapGuides] = useState<{ horizontal: number | null; vertical: number | null }>({ horizontal: null, vertical: null });
  const [editingMeasurement, setEditingMeasurement] = useState<{ wallId: string; value: string } | null>(null);
  const [hoveredMeasurement, setHoveredMeasurement] = useState<string | null>(null);
  const [dragMeasurements, setDragMeasurements] = useState<{ top: number; right: number; bottom: number; left: number } | null>(null);
  const [doorSnapPreview, setDoorSnapPreview] = useState<{ point: Point; wall: WallSegment } | null>(null);

  // Initialize snap system
  const snapSystem = new SnapSystem(
    {
      enabled: true,
      gridSnap: showGrid,
      objectSnap: true,
      snapDistance: 20,
      strength: 'medium',
      snapToObjects: true,
      snapToAlignment: true,
      snapToGrid: showGrid
    },
    gridSize,
    scale
  );

  const CANVAS_WIDTH = canvasWidth;
  const CANVAS_HEIGHT = canvasHeight;

  /** Accepts mouse OR drag events (we only use clientX/clientY). */
  const getCanvasPoint = useCallback(
    (e: { clientX: number; clientY: number }): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    },
    []
  );

  const snapToGrid = useCallback(
    (point: Point): Point => {
      if (!showGrid) return point;
      const gridPixels = gridSize * scale;
      return {
        x: Math.round(point.x / gridPixels) * gridPixels,
        y: Math.round(point.y / gridPixels) * gridPixels
      };
    },
    [showGrid, gridSize, scale]
  );

  const findWallEndpoints = useCallback((): Point[] => {
    const endpoints: Point[] = [];
    wallSegments.forEach(wall => {
      endpoints.push(wall.start, wall.end);
    });
    return endpoints;
  }, [wallSegments]);

  const snapToEndpoints = useCallback(
    (point: Point): { point: Point | null; showGuides: boolean; isSnapping: boolean } => {
      const endpoints = findWallEndpoints();
      const snapDistance = 40;
      for (const endpoint of endpoints) {
        const distance = Math.hypot(point.x - endpoint.x, point.y - endpoint.y);
        if (distance <= snapDistance) {
          return { point: endpoint, showGuides: true, isSnapping: true };
        }
      }
      return { point: null, showGuides: false, isSnapping: false };
    },
    [findWallEndpoints]
  );

  const constrainToOrtho = useCallback((startPoint: Point, currentPoint: Point): Point => {
    const dx = currentPoint.x - startPoint.x;
    const dy = currentPoint.y - startPoint.y;
    return Math.abs(dx) > Math.abs(dy)
      ? { x: currentPoint.x, y: startPoint.y }
      : { x: startPoint.x, y: currentPoint.y };
  }, []);

  const checkWallCollision = useCallback(
    (product: PlacedProduct): boolean => {
      const halfWidth = product.dimensions.length / 2;
      const halfHeight = product.dimensions.width / 2;
      const productBounds = {
        left: product.position.x - halfWidth,
        right: product.position.x + halfWidth,
        top: product.position.y - halfHeight,
        bottom: product.position.y + halfHeight
      };
      for (const wall of wallSegments) {
        const wallThickness = wall.thickness || 10;
        const minX = Math.min(wall.start.x, wall.end.x) - wallThickness / 2;
        const maxX = Math.max(wall.start.x, wall.end.x) + wallThickness / 2;
        const minY = Math.min(wall.start.y, wall.end.y) - wallThickness / 2;
        const maxY = Math.max(wall.start.y, wall.end.y) + wallThickness / 2;
        if (
          productBounds.right >= minX &&
          productBounds.left <= maxX &&
          productBounds.bottom >= minY &&
          productBounds.top <= maxY
        ) {
          return true;
        }
      }
      return false;
    },
    [wallSegments]
  );

  const calculateWallDistances = useCallback(
    (point: Point): { top: number; right: number; bottom: number; left: number } => {
      let minTop = Infinity,
        minRight = Infinity,
        minBottom = Infinity,
        minLeft = Infinity;
      for (const wall of wallSegments) {
        const isHorizontal =
          Math.abs(wall.start.y - wall.end.y) < Math.abs(wall.start.x - wall.end.x);
        if (isHorizontal) {
          const wallY = (wall.start.y + wall.end.y) / 2;
          const wallMinX = Math.min(wall.start.x, wall.end.x);
          const wallMaxX = Math.max(wall.start.x, wall.end.x);
          if (point.x >= wallMinX && point.x <= wallMaxX) {
            if (wallY < point.y) minTop = Math.min(minTop, point.y - wallY);
            else minBottom = Math.min(minBottom, wallY - point.y);
          }
        } else {
          const wallX = (wall.start.x + wall.end.x) / 2;
          const wallMinY = Math.min(wall.start.y, wall.end.y);
          const wallMaxY = Math.max(wall.start.y, wall.end.y);
          if (point.y >= wallMinY && point.y <= wallMaxY) {
            if (wallX < point.x) minLeft = Math.min(minLeft, point.x - wallX);
            else minRight = Math.min(minRight, wallX - point.x);
          }
        }
      }
      return {
        top: minTop === Infinity ? 0 : Math.round(canvasToMm(minTop, scale)),
        right: minRight === Infinity ? 0 : Math.round(canvasToMm(minRight, scale)),
        bottom: minBottom === Infinity ? 0 : Math.round(canvasToMm(minBottom, scale)),
        left: minLeft === Infinity ? 0 : Math.round(canvasToMm(minLeft, scale))
      };
    },
    [wallSegments, scale]
  );

  const snapToWallDistance = useCallback(
    (product: PlacedProduct, targetDistance: number = 600): Point => {
      const isIslandOrBench =
        product.name.toLowerCase().includes('island') ||
        product.name.toLowerCase().includes('bench') ||
        product.category?.toLowerCase().includes('bench');
      if (!isIslandOrBench) return product.position;

      const distances = calculateWallDistances(product.position);
      const snapThreshold = 50;

      let adjustedPosition = { ...product.position };
      if (Math.abs(distances.left - targetDistance) < snapThreshold) {
        adjustedPosition.x = product.position.x + ((targetDistance - distances.left) * scale) / 10;
      }
      if (Math.abs(distances.right - targetDistance) < snapThreshold) {
        adjustedPosition.x = product.position.x - ((targetDistance - distances.right) * scale) / 10;
      }
      if (Math.abs(distances.top - targetDistance) < snapThreshold) {
        adjustedPosition.y = product.position.y + ((targetDistance - distances.top) * scale) / 10;
      }
      if (Math.abs(distances.bottom - targetDistance) < snapThreshold) {
        adjustedPosition.y = product.position.y - ((targetDistance - distances.bottom) * scale) / 10;
      }
      return adjustedPosition;
    },
    [calculateWallDistances, scale]
  );

  const findProductAtPoint = useCallback(
    (point: Point): PlacedProduct | null => {
      for (const product of placedProducts) {
        const halfWidth = product.dimensions.length / 2;
        const halfHeight = product.dimensions.width / 2;
        if (
          point.x >= product.position.x - halfWidth &&
          point.x <= product.position.x + halfWidth &&
          point.y >= product.position.y - halfHeight &&
          point.y <= product.position.y + halfHeight
        ) {
          return product;
        }
      }
      return null;
    },
    [placedProducts]
  );

  const distanceToLineSegment = useCallback((point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    if (lenSq === 0) return Math.hypot(A, B);
    let param = dot / lenSq;
    if (param < 0) return Math.hypot(A, B);
    if (param > 1) return Math.hypot(point.x - lineEnd.x, point.y - lineEnd.y);
    const projX = lineStart.x + param * C;
    const projY = lineStart.y + param * D;
    return Math.hypot(point.x - projX, point.y - projY);
  }, []);

  const findWallAtPoint = useCallback(
    (point: Point): WallSegment | null => {
      const tolerance = 10;
      for (const wall of wallSegments) {
        const distance = distanceToLineSegment(point, wall.start, wall.end);
        if (distance <= tolerance) return wall;
      }
      return null;
    },
    [wallSegments, distanceToLineSegment]
  );

  const findMeasurementAtPoint = useCallback(
    (point: Point): string | null => {
      const tolerance = 30;
      for (const wall of wallSegments) {
        const midX = (wall.start.x + wall.end.x) / 2;
        const midY = (wall.start.y + wall.end.y) / 2;
        if (Math.hypot(point.x - midX, point.y - midY) <= tolerance) return wall.id;
      }
      return null;
    },
    [wallSegments]
  );

  const findConnectedWalls = useCallback(
    (wallId: string): string[] => {
      const targetWall = wallSegments.find(w => w.id === wallId);
      if (!targetWall) return [];
      const connected: string[] = [];
      const tolerance = 5;
      for (const wall of wallSegments) {
        if (wall.id === wallId) continue;
        const startToStart = Math.hypot(wall.start.x - targetWall.start.x, wall.start.y - targetWall.start.y);
        const startToEnd = Math.hypot(wall.start.x - targetWall.end.x, wall.start.y - targetWall.end.y);
        const endToStart = Math.hypot(wall.end.x - targetWall.start.x, wall.end.y - targetWall.start.y);
        const endToEnd = Math.hypot(wall.end.x - targetWall.end.x, wall.end.y - targetWall.end.y);
        if (startToStart <= tolerance || startToEnd <= tolerance || endToStart <= tolerance || endToEnd <= tolerance) {
          connected.push(wall.id);
        }
      }
      return connected;
    },
    [wallSegments]
  );

  const adjustWallLength = useCallback(
    (wallId: string, newLengthMm: number) => {
      const targetWall = wallSegments.find(w => w.id === wallId);
      if (!targetWall) return;

      const currentLengthPx = Math.hypot(targetWall.end.x - targetWall.start.x, targetWall.end.y - targetWall.start.y);
      const newLengthPx = mmToCanvas(newLengthMm, scale);
      const dirX = (targetWall.end.x - targetWall.start.x) / currentLengthPx;
      const dirY = (targetWall.end.y - targetWall.start.y) / currentLengthPx;

      const newEnd = {
        x: targetWall.start.x + dirX * newLengthPx,
        y: targetWall.start.y + dirY * newLengthPx
      };

      const originalEnd = targetWall.end;
      const connectedWallIds = findConnectedWalls(wallId);

      const updatedWalls = wallSegments.map(wall => {
        if (wall.id === wallId) return { ...wall, end: newEnd };
        if (connectedWallIds.includes(wall.id)) {
          const tolerance = 5;
          let updatedWall = { ...wall };
          const startToOriginalEnd = Math.hypot(wall.start.x - originalEnd.x, wall.start.y - originalEnd.y);
          if (startToOriginalEnd <= tolerance) updatedWall.start = newEnd;
          const endToOriginalEnd = Math.hypot(wall.end.x - originalEnd.x, wall.end.y - originalEnd.y);
          if (endToOriginalEnd <= tolerance) updatedWall.end = newEnd;
          return updatedWall;
        }
        return wall;
      });

      setWallSegments(updatedWalls);
      const updatedTargetWall = updatedWalls.find(w => w.id === wallId);
      if (updatedTargetWall && onWallUpdate) onWallUpdate(updatedTargetWall);
    },
    [wallSegments, setWallSegments, scale, findConnectedWalls, onWallUpdate]
  );

  const snapToWallLength = useCallback(
    (point: Point): { point: Point | null; showGuides: boolean } => {
      const snapDistance = 20;
      let closestPoint: Point | null = null;
      let minDistance = Infinity;

      for (const wall of wallSegments) {
        const A = point.x - wall.start.x;
        const B = point.y - wall.start.y;
        const C = wall.end.x - wall.start.x;
        const D = wall.end.y - wall.start.y;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        if (lenSq === 0) continue;
        const param = dot / lenSq;
        if (param >= 0 && param <= 1) {
          const projectedPoint = { x: wall.start.x + param * C, y: wall.start.y + param * D };
          const distance = Math.hypot(point.x - projectedPoint.x, point.y - projectedPoint.y);
          if (distance <= snapDistance && distance < minDistance) {
            minDistance = distance;
            closestPoint = projectedPoint;
          }
        }
      }
      return { point: closestPoint, showGuides: closestPoint !== null };
    },
    [wallSegments]
  );

  const calculateFinalPosition = useCallback(
    (startPoint: Point, currentPoint: Point, mode: DrawingMode): Point => {
      const constrainedPoint = constrainToOrtho(startPoint, currentPoint);
      if (mode === 'interior-wall') {
        const wallSnapResult = snapToWallLength(constrainedPoint);
        if (wallSnapResult.point) return wallSnapResult.point;
        const endpointSnapResult = snapToEndpoints(constrainedPoint);
        if (endpointSnapResult.point) return endpointSnapResult.point;
        return snapToGrid(constrainedPoint);
      } else {
        const snapResult = snapToEndpoints(constrainedPoint);
        if (snapResult.point) return snapResult.point;
        return snapToGrid(constrainedPoint);
      }
    },
    [constrainToOrtho, snapToEndpoints, snapToGrid, snapToWallLength]
  );

  // --- Mouse handlers (unchanged) ---
  const handleMouseDown = useCallback(/* ... unchanged ... */ (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    const snappedPoint = snapToGrid(point);
    setLastMousePos(snappedPoint);
    // ... (rest of your existing mouse-down logic)
    // (omitted here for brevity — keep your original code block)
  }, [/* keep your existing deps */ getCanvasPoint, snapToGrid, setRoomPoints, setDoors, setTextAnnotations, findWallAtPoint, findProductAtPoint, wallStartPoint, setWallSegments, findMeasurementAtPoint, wallSegments, scale, currentMode, selectedProducts, onProductSelect, calculateFinalPosition, snapSystem, toast]);

  const handleMouseMove = useCallback(/* ... unchanged ... */ (e: React.MouseEvent<HTMLCanvasElement>) => {
    // keep your existing content
  }, [/* keep your existing deps */]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
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
        area: calculatePolygonArea(roomPoints),
        perimeter: calculatePolygonPerimeter(roomPoints),
        color: '#e3f2fd'
      };
      setRooms(prev => [...prev, newRoom]);
      setRoomPoints([]);
    }
  }, [currentMode, roomPoints, rooms.length, setRooms, setRoomPoints]);

  const calculatePolygonArea = (points: Point[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  const calculatePolygonPerimeter = (points: Point[]): number => {
    if (points.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      perimeter += Math.hypot(points[j].x - points[i].x, points[j].y - points[i].y);
    }
    return perimeter;
  };

  // ---------------------------
  // Drag & Drop: NEW handlers
  // ---------------------------
  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const types = Array.from(e.dataTransfer.types || []);
    const hasJson = types.includes('application/json');
    e.dataTransfer.dropEffect = hasJson ? 'copy' : 'none';
  }, []);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const types = Array.from(e.dataTransfer.types || []);
      const hasJson = types.includes('application/json');

      if (!hasJson) {
        toast.error('This item cannot be dropped here.');
        return;
      }

      const raw = e.dataTransfer.getData('application/json');
      if (!raw) {
        toast.error('No product data received.');
        return;
      }

      let product: any;
      try {
        product = JSON.parse(raw);
      } catch {
        toast.error('Invalid product data.');
        return;
      }

      const dropPt = snapToGrid(getCanvasPoint(e));
      const dimsMm = getProductDimensionsInMm(product);
      if (!dimsMm) {
        toast.error('Product dimensions not available.');
        return;
      }

      // Map lab dims to canvas pixels
      const canvasDimensions = {
        length: mmToCanvas(dimsMm.width, scale),
        width: mmToCanvas(dimsMm.depth, scale),
        height: mmToCanvas(dimsMm.height, scale)
      };

      const originalDimensions = {
        length: dimsMm.width,
        width: dimsMm.depth,
        height: dimsMm.height
      };

      // Keep a small spacing from neighbors
      const spacingPx = mmToCanvas(50, scale);
      let adjusted = { ...dropPt };
      for (const existing of placedProducts) {
        const distance = Math.hypot(dropPt.x - existing.position.x, dropPt.y - existing.position.y);
        const minDistance = (canvasDimensions.length + existing.dimensions.length) / 2 + spacingPx;
        if (distance < minDistance) {
          const angle = Math.atan2(dropPt.y - existing.position.y, dropPt.x - existing.position.x);
          adjusted.x = existing.position.x + Math.cos(angle) * minDistance;
          adjusted.y = existing.position.y + Math.sin(angle) * minDistance;
        }
      }

      const newProduct: PlacedProduct = {
        id: `product-${Date.now()}`,
        productId: product.id,
        name: product.name,
        category: product.category || 'Unknown',
        position: adjusted,
        rotation: 0,
        dimensions: canvasDimensions,
        originalDimensions,
        color: product.color || '#4caf50',
        scale: 1,
        modelPath: product.modelPath || product.model_path,
        thumbnail: product.thumbnail || product.thumbnail_path,
        description: product.description,
        specifications: product.specifications,
        finishes: product.finishes,
        variants: product.variants
      };

      const collision = wallSegments.length > 0 ? checkWallCollision(newProduct) : false;
      if (collision) {
        toast.error('Cannot place product — it intersects a wall.');
        return;
      }

      if (wallSegments.length > 0) {
        newProduct.position = snapToWallDistance(newProduct);
      }

      setPlacedProducts(prev => [...prev, newProduct]);
      toast.success(`${newProduct.name} placed successfully`);
    },
    [getCanvasPoint, snapToGrid, scale, placedProducts, wallSegments, checkWallCollision, snapToWallDistance, setPlacedProducts]
  );

  // ---------------------------

  const drawCanvas = useCallback(/* keep your existing drawCanvas implementation */ () => {
    // ... your current drawCanvas body unchanged ...
  }, [/* keep your existing deps */ showGrid, gridSize, scale, rooms, wallSegments, roomPoints, wallStartPoint, isWallPreview, doors, textAnnotations, placedProducts, currentMode, currentLineMeasurement, lastMousePos, selectedWall, hoveredWall, selectedItems, measurementUnit, showMeasurements, snapLines, snapGuides]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWallPreview) {
        setWallStartPoint(null);
        setIsWallPreview(false);
        setCurrentLineMeasurement('');
        setSnapLines({ x: null, y: null });
        setSnapGuides({ horizontal: null, vertical: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWallPreview]);

  return (
    <div className="relative w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ width: '100%', height: '100%', maxWidth: `${CANVAS_WIDTH}px`, maxHeight: `${CANVAS_HEIGHT}px` }}
        className={`w-full h-full bg-white border ${
          currentMode === 'select' && hoveredMeasurement ? 'cursor-pointer' :
          currentMode === 'select' ? 'cursor-default' : 'cursor-crosshair'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
      />

      {editingMeasurement && (
        <div
          className="absolute bg-white border-2 border-blue-500 rounded px-2 py-1 shadow-lg z-10"
          style={{ left: '50%', top: '20px', transform: 'translateX(-50%)' }}
        >
          <input
            type="number"
            value={editingMeasurement.value}
            onChange={(e) => setEditingMeasurement(prev => (prev ? { ...prev, value: e.target.value } : null))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const newLength = parseInt(editingMeasurement.value);
                if (!isNaN(newLength) && newLength > 0) adjustWallLength(editingMeasurement.wallId, newLength);
                setEditingMeasurement(null);
              } else if (e.key === 'Escape') {
                setEditingMeasurement(null);
              }
            }}
            onBlur={() => {
              const newLength = parseInt(editingMeasurement.value);
              if (!isNaN(newLength) && newLength > 0) adjustWallLength(editingMeasurement.wallId, newLength);
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
