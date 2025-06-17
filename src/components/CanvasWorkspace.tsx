import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Move, RotateCcw, Copy, Trash2, DoorOpen, Crosshair } from 'lucide-react';
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

  // Enhanced cursor and crosshair states with better accuracy
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0, y: 0 });
  const [canvasMousePosition, setCanvasMousePosition] = useState<Point>({ x: 0, y: 0 });
  const [snapPoint, setSnapPoint] = useState<Point | null>(null);
  const [showSnapIndicator, setShowSnapIndicator] = useState(false);

  // Enhanced eraser states
  const [isErasing, setIsErasing] = useState(false);
  const [erasedItems, setErasedItems] = useState<Set<string>>(new Set());

  // Debouncing and timing
  const [lastClickTime, setLastClickTime] = useState(0);
  const [doubleClickTimeout, setDoubleClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // Enhanced pan sensitivity for better right-click interactions
  const PAN_SENSITIVITY = 0.8; // Increased sensitivity for right-click panning

  // Ruler configuration
  const RULER_SIZE = 30; // Size of ruler border in pixels

  // Grid snapping configuration
  const GRID_SNAP_THRESHOLD = 20; // Increased snap threshold for better usability

  // Helper functions for finding elements with improved accuracy
  const findProductAt = (point: Point): string | null => {
    for (const product of placedProducts) {
      const { position, rotation, dimensions } = product;
      const productScale = product.scale || 1;
      const width = dimensions.length * scale * productScale;
      const height = dimensions.width * scale * productScale;
      
      // Transform point to product's local coordinate system
      const dx = point.x - position.x;
      const dy = point.y - position.y;
      const cos = Math.cos(-rotation * Math.PI / 180);
      const sin = Math.sin(-rotation * Math.PI / 180);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      
      // Enhanced hit detection with slightly expanded bounds for better usability
      const hitPadding = 5 / zoom;
      if (Math.abs(localX) <= (width / 2 + hitPadding) && Math.abs(localY) <= (height / 2 + hitPadding)) {
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
      // Enhanced hit detection for text
      if (distance < 25 / zoom) {
        return annotation.id;
      }
    }
    return null;
  };

  const findWallAt = (point: Point): number | null => {
    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      if (nextIndex === 0 && roomPoints.length < 3) continue;
      
      const p1 = roomPoints[i];
      const p2 = roomPoints[nextIndex];
      
      // Calculate distance from point to line segment
      const A = point.x - p1.x;
      const B = point.y - p1.y;
      const C = p2.x - p1.x;
      const D = p2.y - p1.y;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      
      if (lenSq === 0) continue;
      
      const param = dot / lenSq;
      
      if (param < 0 || param > 1) continue;
      
      const xx = p1.x + param * C;
      const yy = p1.y + param * D;
      
      const distance = Math.sqrt((point.x - xx) * (point.x - xx) + (point.y - yy) * (point.y - yy));
      
      // Enhanced hit detection for walls
      if (distance < 15 / zoom) {
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
    
    if (isProductWithinRoom(newProduct, roomPoints, scale)) {
      setPlacedProducts([...placedProducts, newProduct]);
      setSelectedProduct(newProduct.id);
      toast.success('Product duplicated');
    } else {
      toast.error('Cannot duplicate outside room bounds');
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

  // Enhanced canvas drawing function with integrated ruler
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

    // Draw integrated ruler border
    if (showRuler) {
      drawIntegratedRuler(ctx, rect.width, rect.height);
    }

    // Set up main drawing area with ruler offset
    const rulerOffset = showRuler ? RULER_SIZE : 0;
    ctx.save();
    ctx.rect(rulerOffset, rulerOffset, rect.width - rulerOffset, rect.height - rulerOffset);
    ctx.clip();
    
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x + rulerOffset / zoom, pan.y + rulerOffset / zoom);

    // Enhanced grid rendering with better alignment to intersections
    if (showGrid) {
      drawPrecisionGrid(ctx, rect.width / zoom, rect.height / zoom);
    }
    
    // Draw room
    drawRoom(ctx);
    
    // Draw current line while drawing with enhanced snap indicator
    if (isDrawingActive && currentDrawingPoint && roomPoints.length > 0) {
      drawCurrentLine(ctx);
    }
    
    // Enhanced snap indicator with crosshair accuracy
    if (showSnapIndicator && snapPoint) {
      drawEnhancedSnapIndicator(ctx);
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

    // Draw crosshair cursor for precise positioning
    if (currentTool === 'wall' || currentTool === 'door') {
      drawAccurateCrosshair(ctx);
    }

    ctx.restore();
  }, [roomPoints, placedProducts, textAnnotations, doors, selectedProduct, selectedText, selectedDoor, selectedWallIndex, zoom, pan, currentDrawingPoint, showGrid, showRuler, isDrawingActive, showRotationHandle, showCollisionWarning, currentTool, canvasMousePosition, snapPoint, showSnapIndicator]);

  // Enhanced integrated ruler with dynamic scaling
  const drawIntegratedRuler = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, RULER_SIZE);
    ctx.fillRect(0, 0, RULER_SIZE, height);
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, RULER_SIZE);
    ctx.lineTo(width, RULER_SIZE);
    ctx.moveTo(RULER_SIZE, 0);
    ctx.lineTo(RULER_SIZE, height);
    ctx.stroke();

    ctx.strokeStyle = '#64748b';
    ctx.fillStyle = '#64748b';
    ctx.font = `${Math.max(9, 12 * zoom)}px "Inter", sans-serif`;
    ctx.textAlign = 'center';

    // Dynamic ruler scaling based on zoom level
    const rulerScale = Math.max(0.25, 1 / zoom);
    const majorTick = scale * rulerScale;
    const minorTick = majorTick / 4;

    // Horizontal ruler
    const startX = Math.floor((-pan.x - RULER_SIZE / zoom) / majorTick) * majorTick;
    for (let x = startX; x <= (width - RULER_SIZE) / zoom - pan.x; x += minorTick) {
      const screenX = (x + pan.x) * zoom + RULER_SIZE;
      if (screenX < RULER_SIZE) continue;
      
      const isMajor = Math.abs(x % majorTick) < 0.001;
      const tickHeight = isMajor ? RULER_SIZE * 0.6 : RULER_SIZE * 0.3;
      
      ctx.beginPath();
      ctx.moveTo(screenX, RULER_SIZE);
      ctx.lineTo(screenX, RULER_SIZE - tickHeight);
      ctx.stroke();
      
      if (isMajor && zoom > 0.5) {
        const meters = x / scale;
        ctx.fillText(`${meters.toFixed(0)}m`, screenX, RULER_SIZE - tickHeight - 5);
      }
    }

    // Vertical ruler
    const startY = Math.floor((-pan.y - RULER_SIZE / zoom) / majorTick) * majorTick;
    for (let y = startY; y <= (height - RULER_SIZE) / zoom - pan.y; y += minorTick) {
      const screenY = (y + pan.y) * zoom + RULER_SIZE;
      if (screenY < RULER_SIZE) continue;
      
      const isMajor = Math.abs(y % majorTick) < 0.001;
      const tickWidth = isMajor ? RULER_SIZE * 0.6 : RULER_SIZE * 0.3;
      
      ctx.beginPath();
      ctx.moveTo(RULER_SIZE, screenY);
      ctx.lineTo(RULER_SIZE - tickWidth, screenY);
      ctx.stroke();
      
      if (isMajor && zoom > 0.5) {
        const meters = y / scale;
        ctx.save();
        ctx.translate(RULER_SIZE - tickWidth - 15, screenY);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${meters.toFixed(0)}m`, 0, 0);
        ctx.restore();
      }
    }
  };

  // Enhanced grid with intersection-based snapping
  const drawPrecisionGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.5 / zoom;

    const gridSize = scale * 0.25;
    const rulerOffset = showRuler ? RULER_SIZE / zoom : 0;
    const startX = Math.floor((-pan.x - rulerOffset) / gridSize) * gridSize;
    const startY = Math.floor((-pan.y - rulerOffset) / gridSize) * gridSize;
    
    // Draw minor grid lines
    for (let x = startX; x <= width / zoom - pan.x; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -pan.y - rulerOffset);
      ctx.lineTo(x, height / zoom - pan.y);
      ctx.stroke();
    }

    for (let y = startY; y <= height / zoom - pan.y; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-pan.x - rulerOffset, y);
      ctx.lineTo(width / zoom - pan.x, y);
      ctx.stroke();
    }

    // Draw major grid lines every meter with intersection highlights
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1 / zoom;
    
    const majorGridSize = scale;
    const majorStartX = Math.floor((-pan.x - rulerOffset) / majorGridSize) * majorGridSize;
    const majorStartY = Math.floor((-pan.y - rulerOffset) / majorGridSize) * majorGridSize;
    
    for (let x = majorStartX; x <= width / zoom - pan.x; x += majorGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -pan.y - rulerOffset);
      ctx.lineTo(x, height / zoom - pan.y);
      ctx.stroke();
    }

    for (let y = majorStartY; y <= height / zoom - pan.y; y += majorGridSize) {
      ctx.beginPath();
      ctx.moveTo(-pan.x - rulerOffset, y);
      ctx.lineTo(width / zoom - pan.x, y);
      ctx.stroke();
    }

    // Highlight grid intersections for better snap visibility
    ctx.fillStyle = '#cbd5e1';
    for (let x = majorStartX; x <= width / zoom - pan.x; x += majorGridSize) {
      for (let y = majorStartY; y <= height / zoom - pan.y; y += majorGridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1 / zoom, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  // Enhanced snap indicator with accurate crosshair
  const drawEnhancedSnapIndicator = (ctx: CanvasRenderingContext2D) => {
    if (!snapPoint) return;
    
    // Animated pulsing circle
    const time = Date.now() * 0.008;
    const pulse = (Math.sin(time) + 1) * 0.5;
    const radius = (10 + pulse * 6) / zoom;
    
    ctx.save();
    ctx.fillStyle = `rgba(59, 130, 246, ${0.7 + pulse * 0.3})`;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2 / zoom;
    
    ctx.beginPath();
    ctx.arc(snapPoint.x, snapPoint.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Enhanced crosshair with precise alignment
    const crossSize = 16 / zoom;
    ctx.lineWidth = 3 / zoom;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(snapPoint.x - crossSize, snapPoint.y);
    ctx.lineTo(snapPoint.x + crossSize, snapPoint.y);
    ctx.moveTo(snapPoint.x, snapPoint.y - crossSize);
    ctx.lineTo(snapPoint.x, snapPoint.y + crossSize);
    ctx.stroke();
    
    ctx.lineWidth = 1 / zoom;
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(snapPoint.x - crossSize, snapPoint.y);
    ctx.lineTo(snapPoint.x + crossSize, snapPoint.y);
    ctx.moveTo(snapPoint.x, snapPoint.y - crossSize);
    ctx.lineTo(snapPoint.x, snapPoint.y + crossSize);
    ctx.stroke();
    
    ctx.restore();
  };

  // Accurate crosshair cursor rendering
  const drawAccurateCrosshair = (ctx: CanvasRenderingContext2D) => {
    const crosshairSize = 20 / zoom;
    const x = canvasMousePosition.x;
    const y = canvasMousePosition.y;
    
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([4 / zoom, 4 / zoom]);
    
    ctx.beginPath();
    ctx.moveTo(x - crosshairSize, y);
    ctx.lineTo(x + crosshairSize, y);
    ctx.moveTo(x, y - crosshairSize);
    ctx.lineTo(x, y + crosshairSize);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Center dot for precision
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, 2 / zoom, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
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
    
    // Auto-close shape when near first point
    if (!isDrawingActive && roomPoints.length > 2) {
      ctx.closePath();
    } else if (isDrawingActive && currentDrawingPoint && roomPoints.length > 2) {
      const firstPoint = roomPoints[0];
      const distance = Math.sqrt(
        Math.pow(currentDrawingPoint.x - firstPoint.x, 2) + 
        Math.pow(currentDrawingPoint.y - firstPoint.y, 2)
      );
      
      // Show preview of closing line when near first point
      if (distance < 30 / zoom) {
        ctx.save();
        ctx.setLineDash([6 / zoom, 6 / zoom]);
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(currentDrawingPoint.x, currentDrawingPoint.y);
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.stroke();
        ctx.restore();
      }
    }
    
    ctx.stroke();

    // Draw points with better visibility
    ctx.fillStyle = '#1f2937';
    roomPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4 / zoom, 0, 2 * Math.PI);
      ctx.fill();
      
      // Highlight first point for closing reference
      if (index === 0 && isDrawingActive && roomPoints.length > 2) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8 / zoom, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
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
      
      // Skip erased items during drag erase
      if (isErasing && erasedItems.has(id)) {
        ctx.save();
        ctx.globalAlpha = 0.3;
      }
      
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
      
      if (isErasing && erasedItems.has(id)) {
        ctx.restore();
      }
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
      // Skip erased text during drag erase
      if (isErasing && erasedItems.has(annotation.id)) {
        ctx.save();
        ctx.globalAlpha = 0.3;
      }
      
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
      
      if (isErasing && erasedItems.has(annotation.id)) {
        ctx.restore();
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

  // Enhanced distance calculation
  const calculateDistance = (point1: Point, point2: Point): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy) / scale;
  };

  // Enhanced mouse position calculation with ruler offset consideration
  const getCanvasMousePosition = (e: MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const rulerOffset = showRuler ? RULER_SIZE : 0;
    const x = (e.clientX - rect.left - rulerOffset) / zoom - pan.x;
    const y = (e.clientY - rect.top - rulerOffset) / zoom - pan.y;
    
    return { x, y };
  };

  // Enhanced grid snapping to intersections
  const snapToGridIntersection = (point: Point): { snappedPoint: Point; distance: number } => {
    if (!showGrid) return { snappedPoint: point, distance: Infinity };
    
    const gridSize = scale * 0.25;
    const snappedPoint = {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
    
    const distance = Math.sqrt(
      Math.pow(point.x - snappedPoint.x, 2) + 
      Math.pow(point.y - snappedPoint.y, 2)
    );
    
    return { snappedPoint, distance };
  };

  // Enhanced angle snapping
  const snapToAngle = (angle: number): number => {
    const snapIncrement = 45;
    return Math.round(angle / snapIncrement) * snapIncrement;
  };

  // Enhanced eraser functionality with drag support
  const performErase = (point: Point) => {
    const productId = findProductAt(point);
    const textId = findTextAt(point);
    const wallIndex = findWallAt(point);
    
    if (productId && !erasedItems.has(productId)) {
      if (isErasing) {
        setErasedItems(prev => new Set(prev).add(productId));
      } else {
        setPlacedProducts(placedProducts.filter(p => p.id !== productId));
        toast.success('Product erased');
      }
    } else if (textId && !erasedItems.has(textId)) {
      if (isErasing) {
        setErasedItems(prev => new Set(prev).add(textId));
      } else {
        setTextAnnotations(textAnnotations.filter(t => t.id !== textId));
        toast.success('Text erased');
      }
    } else if (wallIndex !== null) {
      // Erase wall point
      const newRoomPoints = roomPoints.filter((_, index) => index !== wallIndex);
      setRoomPoints(newRoomPoints);
      toast.success('Wall point erased');
    }
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
    const rulerOffset = showRuler ? RULER_SIZE : 0;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Calculate appropriate zoom level with padding
    const padding = 100;
    const zoomX = (rect.width - rulerOffset - padding) / contentWidth;
    const zoomY = (rect.height - rulerOffset - padding) / contentHeight;
    const newZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.1), 3);
    
    setZoom(newZoom);
    setPan({
      x: (rect.width - rulerOffset) / 2 / newZoom - centerX,
      y: (rect.height - rulerOffset) / 2 / newZoom - centerY
    });
    
    toast.success('Canvas recentered and zoomed to fit');
  };

  // Enhanced keyboard shortcuts
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
    setSelectedWallIndex(null);
    setIsEditingText(false);
    setShowRotationHandle(false);
    setIsDragging(false);
    setIsRotating(false);
    setShowWallLengthInput(false);
    setHasStartedDrag(false);
    setShowSnapIndicator(false);
    setSnapPoint(null);
    setIsErasing(false);
    setErasedItems(new Set());
    if (isDrawingActive) {
      toast.success('Drawing cancelled');
    }
  };

  // Enhanced mouse event handlers
  const handleMouseDown = (e: MouseEvent) => {
    const rawPoint = getCanvasMousePosition(e);
    const currentTime = Date.now();

    // Update canvas mouse position for crosshair
    setCanvasMousePosition(rawPoint);

    // Enhanced grid snapping for wall tool
    let point = rawPoint;
    if (currentTool === 'wall' && showGrid) {
      const { snappedPoint, distance } = snapToGridIntersection(rawPoint);
      
      if (distance < GRID_SNAP_THRESHOLD / zoom) {
        point = snappedPoint;
        setSnapPoint(snappedPoint);
        setShowSnapIndicator(true);
      } else {
        setShowSnapIndicator(false);
        setSnapPoint(null);
      }
    }

    // Enhanced right-click panning with increased sensitivity
    if (e.button === 2) {
      setIsPanning(true);
      setLastPanPoint(rawPoint);
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
      // Enhanced auto-close functionality
      if (roomPoints.length > 2) {
        // Check if we're close to the first point for auto-closing
        const firstPoint = roomPoints[0];
        const distance = Math.sqrt(
          Math.pow(point.x - firstPoint.x, 2) + 
          Math.pow(point.y - firstPoint.y, 2)
        );
        
        if (distance < 30 / zoom) {
          // Auto-close to first point
          setIsDrawingActive(false);
          setCurrentDrawingPoint(null);
          setShowSnapIndicator(false);
          setSnapPoint(null);
          toast.success('Room completed and closed');
        } else {
          // Regular completion
          setRoomPoints([...roomPoints, point]);
          setIsDrawingActive(false);
          setCurrentDrawingPoint(null);
          setShowSnapIndicator(false);
          setSnapPoint(null);
          toast.success('Room completed');
        }
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
      // Check for auto-close when clicking near first point
      if (roomPoints.length > 2) {
        const firstPoint = roomPoints[0];
        const distance = Math.sqrt(
          Math.pow(point.x - firstPoint.x, 2) + 
          Math.pow(point.y - firstPoint.y, 2)
        );
        
        if (distance < 30 / zoom) {
          // Auto-close shape
          setIsDrawingActive(false);
          setCurrentDrawingPoint(null);
          setShowSnapIndicator(false);
          setSnapPoint(null);
          toast.success('Room completed and closed');
          return;
        }
      }
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

  // Enhanced eraser tool with drag support
  const handleEraserToolMouseDown = (point: Point, e: MouseEvent) => {
    setIsErasing(true);
    setErasedItems(new Set());
    performErase(point);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const rawPoint = getCanvasMousePosition(e);
    setCursorPosition(rawPoint);
    setCanvasMousePosition(rawPoint);

    // Enhanced grid snapping with visual feedback
    if (currentTool === 'wall' && showGrid && isDrawingActive) {
      const { snappedPoint, distance } = snapToGridIntersection(rawPoint);
      
      if (distance < GRID_SNAP_THRESHOLD / zoom) {
        setCurrentDrawingPoint(snappedPoint);
        setSnapPoint(snappedPoint);
        setShowSnapIndicator(true);
      } else {
        setCurrentDrawingPoint(rawPoint);
        setShowSnapIndicator(false);
        setSnapPoint(null);
      }
    } else if (currentTool === 'wall' && isDrawingActive) {
      setCurrentDrawingPoint(rawPoint);
    }

    // Enhanced panning with increased sensitivity
    if (isPanning && lastPanPoint) {
      const currentPoint = rawPoint;
      const deltaX = (currentPoint.x - lastPanPoint.x) * PAN_SENSITIVITY;
      const deltaY = (currentPoint.y - lastPanPoint.y) * PAN_SENSITIVITY;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint(currentPoint);
      return;
    }

    // Use snapped point for interactions when appropriate
    const point = (currentTool === 'wall' && showGrid) ? (snapPoint || rawPoint) : rawPoint;

    // Enhanced drag erasing
    if (currentTool === 'eraser' && isErasing) {
      performErase(point);
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
    
    // Finalize erasing
    if (isErasing && erasedItems.size > 0) {
      setPlacedProducts(prev => prev.filter(p => !erasedItems.has(p.id)));
      setTextAnnotations(prev => prev.filter(t => !erasedItems.has(t.id)));
      toast.success(`${erasedItems.size} item(s) erased`);
    }
    setIsErasing(false);
    setErasedItems(new Set());
    
    // Keep snap indicator when drawing
    if (currentTool !== 'wall' || !isDrawingActive) {
      setShowSnapIndicator(false);
      setSnapPoint(null);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const productData = e.dataTransfer?.getData('product');
    if (!productData) return;

    const product = JSON.parse(productData);
    const dropPoint = getCanvasMousePosition(e);

    // Enhanced snap to grid for dropped products
    const finalPoint = showGrid ? snapToGridIntersection(dropPoint).snappedPoint : dropPoint;

    const newProduct: PlacedProduct = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      position: finalPoint,
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
  }, [currentTool, isDrawingActive, isDragging, isRotating, isPanning, selectedProduct, selectedText, selectedWallIndex, roomPoints, placedProducts, textAnnotations, doors, hasStartedDrag, showGrid, isErasing]);

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
      const rulerOffset = showRuler ? RULER_SIZE : 0;
      const mouseX = e.clientX - rect.left - rulerOffset;
      const mouseY = e.clientY - rect.top - rulerOffset;
      
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
  }, [zoom, pan, showRuler]);

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
    <div className="relative w-full h-full bg-gray-50">
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="bg-white shadow-sm"
          style={{
            cursor: currentTool === 'wall' || currentTool === 'door' ? 'none' : 
                   currentTool === 'select' ? 'default' :
                   currentTool === 'rotate' ? 'grab' :
                   currentTool === 'eraser' ? 'crosshair' : 'crosshair'
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

      {/* Recenter Tool */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={recenterCanvas}
          className="w-12 h-12 p-0 shadow-md"
          title="Recenter canvas view"
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>

      {/* Enhanced Room Area Display */}
      {roomPoints.length > 2 && !isDrawingActive && (
        <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
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

      {/* Enhanced Grid Snap Status Indicator */}
      {currentTool === 'wall' && showGrid && (
        <div className="absolute bottom-6 left-6 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <span className="text-xs font-medium text-gray-700 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${showSnapIndicator ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
            Grid Snap: {showSnapIndicator ? 'Active' : 'Ready'}
          </span>
        </div>
      )}

      {/* Eraser Status Indicator */}
      {currentTool === 'eraser' && isErasing && (
        <div className="absolute bottom-6 left-6 bg-red-50 px-3 py-2 rounded-lg shadow-lg border border-red-200">
          <span className="text-xs font-medium text-red-700 flex items-center">
            <div className="w-2 h-2 rounded-full mr-2 bg-red-500 animate-pulse"></div>
            Erasing... {erasedItems.size} item(s) selected
          </span>
        </div>
      )}
    </div>
  );
};

export default CanvasWorkspace;
