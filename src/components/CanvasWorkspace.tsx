import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move, RotateCcw, Copy, Trash2, DoorOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { isProductWithinRoom, findClosestWallSegment, getWallAngle, findOptimalDoorPosition, checkDoorConflict } from '@/utils/collisionDetection';
import { Point, PlacedProduct, Door, TextAnnotation } from '@/types/floorPlanTypes';

interface CanvasWorkspaceProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
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
  
  // Enhanced interaction states with smoothing
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [smoothedPan, setSmoothedPan] = useState({ x: 0, y: 0 });
  const [targetPan, setTargetPan] = useState({ x: 0, y: 0 });
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedDoor, setSelectedDoor] = useState<string | null>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [currentDrawingPoint, setCurrentDrawingPoint] = useState<Point | null>(null);
  const [smoothedDrawingPoint, setSmoothedDrawingPoint] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [showLengthInput, setShowLengthInput] = useState(false);
  const [customLength, setCustomLength] = useState('');
  const [pendingLineStart, setPendingLineStart] = useState<Point | null>(null);
  
  // Enhanced movement and rotation states with improved precision
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragThreshold] = useState(3); // Reduced for better precision
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

  // Enhanced cursor and crosshair states
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0, y: 0 });
  const [smoothedCursorPosition, setSmoothedCursorPosition] = useState<Point>({ x: 0, y: 0 });
  const [showCrosshair, setShowCrosshair] = useState(false);

  // Debouncing and timing
  const [lastClickTime, setLastClickTime] = useState(0);
  const [doubleClickTimeout, setDoubleClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // Enhanced sensitivity controls
  const PAN_SENSITIVITY = 0.15; // Further reduced for better control
  const SMOOTHING_FACTOR = 0.15; // For motion smoothing
  const CURSOR_SMOOTHING_FACTOR = 0.3; // For cursor smoothing
  const MIN_MOVEMENT_THRESHOLD = 1; // Minimum pixel movement to register

  // Motion smoothing animation loop
  useEffect(() => {
    const smoothingLoop = () => {
      // Smooth pan movement
      setSmoothedPan(prev => ({
        x: prev.x + (targetPan.x - prev.x) * SMOOTHING_FACTOR,
        y: prev.y + (targetPan.y - prev.y) * SMOOTHING_FACTOR
      }));

      // Smooth cursor movement for drawing
      if (currentDrawingPoint) {
        setSmoothedDrawingPoint(prev => {
          if (!prev) return currentDrawingPoint;
          return {
            x: prev.x + (currentDrawingPoint.x - prev.x) * CURSOR_SMOOTHING_FACTOR,
            y: prev.y + (currentDrawingPoint.y - prev.y) * CURSOR_SMOOTHING_FACTOR
          };
        });
      }

      // Smooth cursor position
      setSmoothedCursorPosition(prev => ({
        x: prev.x + (cursorPosition.x - prev.x) * CURSOR_SMOOTHING_FACTOR,
        y: prev.y + (cursorPosition.y - prev.y) * CURSOR_SMOOTHING_FACTOR
      }));

      requestAnimationFrame(smoothingLoop);
    };

    const smoothingId = requestAnimationFrame(smoothingLoop);
    return () => cancelAnimationFrame(smoothingId);
  }, [targetPan, currentDrawingPoint, cursorPosition]);

  // Update actual pan with smoothed values
  useEffect(() => {
    setPan(smoothedPan);
  }, [smoothedPan]);

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

    // Enhanced grid rendering with better alignment
    if (showGrid) {
      drawPrecisionGrid(ctx, rect.width / zoom, rect.height / zoom);
    }
    
    // Draw ruler if enabled with better precision
    if (showRuler) {
      drawPrecisionRuler(ctx, rect.width / zoom, rect.height / zoom);
    }
    
    // Draw room
    drawRoom(ctx);
    
    // Draw current line while drawing with smoothed position
    if (isDrawingActive && smoothedDrawingPoint && roomPoints.length > 0) {
      drawCurrentLineWithCrosshair(ctx);
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

    // Draw enhanced crosshair when needed
    if (showCrosshair && (currentTool === 'wall' || currentTool === 'door')) {
      drawEnhancedCrosshair(ctx);
    }

    ctx.restore();
  }, [roomPoints, placedProducts, textAnnotations, doors, selectedProduct, selectedText, selectedDoor, selectedWallIndex, zoom, pan, smoothedDrawingPoint, showGrid, showRuler, isDrawingActive, showRotationHandle, showCollisionWarning, currentTool, smoothedCursorPosition, showCrosshair]);

  // Draw room function
  const drawRoom = (ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 2) return;

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3 / zoom;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';

    ctx.beginPath();
    ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
    
    for (let i = 1; i < roomPoints.length; i++) {
      ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
    }
    
    if (roomPoints.length > 2 && !isDrawingActive) {
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.stroke();

    // Draw room points
    roomPoints.forEach((point, index) => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4 / zoom, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  // Draw selected wall function
  const drawSelectedWall = (ctx: CanvasRenderingContext2D) => {
    if (selectedWallIndex === null || roomPoints.length < 2) return;

    const nextIndex = (selectedWallIndex + 1) % roomPoints.length;
    const point1 = roomPoints[selectedWallIndex];
    const point2 = roomPoints[nextIndex];

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5 / zoom;
    ctx.setLineDash([10 / zoom, 5 / zoom]);
    
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Calculate room area function
  const calculateRoomArea = (): number => {
    if (roomPoints.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < roomPoints.length; i++) {
      const j = (i + 1) % roomPoints.length;
      area += roomPoints[i].x * roomPoints[j].y;
      area -= roomPoints[j].x * roomPoints[i].y;
    }
    
    const areaInPixels = Math.abs(area) / 2;
    return areaInPixels / (scale * scale); // Convert to square meters
  };

  // Enhanced grid rendering with better alignment
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

  const drawPrecisionRuler = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#1f2937';
    ctx.fillStyle = '#1f2937';
    ctx.lineWidth = 1 / zoom;
    ctx.font = `${10 / zoom}px "Inter", sans-serif`;
    ctx.textAlign = 'left';

    // Horizontal ruler
    for (let x = 0; x <= width; x += scale) {
      const meters = x / scale;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 15 / zoom);
      ctx.stroke();
      
      if (meters % 1 === 0) {
        ctx.fillText(`${meters}m`, x + 2 / zoom, 12 / zoom);
      }
    }

    // Vertical ruler
    for (let y = 0; y <= height; y += scale) {
      const meters = y / scale;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(15 / zoom, y);
      ctx.stroke();
      
      if (meters % 1 === 0) {
        ctx.save();
        ctx.translate(12 / zoom, y - 2 / zoom);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${meters}m`, 0, 0);
        ctx.restore();
      }
    }
  };

  // Enhanced crosshair with pixel-perfect accuracy
  const drawEnhancedCrosshair = (ctx: CanvasRenderingContext2D) => {
    const size = 25 / zoom;
    const position = smoothedCursorPosition;
    
    // Pixel-perfect positioning
    const pixelX = Math.round(position.x * zoom) / zoom;
    const pixelY = Math.round(position.y * zoom) / zoom;
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5 / zoom;
    ctx.setLineDash([4 / zoom, 4 / zoom]);

    ctx.beginPath();
    ctx.moveTo(pixelX - size, pixelY);
    ctx.lineTo(pixelX + size, pixelY);
    ctx.moveTo(pixelX, pixelY - size);
    ctx.lineTo(pixelX, pixelY + size);
    ctx.stroke();
    ctx.setLineDash([]);

    // Enhanced center dot with glow effect
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 3 / zoom;
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, 2.5 / zoom, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Coordinate display for precision
    if (currentTool === 'wall') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = `${10 / zoom}px "Inter", sans-serif`;
      ctx.textAlign = 'left';
      const coordText = `${(pixelX / scale).toFixed(2)}, ${(pixelY / scale).toFixed(2)}m`;
      ctx.fillText(coordText, pixelX + 15 / zoom, pixelY - 10 / zoom);
    }
  };

  const drawCurrentLineWithCrosshair = (ctx: CanvasRenderingContext2D) => {
    if (!smoothedDrawingPoint || roomPoints.length === 0) return;

    const lastPoint = roomPoints[roomPoints.length - 1];
    
    // Enhanced line rendering with anti-aliasing
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5 / zoom;
    ctx.setLineDash([6 / zoom, 4 / zoom]);
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(smoothedDrawingPoint.x, smoothedDrawingPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const length = calculateDistance(lastPoint, smoothedDrawingPoint);
    if (length > 0.01) {
      const angle = Math.atan2(smoothedDrawingPoint.y - lastPoint.y, smoothedDrawingPoint.x - lastPoint.x);
      const midX = (lastPoint.x + smoothedDrawingPoint.x) / 2;
      const midY = (lastPoint.y + smoothedDrawingPoint.y) / 2;
      
      const offsetDistance = 30 / zoom;
      const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
      const offsetY = Math.sin(angle + Math.PI / 2) * offsetDistance;
      
      ctx.save();
      ctx.translate(midX + offsetX, midY + offsetY);
      ctx.rotate(angle);
      
      // Enhanced dimension display
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1 / zoom;
      const textWidth = 45 / zoom;
      const textHeight = 18 / zoom;
      ctx.fillRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight);
      ctx.strokeRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight);
      
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${12 / zoom}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${length.toFixed(2)}m`, 0, 4 / zoom);
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
      if (door.wallSegmentIndex >= roomPoints.length) return;
      
      const wallStart = roomPoints[door.wallSegmentIndex];
      const wallEnd = roomPoints[(door.wallSegmentIndex + 1) % roomPoints.length];
      
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
    
    // Pixel-perfect positioning
    const pixelX = Math.round(x * zoom) / zoom;
    const pixelY = Math.round(y * zoom) / zoom;
    
    return { x: pixelX, y: pixelY };
  };

  const snapToGrid = (point: Point): Point => {
    if (!showGrid) return point;
    const gridSize = scale * 0.25;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  };

  const snapToAngle = (angle: number): number => {
    const snapIncrement = 45;
    return Math.round(angle / snapIncrement) * snapIncrement;
  };

  // Improved detection with better thresholds
  const findProductAt = (point: Point): string | null => {
    for (const product of placedProducts) {
      const { position, rotation, dimensions } = product;
      const productScale = product.scale || 1;
      const width = dimensions.length * scale * productScale;
      const height = dimensions.width * scale * productScale;
      
      const cos = Math.cos((-rotation * Math.PI) / 180);
      const sin = Math.sin((-rotation * Math.PI) / 180);
      
      const localX = (point.x - position.x) * cos - (point.y - position.y) * sin;
      const localY = (point.x - position.x) * sin + (point.y - position.y) * cos;
      
      if (Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2) {
        return product.id;
      }
    }
    return null;
  };

  const findTextAt = (point: Point): string | null => {
    for (const annotation of textAnnotations) {
      const canvas = canvasRef.current;
      if (!canvas) continue;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      
      ctx.font = `${annotation.fontSize / zoom}px sans-serif`;
      const metrics = ctx.measureText(annotation.text);
      
      if (point.x >= annotation.position.x && 
          point.x <= annotation.position.x + metrics.width &&
          point.y >= annotation.position.y - annotation.fontSize / zoom &&
          point.y <= annotation.position.y) {
        return annotation.id;
      }
    }
    return null;
  };

  const findWallAt = (point: Point): number | null => {
    if (roomPoints.length < 2) return null;
    
    const threshold = 15 / zoom; // Increased threshold for better UX
    
    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      const point1 = roomPoints[i];
      const point2 = roomPoints[nextIndex];
      
      const distance = distanceToLineSegment(point, point1, point2);
      if (distance < threshold) {
        return i;
      }
    }
    return null;
  };

  const distanceToLineSegment = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    
    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const duplicateSelectedProduct = () => {
    if (!selectedProduct) return;
    
    const product = placedProducts.find(p => p.id === selectedProduct);
    if (!product) return;
    
    const newProduct: PlacedProduct = {
      ...product,
      id: `${product.id}-copy-${Date.now()}`,
      productId: product.productId,
      position: {
        x: product.position.x + 50,
        y: product.position.y + 50
      }
    };
    
    if (isProductWithinRoom(newProduct, roomPoints, scale)) {
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

  // Improved mouse event handlers with better sensitivity control
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
    // Tool-specific handling
    switch (currentTool) {
      case 'wall':
        handleWallToolMouseDown(point, e);
        break;
      case 'select':
        handleSelectToolMouseDown(point, e);
        break;
      case 'rotate':
        handleRotateToolMouseDown(point, e);
        break;
      case 'wall-edit':
        handleWallEditToolMouseDown(point, e);
        break;
      case 'text':
        handleTextToolMouseDown(point, e);
        break;
      case 'door':
        handleDoorToolMouseDown(point, e);
        break;
      case 'eraser':
        handleEraserToolMouseDown(point, e);
        break;
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
    } else if (currentTool === 'text') {
      const textId = findTextAt(point);
      if (textId) {
        const annotation = textAnnotations.find(t => t.id === textId);
        if (annotation) {
          setSelectedText(textId);
          setIsEditingText(true);
          setEditingText(annotation.text);
        }
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

  const handleWallEditToolMouseDown = (point: Point, e: MouseEvent) => {
    const wallIndex = findWallAt(point);
    if (wallIndex !== null) {
      setSelectedWallIndex(wallIndex);
      const nextIndex = (wallIndex + 1) % roomPoints.length;
      const currentLength = calculateDistance(roomPoints[wallIndex], roomPoints[nextIndex]);
      setCustomWallLength(currentLength.toFixed(2));
      setShowWallLengthInput(true);
    } else {
      setSelectedWallIndex(null);
    }
  };

  const handleTextToolMouseDown = (point: Point, e: MouseEvent) => {
    const textId = findTextAt(point);
    
    if (!textId) {
      const newText: TextAnnotation = {
        id: `text-${Date.now()}`,
        text: 'New Text',
        position: point,
        fontSize: 16 * zoom
      };
      setTextAnnotations([...textAnnotations, newText]);
      setSelectedText(newText.id);
    }
  };

  const handleDoorToolMouseDown = (point: Point, e: MouseEvent) => {
    const result = findClosestWallSegment(point, roomPoints);
    if (!result) return;

    const doorPosition = findOptimalDoorPosition(point, result.segment);
    const newDoor: Door = {
      id: `door-${Date.now()}`,
      position: point,
      wallSegmentIndex: result.index,
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
    
    // Apply motion threshold to reduce jitter
    const distance = Math.sqrt(
      Math.pow(point.x - cursorPosition.x, 2) + Math.pow(point.y - cursorPosition.y, 2)
    );
    
    if (distance > MIN_MOVEMENT_THRESHOLD || currentTool === 'wall') {
      setCursorPosition(point);
    }

    // Show crosshair for precision tools
    setShowCrosshair(currentTool === 'wall' || currentTool === 'door');

    // Enhanced panning with reduced sensitivity and smoothing
    if (isPanning && lastPanPoint) {
      const currentPoint = getCanvasMousePosition(e);
      const deltaX = (currentPoint.x - lastPanPoint.x) * PAN_SENSITIVITY;
      const deltaY = (currentPoint.y - lastPanPoint.y) * PAN_SENSITIVITY;
      
      // Apply minimum movement threshold for panning
      if (Math.abs(deltaX) > MIN_MOVEMENT_THRESHOLD || Math.abs(deltaY) > MIN_MOVEMENT_THRESHOLD) {
        setTargetPan(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      }
      setLastPanPoint(currentPoint);
      return;
    }

    if (currentTool === 'wall' && isDrawingActive) {
      setCurrentDrawingPoint(point);
    }

    // Improved drag handling with enhanced threshold
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

    if (isProductWithinRoom(updatedProduct, roomPoints, scale)) {
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

    if (isProductWithinRoom(updatedProduct, roomPoints, scale)) {
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

    if (isProductWithinRoom(newProduct, roomPoints, scale)) {
      setPlacedProducts([...placedProducts, newProduct]);
      toast.success(`${product.name} placed`);
    } else {
      toast.error('Cannot place product outside room bounds');
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
  }, [currentTool, isDrawingActive, isDragging, isRotating, isPanning, selectedProduct, selectedText, selectedWallIndex, roomPoints, placedProducts, textAnnotations, doors, hasStartedDrag]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="relative w-full h-full bg-gray-50">
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair bg-white shadow-sm"
          style={{
            cursor: currentTool === 'wall' || currentTool === 'door' ? 'crosshair' : 
                   currentTool === 'select' ? 'default' :
                   currentTool === 'rotate' ? 'grab' : 'crosshair'
          }}
        />
      </div>
      
      {/* Enhanced Length Input Modal */}
      {showLengthInput && (
        <div className="absolute top-6 left-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
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

      {/* Enhanced Wall Length Input Modal */}
      {showWallLengthInput && (
        <div className="absolute top-6 left-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Edit Wall Length</h3>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={customWallLength}
              onChange={(e) => setCustomWallLength(e.target.value)}
              placeholder="Length in meters"
              className="w-36 text-sm"
              autoFocus
            />
            <Button onClick={handleWallLengthSubmit} size="sm" className="px-4">
              Apply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowWallLengthInput(false);
                setSelectedWallIndex(null);
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
        <div className="absolute top-6 left-6 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
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

      {/* Enhanced Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
          className="w-10 h-10 p-0 shadow-md"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.1))}
          className="w-10 h-10 p-0 shadow-md"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="text-xs text-center bg-white px-2 py-1 rounded border shadow-sm font-medium">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Enhanced Room Area Display */}
      {roomPoints.length > 2 && !isDrawingActive && (
        <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <span className="text-sm font-semibold text-gray-900">
            Room Area: {calculateRoomArea().toFixed(2)} m²
          </span>
        </div>
      )}
    </div>
  );
};

export default CanvasWorkspace;
