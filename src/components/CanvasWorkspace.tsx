import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Move, RotateCcw, Copy, Trash2, DoorOpen, Crosshair } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { isProductWithinRoom, findClosestWallSegment, getWallAngle, findOptimalDoorPosition, checkDoorConflict, findWallSnapPoint } from '@/utils/collisionDetection';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, WallType } from '@/types/floorPlanTypes';

interface CanvasWorkspaceProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  wallSegments: WallSegment[];
  setWallSegments: (segments: WallSegment[]) => void;
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  doors: Door[];
  setDoors: (doors: Door[]) => void;
  textAnnotations: TextAnnotation[];
  setTextAnnotations: (annotations: TextAnnotation[]) => void;
  scale: number;
  currentTool: string;
  showGrid: boolean;
  showRuler: boolean;
  onClearAll: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
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
  scale,
  currentTool,
  showGrid,
  showRuler,
  onClearAll,
  canvasRef: externalCanvasRef
}) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Interaction states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedDoor, setSelectedDoor] = useState<string | null>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [currentDrawingPoint, setCurrentDrawingPoint] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [showLengthInput, setShowLengthInput] = useState(false);
  const [customLength, setCustomLength] = useState('');
  const [pendingLineStart, setPendingLineStart] = useState<Point | null>(null);
  const [isDrawingInteriorWall, setIsDrawingInteriorWall] = useState(false);
  const [interiorWallStart, setInteriorWallStart] = useState<Point | null>(null);
  const [currentInteriorWallEnd, setCurrentInteriorWallEnd] = useState<Point | null>(null);

  // Movement and rotation states with improved sensitivity
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragThreshold] = useState(3); // Reduced threshold for better precision
  const [hasStartedDrag, setHasStartedDrag] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationCenter, setRotationCenter] = useState<Point | null>(null);
  const [initialRotation, setInitialRotation] = useState(0);
  const [currentRotationAngle, setCurrentRotationAngle] = useState(0);
  const [showRotationHandle, setShowRotationHandle] = useState(false);
  
  // Text states
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingText, setEditingText] = useState('');

  // Wall editing states
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
  const [showWallLengthInput, setShowWallLengthInput] = useState(false);
  const [customWallLength, setCustomWallLength] = useState('');

  // Collision detection states
  const [showCollisionWarning, setShowCollisionWarning] = useState(false);
  const [collisionWarningPos, setCollisionWarningPos] = useState<Point>({ x: 0, y: 0 });

  // Cursor and crosshair states
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0, y: 0 });

  // Debouncing and timing
  const [lastClickTime, setLastClickTime] = useState(0);
  const [doubleClickTimeout, setDoubleClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // Pan sensitivity - significantly reduced for smoother control
  const PAN_SENSITIVITY = 0.03; // Much more controlled panning

  // Enhanced state persistence debugging
  useEffect(() => {
    console.log('🔍 CanvasWorkspace - Wall segments state updated:', {
      count: wallSegments.length,
      segments: wallSegments.map(w => ({ id: w.id, type: w.type, start: w.start, end: w.end }))
    });
  }, [wallSegments]);

  // Fixed helper function to add wall segment with proper TypeScript typing
  const addWallSegment = useCallback((newWall: WallSegment) => {
    console.log('🔧 CanvasWorkspace - Adding wall segment:', newWall);
    console.log('📊 Current wallSegments count before add:', wallSegments.length);
    
    // Use direct array manipulation instead of functional update
    const updatedWalls = [...wallSegments, newWall];
    console.log('📊 Updated wallSegments count after add:', updatedWalls.length);
    console.log('✅ Wall successfully added to state:', updatedWalls.map(w => w.id));
    
    setWallSegments(updatedWalls);
    
    // Force a re-render by updating drawing state
    setCurrentDrawingPoint(null);
    toast.success(`Wall created! Total: ${updatedWalls.length} walls`);
  }, [wallSegments, setWallSegments]);

  // Helper function to find wall segment by ID
  const findWallSegmentById = (id: string): WallSegment | null => {
    return wallSegments.find(wall => wall.id === id) || null;
  };

  // Helper function to get wall segment from room points
  const getRoomWallSegment = (index: number): [Point, Point] | null => {
    if (roomPoints.length < 2 || index >= roomPoints.length) return null;
    const nextIndex = (index + 1) % roomPoints.length;
    return [roomPoints[index], roomPoints[nextIndex]];
  };

  // Helper function to find wall segment (room or interior) by ID
  const findWallById = (id: string): { segment: [Point, Point], type: WallType } | null => {
    // Check if it's a room wall
    if (id.startsWith('room-wall-')) {
      const index = parseInt(id.replace('room-wall-', ''));
      const segment = getRoomWallSegment(index);
      if (segment) {
        return { segment, type: WallType.EXTERIOR };
      }
    }
    
    // Check interior walls
    const wall = findWallSegmentById(id);
    if (wall) {
      return { segment: [wall.start, wall.end], type: wall.type };
    }
    
    return null;
  };

  const findProductAt = (point: Point): string | null => {
    for (const product of placedProducts) {
      const { position, rotation, dimensions } = product;
      const productScale = product.scale || 1;
      const width = dimensions.length * scale * productScale;
      const height = dimensions.width * scale * productScale;
      
      // Transform point to product's local coordinate system
      const dx = point.x - position.x;
      const dy = point.y - position.y;
      const angle = (rotation * Math.PI) / 180;
      const localX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
      const localY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
      
      if (Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2) {
        return product.id;
      }
    }
    return null;
  };

  const findTextAt = (point: Point): string | null => {
    for (const annotation of textAnnotations) {
      const distance = Math.sqrt(
        Math.pow(point.x - annotation.position.x, 2) + 
        Math.pow(point.y - annotation.position.y, 2)
      );
      if (distance < 20 / zoom) {
        return annotation.id;
      }
    }
    return null;
  };

  const findWallAt = (point: Point): number | null => {
    if (roomPoints.length < 2) return null;
    
    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      if (nextIndex === 0 && roomPoints.length < 3) continue;
      
      const start = roomPoints[i];
      const end = roomPoints[nextIndex];
      
      // Calculate distance from point to line segment
      const A = point.x - start.x;
      const B = point.y - start.y;
      const C = end.x - start.x;
      const D = end.y - start.y;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) param = dot / lenSq;
      
      let xx, yy;
      if (param < 0) {
        xx = start.x;
        yy = start.y;
      } else if (param > 1) {
        xx = end.x;
        yy = end.y;
      } else {
        xx = start.x + param * C;
        yy = start.y + param * D;
      }
      
      const dx = point.x - xx;
      const dy = point.y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10 / zoom) {
        return i;
      }
    }
    return null;
  };

  const duplicateSelectedProduct = () => {
    if (!selectedProduct) return;
    
    const product = placedProducts.find(p => p.id === selectedProduct);
    if (!product) return;
    
    const newProduct: PlacedProduct = {
      ...product,
      id: `${product.productId}-${Date.now()}`,
      position: {
        x: product.position.x + 50,
        y: product.position.y + 50
      }
    };
    
    if (isProductWithinRoom(newProduct, roomPoints, wallSegments, scale)) {
      setPlacedProducts([...placedProducts, newProduct]);
      setSelectedProduct(newProduct.id);
      toast.success('Product duplicated');
    } else {
      toast.error('Cannot duplicate product outside room bounds');
    }
  };

  const deleteSelectedProduct = () => {
    if (!selectedProduct) return;
    setPlacedProducts(placedProducts.filter(p => p.id !== selectedProduct));
    setSelectedProduct(null);
    toast.success('Product deleted');
  };

  const deleteSelectedText = () => {
    if (!selectedText) return;
    setTextAnnotations(textAnnotations.filter(t => t.id !== selectedText));
    setSelectedText(null);
    toast.success('Text deleted');
  };

  const snapToGrid = (point: Point): Point => {
    if (!showGrid) return point;
    const gridSize = scale * 0.25;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Enhanced grid rendering
    if (showGrid) {
      drawPrecisionGrid(ctx, rect.width / zoom, rect.height / zoom);
    }
    
    // Draw room (exterior walls)
    drawRoom(ctx);
    
    // Draw interior walls - improved rendering with enhanced logging
    drawInteriorWalls(ctx);
    
    // Draw current line while drawing exterior walls
    if (currentTool === 'wall' && isDrawingActive && currentDrawingPoint && roomPoints.length > 0) {
      drawCurrentLine(ctx);
    }
    
    // Draw current interior wall being drawn
    if (currentTool === 'interior-wall' && isDrawingInteriorWall && interiorWallStart && currentInteriorWallEnd) {
      drawCurrentInteriorWall(ctx);
    }
    
    // Draw doors
    drawDoors(ctx);
    
    // Draw placed products
    drawPlacedProducts(ctx);
    
    // Draw rotation handle for rotate tool
    if (currentTool === 'rotate' && selectedProduct && showRotationHandle) {
      drawRotationHandle(ctx);
    }
    
    // Draw dimensions on completed walls with better alignment
    if (!isDrawingActive) {
      drawPreciseDimensions(ctx);
    }

    // Draw text annotations
    drawTextAnnotations(ctx);

    // Draw collision warning if visible
    if (showCollisionWarning) {
      drawCollisionWarning(ctx);
    }

    // Draw wall selection highlight
    if (currentTool === 'wall-edit' && selectedWallIndex !== null) {
      drawSelectedWall(ctx);
    }

    ctx.restore();
  }, [roomPoints, wallSegments, placedProducts, textAnnotations, doors, selectedProduct, selectedText, selectedDoor, selectedWallIndex, zoom, pan, currentDrawingPoint, showGrid, showRuler, isDrawingActive, isDrawingInteriorWall, interiorWallStart, currentInteriorWallEnd, showRotationHandle, showCollisionWarning, currentTool, cursorPosition]);

  const drawPrecisionGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.5 / zoom;

    const gridSize = scale * 0.25;
    const startX = Math.floor(-pan.x / gridSize) * gridSize;
    const startY = Math.floor(-pan.y / gridSize) * gridSize;
    
    for (let x = startX; x <= width - pan.x; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -pan.y);
      ctx.lineTo(x, height - pan.y);
      ctx.stroke();
    }

    for (let y = startY; y <= height - pan.y; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-pan.x, y);
      ctx.lineTo(width - pan.x, y);
      ctx.stroke();
    }

    // Draw major grid lines every meter
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1 / zoom;
    
    const majorGridSize = scale;
    const majorStartX = Math.floor(-pan.x / majorGridSize) * majorGridSize;
    const majorStartY = Math.floor(-pan.y / majorGridSize) * majorGridSize;
    
    for (let x = majorStartX; x <= width - pan.x; x += majorGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -pan.y);
      ctx.lineTo(x, height - pan.y);
      ctx.stroke();
    }

    for (let y = majorStartY; y <= height - pan.y; y += majorGridSize) {
      ctx.beginPath();
      ctx.moveTo(-pan.x, y);
      ctx.lineTo(width - pan.x, y);
      ctx.stroke();
    }
  };

  const drawRoom = (ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 1) return;

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3 / zoom;

    if (roomPoints.length > 2 && !isDrawingActive) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.beginPath();
      ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
      for (let i = 1; i < roomPoints.length; i++) {
        ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
    for (let i = 1; i < roomPoints.length; i++) {
      ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
    }
    if (!isDrawingActive && roomPoints.length > 2) {
      ctx.closePath();
    }
    ctx.stroke();

    // Draw points with better visibility
    ctx.fillStyle = '#1f2937';
    roomPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3 / zoom, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawInteriorWalls = (ctx: CanvasRenderingContext2D) => {
    console.log('🎨 CanvasWorkspace - Drawing interior walls:', wallSegments.length);
    
    wallSegments.forEach((wall, index) => {
      console.log(`🎨 CanvasWorkspace - Drawing wall ${index}:`, wall);
      
      ctx.strokeStyle = wall.type === WallType.INTERIOR ? '#f59e0b' : '#1f2937';
      ctx.lineWidth = wall.type === WallType.INTERIOR ? 4 / zoom : 3 / zoom; // Made interior walls even thicker for better visibility
      
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
      
      // Draw endpoints with enhanced visibility
      ctx.fillStyle = wall.type === WallType.INTERIOR ? '#f59e0b' : '#1f2937';
      [wall.start, wall.end].forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5 / zoom, 0, 2 * Math.PI); // Made endpoints even larger
        ctx.fill();
      });
      
      // Add wall index for debugging
      const midX = (wall.start.x + wall.end.x) / 2;
      const midY = (wall.start.y + wall.end.y) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${14 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`W${index + 1}`, midX, midY);
    });
  };

  const drawCurrentInteriorWall = (ctx: CanvasRenderingContext2D) => {
    if (!interiorWallStart || !currentInteriorWallEnd) return;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4 / zoom; // Made preview even thicker for better visibility
    ctx.setLineDash([8 / zoom, 8 / zoom]); // Made dashes more visible

    ctx.beginPath();
    ctx.moveTo(interiorWallStart.x, interiorWallStart.y);
    ctx.lineTo(currentInteriorWallEnd.x, currentInteriorWallEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Show length with enhanced styling
    const length = Math.sqrt(
      Math.pow(currentInteriorWallEnd.x - interiorWallStart.x, 2) +
      Math.pow(currentInteriorWallEnd.y - interiorWallStart.y, 2)
    ) / scale;

    if (length > 0.01) {
      const angle = Math.atan2(currentInteriorWallEnd.y - interiorWallStart.y, currentInteriorWallEnd.x - interiorWallStart.x);
      const midX = (interiorWallStart.x + currentInteriorWallEnd.x) / 2;
      const midY = (interiorWallStart.y + currentInteriorWallEnd.y) / 2;
      
      const offsetDistance = 30 / zoom;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      
      ctx.save();
      ctx.translate(midX + offsetX, midY + offsetY);
      ctx.rotate(angle);
      ctx.fillStyle = '#f59e0b';
      ctx.font = `bold ${14 / zoom}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillRect(-30 / zoom, -12 / zoom, 60 / zoom, 24 / zoom);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${length.toFixed(2)}m`, 0, 4 / zoom);
      ctx.restore();
    }
  };

  const drawCurrentLine = (ctx: CanvasRenderingContext2D) => {
    if (!currentDrawingPoint || roomPoints.length === 0) return;

    const lastPoint = roomPoints[roomPoints.length - 1];
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([4 / zoom, 4 / zoom]);

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentDrawingPoint.x, currentDrawingPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const length = calculateDistance(lastPoint, currentDrawingPoint);
    if (length > 0.01) {
      const angle = Math.atan2(currentDrawingPoint.y - lastPoint.y, currentDrawingPoint.x - lastPoint.x);
      const midX = (lastPoint.x + currentDrawingPoint.x) / 2;
      const midY = (lastPoint.y + currentDrawingPoint.y) / 2;
      
      const offsetDistance = 25 / zoom;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      
      ctx.save();
      ctx.translate(midX + offsetX, midY + offsetY);
      ctx.rotate(angle);
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${12 / zoom}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillRect(-20 / zoom, -8 / zoom, 40 / zoom, 16 / zoom);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${length.toFixed(2)}m`, 0, 3 / zoom);
      ctx.restore();
    }
  };

  const drawPreciseDimensions = (ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 2) return;

    ctx.font = `bold ${11 / zoom}px "Inter", sans-serif`;
    ctx.textAlign = 'center';

    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      if (nextIndex === 0 && roomPoints.length < 3) continue;

      const point1 = roomPoints[i];
      const point2 = roomPoints[nextIndex];
      const length = calculateDistance(point1, point2);
      
      if (length > 0.01) {
        const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
        const midX = (point1.x + point2.x) / 2;
        const midY = (point1.y + point2.y) / 2;
        
        const offsetDistance = 25 / zoom;
        const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
        const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
        
        ctx.save();
        ctx.translate(midX + offsetX, midY + offsetY);
        ctx.rotate(angle);
        
        // Background for better readability
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(-18 / zoom, -7 / zoom, 36 / zoom, 14 / zoom);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(-18 / zoom, -7 / zoom, 36 / zoom, 14 / zoom);
        
        ctx.fillStyle = '#000000';
        ctx.fillText(`${length.toFixed(2)}m`, 0, 3 / zoom);
        ctx.restore();
      }
    }
  };

  const drawPlacedProducts = (ctx: CanvasRenderingContext2D) => {
    placedProducts.forEach(product => {
      const { position, rotation, dimensions, color, id, name } = product;
      const productScale = product.scale || 1;
      const width = dimensions.length * scale * productScale;
      const height = dimensions.width * scale * productScale;
      
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Draw product rectangle
      ctx.fillStyle = selectedProduct === id ? 
        `${color}cc` : 
        `${color}99`;
      ctx.fillRect(-width / 2, -height / 2, width, height);
      
      // Draw border
      ctx.strokeStyle = selectedProduct === id ? '#ef4444' : '#1f2937';
      ctx.lineWidth = selectedProduct === id ? 3 / zoom : 2 / zoom;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
      
      // Draw product name
      ctx.fillStyle = '#000000';
      ctx.font = `${12 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(name, 0, 0);
      
      // Draw selection handles for move tool only
      if (selectedProduct === id && currentTool === 'select') {
        drawProductHandles(ctx, width, height);
      }
      
      ctx.restore();
    });
  };

  const drawProductHandles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#ef4444';
    const handleSize = 8 / zoom;
    
    // Corner handles
    const corners = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
      { x: -width / 2, y: height / 2 }
    ];
    
    corners.forEach(corner => {
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });
    
    // Center handle for moving
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(0, 0, handleSize / 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawRotationHandle = (ctx: CanvasRenderingContext2D) => {
    const product = placedProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const { position, dimensions } = product;
    const productScale = product.scale || 1;
    const width = dimensions.length * scale * productScale;
    const height = dimensions.width * scale * productScale;
    const radius = Math.max(width, height) / 2 + 30 / zoom;

    ctx.save();
    ctx.translate(position.x, position.y);

    // Draw rotation circle
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([5 / zoom, 5 / zoom]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw rotation handle
    const handleX = Math.cos(currentRotationAngle * Math.PI / 180) * radius;
    const handleY = Math.sin(currentRotationAngle * Math.PI / 180) * radius;
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(handleX, handleY, 8 / zoom, 0, 2 * Math.PI);
    ctx.fill();

    // Draw angle indicator
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${14 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(currentRotationAngle)}°`, 0, -radius - 20 / zoom);

    ctx.restore();
  };

  const drawDoors = (ctx: CanvasRenderingContext2D) => {
    doors.forEach(door => {
      // Find the wall segment this door is attached to
      const wallInfo = findWallById(door.wallSegmentId);
      if (!wallInfo) return;
      
      const [wallStart, wallEnd] = wallInfo.segment;
      
      const doorX = wallStart.x + (wallEnd.x - wallStart.x) * door.wallPosition;
      const doorY = wallStart.y + (wallEnd.y - wallStart.y) * door.wallPosition;
      
      ctx.save();
      ctx.translate(doorX, doorY);
      ctx.rotate((door.rotation * Math.PI) / 180);
      
      const doorWidth = door.width * scale;
      
      // Draw door opening
      ctx.strokeStyle = selectedDoor === door.id ? '#ef4444' : '#10b981';
      ctx.lineWidth = 4 / zoom;
      ctx.beginPath();
      ctx.moveTo(-doorWidth / 2, 0);
      ctx.lineTo(doorWidth / 2, 0);
      ctx.stroke();
      
      // Draw door swing
      ctx.strokeStyle = selectedDoor === door.id ? '#ef444440' : '#10b98140';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.arc(doorWidth / 2, 0, doorWidth * 0.8, 0, Math.PI / 2);
      ctx.stroke();
      
      ctx.restore();
    });
  };

  const drawTextAnnotations = (ctx: CanvasRenderingContext2D) => {
    textAnnotations.forEach(annotation => {
      ctx.fillStyle = selectedText === annotation.id ? '#ef4444' : '#000000';
      ctx.font = `${annotation.fontSize / zoom}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(annotation.text, annotation.position.x, annotation.position.y);
      
      if (selectedText === annotation.id) {
        const metrics = ctx.measureText(annotation.text);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(
          annotation.position.x - 2,
          annotation.position.y - annotation.fontSize / zoom,
          metrics.width + 4,
          annotation.fontSize / zoom + 4
        );
      }
    });
  };

  const drawCollisionWarning = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.font = `bold ${16 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ Cannot place outside room!', collisionWarningPos.x, collisionWarningPos.y);
  };

  const drawSelectedWall = (ctx: CanvasRenderingContext2D) => {
    if (selectedWallIndex === null || roomPoints.length < 2) return;

    const nextIndex = (selectedWallIndex + 1) % roomPoints.length;
    const point1 = roomPoints[selectedWallIndex];
    const point2 = roomPoints[nextIndex];

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5 / zoom;
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke();
  };

  // Recenter function to center the view on the room layout
  const recenterCanvas = () => {
    if (roomPoints.length === 0 && placedProducts.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      toast.success('Canvas recentered');
      return;
    }

    // Calculate bounding box of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Include room points
    roomPoints.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    // Include products
    placedProducts.forEach(product => {
      const { position, dimensions } = product;
      const productScale = product.scale || 1;
      const width = dimensions.length * scale * productScale;
      const height = dimensions.width * scale * productScale;
      
      minX = Math.min(minX, position.x - width / 2);
      minY = Math.min(minY, position.y - height / 2);
      maxX = Math.max(maxX, position.x + width / 2);
      maxY = Math.max(maxY, position.y + height / 2);
    });

    if (minX === Infinity) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Calculate appropriate zoom level with padding
    const padding = 100;
    const zoomX = (rect.width - padding) / contentWidth;
    const zoomY = (rect.height - padding) / contentHeight;
    const newZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.1), 3);
    
    setZoom(newZoom);
    setPan({
      x: rect.width / 2 / newZoom - centerX,
      y: rect.height / 2 / newZoom - centerY
    });
    
    toast.success('Canvas recentered and zoomed to fit');
  };

  const calculateDistance = (point1: Point, point2: Point): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy) / scale;
  };

  const getCanvasMousePosition = (e: MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;
    
    return { x, y };
  };

  const snapToAngle = (angle: number): number => {
    const snapIncrement = 45;
    return Math.round(angle / snapIncrement) * snapIncrement;
  };

  // Enhanced keyboard shortcuts with improved sensitivity
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC to cleanly exit any active mode
      if (e.key === 'Escape') {
        e.preventDefault();
        resetAllStates();
        return;
      }

      // Enter to input custom length while drawing
      if (e.key === 'Enter' && isDrawingActive && currentDrawingPoint && roomPoints.length > 0) {
        e.preventDefault();
        setPendingLineStart(roomPoints[roomPoints.length - 1]);
        setShowLengthInput(true);
        return;
      }

      if (!selectedProduct && !selectedText) return;
      
      switch (e.key.toLowerCase()) {
        case 'd':
          e.preventDefault();
          if (selectedProduct && currentTool === 'select') duplicateSelectedProduct();
          break;
        case 'delete':
        case 'backspace':
          e.preventDefault();
          if (selectedProduct) deleteSelectedProduct();
          if (selectedText) deleteSelectedText();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedProduct, selectedText, isDrawingActive, currentDrawingPoint, roomPoints, currentTool]);

  const resetAllStates = () => {
    setIsDrawingActive(false);
    setCurrentDrawingPoint(null);
    setPendingLineStart(null);
    setSelectedProduct(null);
    setSelectedText(null);
    setIsEditingText(false);
    setShowRotationHandle(false);
    setIsDragging(false);
    setIsRotating(false);
    setHasStartedDrag(false);
    
    // Reset interior wall drawing state properly
    if (isDrawingInteriorWall) {
      console.log('🔄 CanvasWorkspace - Resetting interior wall drawing state');
      setIsDrawingInteriorWall(false);
      setInteriorWallStart(null);
      setCurrentInteriorWallEnd(null);
      toast.success('Interior wall drawing cancelled');
    }
    
    if (isDrawingActive) {
      toast.success('Drawing cancelled');
    }
  };

  // Mouse event handlers with improved sensitivity
  const handleMouseDown = (e: MouseEvent) => {
    const point = snapToGrid(getCanvasMousePosition(e));
    const currentTime = Date.now();

    // Handle right click for panning with reduced sensitivity
    if (e.button === 2) {
      setIsPanning(true);
      setLastPanPoint(getCanvasMousePosition(e));
      return;
    }

    // Double click detection
    if (currentTime - lastClickTime < 300) {
      if (doubleClickTimeout) {
        clearTimeout(doubleClickTimeout);
        setDoubleClickTimeout(null);
      }
      handleDoubleClick(point, e);
      return;
    }

    setLastClickTime(currentTime);
    
    const timeout = setTimeout(() => {
      handleSingleClick(point, e);
    }, 200);
    
    setDoubleClickTimeout(timeout);
  };

  const handleSingleClick = (point: Point, e: MouseEvent) => {
    console.log('🖱️ CanvasWorkspace - Single click detected', { currentTool, point });
    
    // Tool-specific handling
    switch (currentTool) {
      case 'wall':
        handleWallToolMouseDown(point, e);
        break;
      case 'interior-wall':
        console.log('🔧 CanvasWorkspace - Routing to interior wall handler');
        handleInteriorWallToolMouseDown(point, e);
        break;
      case 'select':
        handleSelectToolMouseDown(point, e);
        break;
      case 'rotate':
        handleRotateToolMouseDown(point, e);
        break;
      case 'door':
        handleDoorToolMouseDown(point, e);
        break;
      case 'eraser':
        handleEraserToolMouseDown(point, e);
        break;
      default:
        console.log('⚠️ CanvasWorkspace - Unknown tool:', currentTool);
    }
  };

  const handleDoubleClick = (point: Point, e: MouseEvent) => {
    if (currentTool === 'wall' && isDrawingActive) {
      // Double click - finish room
      if (roomPoints.length > 2) {
        setIsDrawingActive(false);
        setCurrentDrawingPoint(null);
        toast.success('Room completed');
      }
    }
  };

  const handleWallToolMouseDown = (point: Point, e: MouseEvent) => {
    if (!isDrawingActive) {
      setIsDrawingActive(true);
      setRoomPoints([point]);
    } else {
      setRoomPoints([...roomPoints, point]);
    }
  };

  const handleInteriorWallToolMouseDown = (point: Point, e: MouseEvent) => {
    console.log('🏗️ CanvasWorkspace - Interior wall tool clicked!', { 
      currentTool, 
      point, 
      isDrawingInteriorWall,
      interiorWallStart,
      wallSegments: wallSegments.length 
    });

    const snapPoint = findWallSnapPoint(point, roomPoints, wallSegments, 20 / zoom);
    const finalPoint = snapPoint || point;
    
    console.log('📍 CanvasWorkspace - Point selected:', { 
      originalPoint: point, 
      snapPoint, 
      finalPoint, 
      hasSnapped: !!snapPoint 
    });

    if (!isDrawingInteriorWall) {
      // Start new interior wall
      console.log('🚀 CanvasWorkspace - Starting new interior wall at:', finalPoint);
      setIsDrawingInteriorWall(true);
      setInteriorWallStart(finalPoint);
      setCurrentInteriorWallEnd(finalPoint);
      toast.success('Interior wall started - click again to finish');
    } else {
      // Finish interior wall
      console.log('🏁 CanvasWorkspace - Finishing interior wall', { 
        start: interiorWallStart, 
        end: finalPoint 
      });
      
      if (interiorWallStart) {
        const newWall: WallSegment = {
          id: `interior-wall-${Date.now()}`,
          start: interiorWallStart,
          end: finalPoint,
          type: WallType.INTERIOR,
          thickness: 0.1 // 10cm default thickness
        };
        
        console.log('✅ CanvasWorkspace - Creating new wall:', newWall);
        console.log('📊 Current wall segments before update:', wallSegments.length);
        
        // Use the improved addWallSegment function with proper state management
        addWallSegment(newWall);
        
        // Reset interior wall drawing state
        setIsDrawingInteriorWall(false);
        setInteriorWallStart(null);
        setCurrentInteriorWallEnd(null);
        
        // Provide enhanced user feedback
        console.log('🎉 CanvasWorkspace - Interior wall creation completed');
      } else {
        console.error('❌ CanvasWorkspace - No interior wall start point!');
        toast.error('Error: No start point for interior wall');
      }
    }
  };

  const handleSelectToolMouseDown = (point: Point, e: MouseEvent) => {
    const productId = findProductAt(point);
    const textId = findTextAt(point);
    
    if (productId) {
      setSelectedProduct(productId);
      setSelectedText(null);
      setIsDragging(true);
      setDragStart(point);
      setHasStartedDrag(false);
    } else if (textId) {
      setSelectedText(textId);
      setSelectedProduct(null);
      setIsDragging(true);
      setDragStart(point);
      setHasStartedDrag(false);
    } else {
      setSelectedProduct(null);
      setSelectedText(null);
    }
  };

  const handleRotateToolMouseDown = (point: Point, e: MouseEvent) => {
    const productId = findProductAt(point);
    
    if (productId) {
      const product = placedProducts.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(productId);
        setRotationCenter(product.position);
        setInitialRotation(product.rotation);
        setCurrentRotationAngle(product.rotation);
        setIsRotating(true);
        setShowRotationHandle(true);
      }
    } else {
      setSelectedProduct(null);
      setShowRotationHandle(false);
    }
  };

  const handleDoorToolMouseDown = (point: Point, e: MouseEvent) => {
    const result = findClosestWallSegment(point, roomPoints, wallSegments);
    if (!result) return;

    const doorPosition = findOptimalDoorPosition(point, result.segment);
    const newDoor: Door = {
      id: `door-${Date.now()}`,
      position: point,
      wallSegmentId: result.id,
      wallPosition: doorPosition.wallPosition,
      rotation: doorPosition.rotation,
      width: 0.9,
      swingDirection: 'inward',
      isEmbedded: true
    };

    if (!checkDoorConflict(newDoor, doors, newDoor.width * scale)) {
      setDoors([...doors, newDoor]);
      toast.success('Door placed');
    } else {
      toast.error('Door conflicts with existing door');
    }
  };

  const handleEraserToolMouseDown = (point: Point, e: MouseEvent) => {
    const productId = findProductAt(point);
    const textId = findTextAt(point);
    
    if (productId) {
      setPlacedProducts(placedProducts.filter(p => p.id !== productId));
      toast.success('Product erased');
    } else if (textId) {
      setTextAnnotations(textAnnotations.filter(t => t.id !== textId));
      toast.success('Text erased');
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const point = snapToGrid(getCanvasMousePosition(e));
    setCursorPosition(point);

    if (isPanning && lastPanPoint) {
      const currentPoint = getCanvasMousePosition(e);
      const deltaX = (currentPoint.x - lastPanPoint.x) * PAN_SENSITIVITY;
      const deltaY = (currentPoint.y - lastPanPoint.y) * PAN_SENSITIVITY;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint(currentPoint);
      return;
    }

    if (currentTool === 'wall' && isDrawingActive) {
      setCurrentDrawingPoint(point);
    }

    if (currentTool === 'interior-wall' && isDrawingInteriorWall) {
      const snapPoint = findWallSnapPoint(point, roomPoints, wallSegments, 20 / zoom);
      setCurrentInteriorWallEnd(snapPoint || point);
    }

    // Improved drag handling with threshold
    if (currentTool === 'select' && isDragging && !hasStartedDrag && dragStart) {
      const distance = Math.sqrt(
        Math.pow(point.x - dragStart.x, 2) + Math.pow(point.y - dragStart.y, 2)
      );
      
      if (distance > dragThreshold) {
        setHasStartedDrag(true);
      }
    }

    if (currentTool === 'select' && isDragging && hasStartedDrag && selectedProduct) {
      handleProductDrag(point);
    }

    if (currentTool === 'select' && isDragging && hasStartedDrag && selectedText) {
      handleTextDrag(point);
    }

    if (currentTool === 'rotate' && isRotating && selectedProduct) {
      handleProductRotation(point);
    }
  };

  const handleProductDrag = (point: Point) => {
    if (!selectedProduct || !dragStart) return;

    const product = placedProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const newPosition = {
      x: product.position.x + (point.x - dragStart.x),
      y: product.position.y + (point.y - dragStart.y)
    };

    const updatedProduct = { ...product, position: newPosition };

    if (isProductWithinRoom(updatedProduct, roomPoints, wallSegments, scale)) {
      setPlacedProducts(placedProducts.map(p => 
        p.id === selectedProduct ? updatedProduct : p
      ));
      setDragStart(point);
      setShowCollisionWarning(false);
    } else {
      setShowCollisionWarning(true);
      setCollisionWarningPos(point);
    }
  };

  const handleTextDrag = (point: Point) => {
    if (!selectedText || !dragStart) return;

    const annotation = textAnnotations.find(t => t.id === selectedText);
    if (!annotation) return;

    const newPosition = {
      x: annotation.position.x + (point.x - dragStart.x),
      y: annotation.position.y + (point.y - dragStart.y)
    };

    setTextAnnotations(textAnnotations.map(t => 
      t.id === selectedText ? { ...t, position: newPosition } : t
    ));
    setDragStart(point);
  };

  const handleProductRotation = (point: Point) => {
    if (!selectedProduct || !rotationCenter) return;

    const angle = Math.atan2(
      point.y - rotationCenter.y,
      point.x - rotationCenter.x
    ) * 180 / Math.PI;

    const snappedAngle = snapToAngle(angle);
    setCurrentRotationAngle(snappedAngle);

    const product = placedProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const updatedProduct = { ...product, rotation: snappedAngle };

    if (isProductWithinRoom(updatedProduct, roomPoints, wallSegments, scale)) {
      setPlacedProducts(placedProducts.map(p => 
        p.id === selectedProduct ? updatedProduct : p
      ));
      setShowCollisionWarning(false);
    } else {
      setShowCollisionWarning(true);
      setCollisionWarningPos(point);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setLastPanPoint(null);
    setIsDragging(false);
    setIsRotating(false);
    setDragStart(null);
    setHasStartedDrag(false);
    setShowCollisionWarning(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const productData = e.dataTransfer?.getData('product');
    if (!productData) return;

    const product = JSON.parse(productData);
    const dropPoint = getCanvasMousePosition(e);

    const newProduct: PlacedProduct = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      position: snapToGrid(dropPoint),
      rotation: 0,
      dimensions: product.dimensions,
      color: product.color,
      scale: 1
    };

    if (isProductWithinRoom(newProduct, roomPoints, wallSegments, scale)) {
      setPlacedProducts([...placedProducts, newProduct]);
      toast.success(`${product.name} placed`);
    } else {
      toast.error('Cannot place product outside room bounds or overlapping walls');
    }
  };

  const handleLengthSubmit = () => {
    const length = parseFloat(customLength);
    if (isNaN(length) || length <= 0 || !pendingLineStart) {
      toast.error('Please enter a valid length');
      return;
    }

    const lastPoint = roomPoints[roomPoints.length - 1];
    const angle = Math.atan2(
      currentDrawingPoint!.y - lastPoint.y,
      currentDrawingPoint!.x - lastPoint.x
    );

    const newPoint = {
      x: lastPoint.x + Math.cos(angle) * length * scale,
      y: lastPoint.y + Math.sin(angle) * length * scale
    };

    setRoomPoints([...roomPoints, newPoint]);
    setShowLengthInput(false);
    setCustomLength('');
    setPendingLineStart(null);
  };

  const handleWallLengthSubmit = () => {
    if (selectedWallIndex === null) return;

    const length = parseFloat(customWallLength);
    if (isNaN(length) || length <= 0) {
      toast.error('Please enter a valid length');
      return;
    }

    const nextIndex = (selectedWallIndex + 1) % roomPoints.length;
    const startPoint = roomPoints[selectedWallIndex];
    const endPoint = roomPoints[nextIndex];
    
    const currentLength = calculateDistance(startPoint, endPoint);
    const scale_factor = length / currentLength;
    
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const newEndPoint = {
      x: startPoint.x + Math.cos(angle) * length * scale,
      y: startPoint.y + Math.sin(angle) * length * scale
    };

    const newRoomPoints = [...roomPoints];
    newRoomPoints[nextIndex] = newEndPoint;
    setRoomPoints(newRoomPoints);
    
    setShowWallLengthInput(false);
    setSelectedWallIndex(null);
    toast.success('Wall length updated');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('dragover', (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      canvas.removeEventListener('drop', handleDrop);
      canvas.removeEventListener('dragover', (e) => e.preventDefault());
    };
  }, [currentTool, isDrawingActive, isDragging, isRotating, isPanning, selectedProduct, selectedText, selectedWallIndex, roomPoints, placedProducts, textAnnotations, doors, hasStartedDrag, wallSegments, isDrawingInteriorWall]);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const resizeCanvas = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      }, 100);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(resizeTimeout);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Get mouse position for zoom centering
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * delta, 0.1), 5);
      
      // Adjust pan to zoom towards mouse cursor
      const zoomFactor = newZoom / zoom;
      const newPanX = mouseX / newZoom - (mouseX / zoom - pan.x) * zoomFactor;
      const newPanY = mouseY / newZoom - (mouseY / zoom - pan.y) * zoomFactor;
      
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [zoom, pan]);

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(drawCanvas);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawCanvas]);

  return (
    <div className="relative w-full h-full bg-white">
      {/* Ruler borders - Fixed positioning */}
      {showRuler && (
        <>
          {/* Top ruler */}
          <div className="absolute top-0 left-8 right-0 h-8 bg-gray-100 border-b border-gray-300 z-10">
            <div className="relative h-full overflow-hidden">
              {Array.from({ length: Math.ceil((window.innerWidth) / (scale * zoom)) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-gray-400"
                  style={{
                    left: `${i * scale * zoom + pan.x * zoom}px`,
                    transform: pan.x * zoom + i * scale * zoom < 0 ? 'translateX(100%)' : 'none'
                  }}
                >
                  {i % 1 === 0 && (
                    <span className="absolute top-1 left-1 text-xs text-gray-600">
                      {i}m
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Left ruler */}
          <div className="absolute top-8 left-0 bottom-0 w-8 bg-gray-100 border-r border-gray-300 z-10">
            <div className="relative w-full h-full overflow-hidden">
              {Array.from({ length: Math.ceil((window.innerHeight) / (scale * zoom)) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 w-full border-t border-gray-400"
                  style={{
                    top: `${i * scale * zoom + pan.y * zoom}px`,
                    transform: pan.y * zoom + i * scale * zoom < 0 ? 'translateY(100%)' : 'none'
                  }}
                >
                  {i % 1 === 0 && (
                    <span className="absolute left-1 top-1 text-xs text-gray-600 transform -rotate-90 origin-left">
                      {i}m
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Corner piece */}
          <div className="absolute top-0 left-0 w-8 h-8 bg-gray-200 border-r border-b border-gray-300 z-20"></div>
        </>
      )}

      <div 
        ref={containerRef} 
        className={`w-full h-full ${showRuler ? 'ml-8 mt-8' : ''}`}
      >
        <canvas
          ref={canvasRef}
          className="bg-white shadow-sm w-full h-full"
          style={{
            cursor: currentTool === 'wall' || currentTool === 'door' ? 'crosshair' : 
                   currentTool === 'select' ? 'default' :
                   currentTool === 'rotate' ? 'grab' : 'crosshair'
          }}
        />
      </div>
      
      {/* Enhanced Length Input Modal */}
      {showLengthInput && (
        <div className="absolute top-6 left-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-30">
          <h3 className="font-semibold text-gray-900 mb-3">Enter Wall Length</h3>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={customLength}
              onChange={(e) => setCustomLength(e.target.value)}
              placeholder="Length in meters"
              className="w-36 text-sm"
              autoFocus
            />
            <Button onClick={handleLengthSubmit} size="sm" className="px-4">
              Apply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowLengthInput(false);
                setCustomLength('');
                setPendingLineStart(null);
              }}
              className="px-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Text Edit Modal */}
      {isEditingText && (
        <div className="absolute top-6 left-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-30">
          <h3 className="font-semibold text-gray-900 mb-3">Edit Text</h3>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              placeholder="Enter text"
              className="w-48 text-sm"
              autoFocus
            />
            <Button
              onClick={() => {
                if (selectedText) {
                  setTextAnnotations(textAnnotations.map(t => 
                    t.id === selectedText ? { ...t, text: editingText } : t
                  ));
                }
                setIsEditingText(false);
                setEditingText('');
              }}
              size="sm"
              className="px-4"
            >
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditingText(false);
                setEditingText('');
              }}
              className="px-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Recenter Button */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={recenterCanvas}
          className="w-12 h-12 p-0 shadow-lg bg-white hover:bg-gray-50"
          title="Recenter canvas view (Ctrl+0)"
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>

      {/* Enhanced Room Area Display */}
      {roomPoints.length > 2 && !isDrawingActive && (
        <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-30">
          <span className="text-sm font-semibold text-gray-900">
            Room Area: {calculateDistance(roomPoints[0], roomPoints[1]) ? (function() {
              let area = 0;
              for (let i = 0; i < roomPoints.length; i++) {
                const j = (i + 1) % roomPoints.length;
                area += roomPoints[i].x * roomPoints[j].y;
                area -= roomPoints[j].x * roomPoints[i].y;
              }
              area = Math.abs(area) / 2;
              return (area / (scale * scale)).toFixed(2);
            })() : '0'} m²
          </span>
        </div>
      )}

      {/* Enhanced Debug Display */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-xs z-50 font-mono">
        <div>Tool: {currentTool}</div>
        <div>Interior Walls: {wallSegments.length}</div>
        <div>Drawing: {isDrawingInteriorWall ? 'YES' : 'NO'}</div>
        {isDrawingInteriorWall && (
          <div className="text-orange-300">
            Start: {interiorWallStart ? `${interiorWallStart.x.toFixed(0)},${interiorWallStart.y.toFixed(0)}` : 'None'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasWorkspace;
