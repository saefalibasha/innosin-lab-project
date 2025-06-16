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
  
  // Enhanced product interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [rotationCenter, setRotationCenter] = useState<Point | null>(null);
  const [initialRotation, setInitialRotation] = useState(0);
  const [showRotationCompass, setShowRotationCompass] = useState(false);
  
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingText, setEditingText] = useState('');

  // Enhanced collision detection states
  const [showCollisionWarning, setShowCollisionWarning] = useState(false);
  const [collisionWarningPosition, setCollisionWarningPosition] = useState<Point>({ x: 0, y: 0 });
  const [originalProductPosition, setOriginalProductPosition] = useState<Point | null>(null);

  // Wall editing states
  const [selectedWall, setSelectedWall] = useState<number | null>(null);
  const [wallEditLength, setWallEditLength] = useState('');
  const [showWallLengthInput, setShowWallLengthInput] = useState(false);

  // Optimized drawing with requestAnimationFrame
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width / zoom, canvas.height / zoom);
    }
    
    // Draw ruler if enabled
    if (showRuler) {
      drawRuler(ctx, canvas.width / zoom, canvas.height / zoom);
    }
    
    // Draw room
    drawRoom(ctx);
    
    // Draw current line while drawing (only when actively drawing)
    if (isDrawingActive && currentDrawingPoint && roomPoints.length > 0) {
      drawCurrentLine(ctx);
    }
    
    // Draw doors
    drawDoors(ctx);
    
    // Draw placed products
    drawPlacedProducts(ctx);
    
    // Draw rotation compass if rotating
    if (showRotationCompass && selectedProduct) {
      drawRotationCompass(ctx);
    }
    
    // Draw dimensions on completed walls (only when not actively drawing)
    if (!isDrawingActive) {
      drawDimensions(ctx);
    }

    // Draw text annotations
    drawTextAnnotations(ctx);

    // Draw collision warning if visible
    if (showCollisionWarning) {
      drawCollisionWarning(ctx);
    }

    // Draw wall selection highlighting
    if (selectedWall !== null) {
      drawSelectedWall(ctx);
    }

    ctx.restore();
  }, [roomPoints, placedProducts, textAnnotations, doors, selectedProduct, selectedText, selectedDoor, selectedWall, zoom, pan, currentDrawingPoint, showGrid, showRuler, isDrawingActive, showRotationCompass, showCollisionWarning]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC to cleanly exit any active mode
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isDrawingActive) {
          setIsDrawingActive(false);
          setCurrentDrawingPoint(null);
          setPendingLineStart(null);
          toast.success('Drawing cancelled');
        } else {
          setSelectedProduct(null);
          setSelectedText(null);
          setSelectedWall(null);
          setIsEditingText(false);
          setShowRotationCompass(false);
          setIsDragging(false);
          setIsRotating(false);
          setShowWallLengthInput(false);
        }
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
        case 'r':
          e.preventDefault();
          if (selectedProduct) rotateSelectedProduct();
          break;
        case 'd':
          e.preventDefault();
          if (selectedProduct) duplicateSelectedProduct();
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
  }, [selectedProduct, selectedText, isDrawingActive, currentDrawingPoint, roomPoints]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
      
      // Zoom toward mouse position
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / zoom;
        const mouseY = (e.clientY - rect.top) / zoom;
        
        const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
        const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);
        
        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      } else {
        setZoom(newZoom);
      }
    };
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel);
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [zoom, pan]);

  // Canvas resize effect
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawCanvas();
      }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawCanvas]);

  // Animation frame for continuous rendering
  useEffect(() => {
    const animate = () => {
      drawCanvas();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawCanvas]);

  // Enhanced boundary checking function
  const checkProductBoundaries = (product: PlacedProduct): boolean => {
    if (roomPoints.length < 3) return true; // No room boundaries defined
    
    const isWithin = isProductWithinRoom(product, roomPoints, scale);
    
    if (!isWithin) {
      setShowCollisionWarning(true);
      setCollisionWarningPosition({ x: product.position.x, y: product.position.y });
      
      // Auto-hide warning after 2 seconds
      setTimeout(() => {
        setShowCollisionWarning(false);
      }, 2000);
      
      toast.error('Product cannot be placed outside room walls!');
    }
    
    return isWithin;
  };

  // Enhanced product movement with boundary detection
  const moveProductWithBoundaryCheck = (productId: string, newPosition: Point): boolean => {
    const product = placedProducts.find(p => p.id === productId);
    if (!product) return false;

    const testProduct = { ...product, position: newPosition };
    
    if (checkProductBoundaries(testProduct)) {
      setPlacedProducts(placedProducts.map(p => 
        p.id === productId ? testProduct : p
      ));
      return true;
    }
    
    return false;
  };

  // Enhanced rotation with boundary detection
  const rotateProductWithBoundaryCheck = (productId: string, newRotation: number): boolean => {
    const product = placedProducts.find(p => p.id === productId);
    if (!product) return false;

    const testProduct = { ...product, rotation: newRotation };
    
    if (checkProductBoundaries(testProduct)) {
      setPlacedProducts(placedProducts.map(p => 
        p.id === productId ? testProduct : p
      ));
      return true;
    } else {
      toast.error('Cannot rotate product - would intersect with walls!');
      return false;
    }
  };

  // Calculate room area
  const calculateRoomArea = (): number => {
    if (roomPoints.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < roomPoints.length; i++) {
      const j = (i + 1) % roomPoints.length;
      area += roomPoints[i].x * roomPoints[j].y;
      area -= roomPoints[j].x * roomPoints[i].y;
    }
    
    return Math.abs(area) / (2 * scale * scale);
  };

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = scale;
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5 / zoom;
    
    // Draw vertical lines
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Draw ruler
  const drawRuler = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const rulerSize = 30 / zoom;
    const tickSize = 5 / zoom;
    const majorTickSize = 10 / zoom;
    
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, rulerSize);
    ctx.fillRect(0, 0, rulerSize, height);
    
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1 / zoom;
    
    // Draw horizontal ruler
    for (let x = 0; x < width; x += scale / 4) {
      const isMajor = x % scale === 0;
      const tickHeight = isMajor ? majorTickSize : tickSize;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, tickHeight);
      ctx.stroke();
      
      if (isMajor) {
        ctx.fillStyle = '#4b5563';
        ctx.font = `${12 / zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`${(x / scale).toFixed(0)}m`, x, rulerSize - 5 / zoom);
      }
    }
    
    // Draw vertical ruler
    for (let y = 0; y < height; y += scale / 4) {
      const isMajor = y % scale === 0;
      const tickWidth = isMajor ? majorTickSize : tickSize;
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(tickWidth, y);
      ctx.stroke();
      
      if (isMajor) {
        ctx.fillStyle = '#4b5563';
        ctx.font = `${12 / zoom}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(`${(y / scale).toFixed(0)}m`, 5 / zoom, y + 4 / zoom);
      }
    }
  };

  // Draw room
  const drawRoom = (ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 2) return;
    
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3 / zoom;
    ctx.beginPath();
    
    roomPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
      
      // Draw point
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5 / zoom, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Close the path if we have at least 3 points
    if (roomPoints.length >= 3) {
      ctx.closePath();
    }
    
    ctx.stroke();
  };

  // Draw current line while drawing
  const drawCurrentLine = (ctx: CanvasRenderingContext2D) => {
    if (!currentDrawingPoint || roomPoints.length === 0) return;
    
    const lastPoint = roomPoints[roomPoints.length - 1];
    
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([5 / zoom, 5 / zoom]);
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentDrawingPoint.x, currentDrawingPoint.y);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Draw length
    const dx = currentDrawingPoint.x - lastPoint.x;
    const dy = currentDrawingPoint.y - lastPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy) / scale;
    
    const midX = (lastPoint.x + currentDrawingPoint.x) / 2;
    const midY = (lastPoint.y + currentDrawingPoint.y) / 2;
    
    ctx.fillStyle = '#4b5563';
    ctx.font = `${14 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${length.toFixed(2)}m`, midX, midY - 10 / zoom);
  };

  // Draw dimensions on walls
  const drawDimensions = (ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 2) return;
    
    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      if (nextIndex === 0 && roomPoints.length < 3) continue;
      
      const point1 = roomPoints[i];
      const point2 = roomPoints[nextIndex];
      
      const dx = point2.x - point1.x;
      const dy = point2.y - point1.y;
      const length = Math.sqrt(dx * dx + dy * dy) / scale;
      
      const midX = (point1.x + point2.x) / 2;
      const midY = (point1.y + point2.y) / 2;
      
      // Calculate offset perpendicular to the wall
      const angle = Math.atan2(dy, dx);
      const offsetX = Math.sin(angle) * 20 / zoom;
      const offsetY = -Math.cos(angle) * 20 / zoom;
      
      ctx.fillStyle = '#1e40af';
      ctx.font = `${14 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${length.toFixed(2)}m`, midX + offsetX, midY + offsetY);
    }
  };

  const drawCollisionWarning = (ctx: CanvasRenderingContext2D) => {
    if (!showCollisionWarning) return;

    const { x, y } = collisionWarningPosition;
    
    // Draw warning icon and text
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 / zoom;
    
    // Warning circle
    ctx.beginPath();
    ctx.arc(x, y - 30 / zoom, 15 / zoom, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Exclamation mark
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${16 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('!', x, y - 25 / zoom);
    
    // Warning text
    ctx.fillStyle = '#ef4444';
    ctx.font = `bold ${12 / zoom}px sans-serif`;
    ctx.fillText('Outside room boundary!', x, y - 50 / zoom);
  };

  const drawSelectedWall = (ctx: CanvasRenderingContext2D) => {
    if (selectedWall === null || roomPoints.length < 2) return;

    const nextIndex = (selectedWall + 1) % roomPoints.length;
    const point1 = roomPoints[selectedWall];
    const point2 = roomPoints[nextIndex];

    // Highlight selected wall
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5 / zoom;
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke();

    // Draw length display
    const length = calculateDistance(point1, point2);
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;

    ctx.fillStyle = '#ef4444';
    ctx.font = `bold ${14 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${length.toFixed(2)}m (Selected)`, midX, midY - 20 / zoom);
  };

  // Draw text annotations
  const drawTextAnnotations = (ctx: CanvasRenderingContext2D) => {
    textAnnotations.forEach(annotation => {
      const isSelected = selectedText === annotation.id;
      
      ctx.font = `${annotation.fontSize / zoom}px sans-serif`;
      ctx.textAlign = 'left';
      
      // Draw selection box if selected
      if (isSelected) {
        const textMetrics = ctx.measureText(annotation.text);
        const textHeight = annotation.fontSize;
        const padding = 5 / zoom;
        
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fillRect(
          annotation.position.x - padding,
          annotation.position.y - textHeight,
          textMetrics.width + padding * 2,
          textHeight + padding * 2
        );
        
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1 / zoom;
        ctx.strokeRect(
          annotation.position.x - padding,
          annotation.position.y - textHeight,
          textMetrics.width + padding * 2,
          textHeight + padding * 2
        );
      }
      
      // Draw text
      ctx.fillStyle = isSelected ? '#3b82f6' : '#000000';
      ctx.fillText(annotation.text, annotation.position.x, annotation.position.y);
    });
  };

  // Draw placed products
  const drawPlacedProducts = (ctx: CanvasRenderingContext2D) => {
    placedProducts.forEach(product => {
      const isSelected = selectedProduct === product.id;
      const productScale = product.scale || 1;
      const width = product.dimensions.length * scale * productScale;
      const height = product.dimensions.width * scale * productScale;
      
      // Check if product is within boundaries
      const isWithinBounds = isProductWithinRoom(product, roomPoints, scale);
      
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate((product.rotation * Math.PI) / 180);

      // Draw product with boundary-aware styling
      ctx.fillStyle = isWithinBounds ? product.color : 'rgba(239, 68, 68, 0.7)';
      ctx.strokeStyle = isSelected ? '#ef4444' : (isWithinBounds ? '#374151' : '#ef4444');
      ctx.lineWidth = isSelected ? 3 / zoom : 2 / zoom;

      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.strokeRect(-width / 2, -height / 2, width, height);

      // Draw warning indicator for out-of-bounds products
      if (!isWithinBounds) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${12 / zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('⚠', 0, 5 / zoom);
      }

      // Draw selection handles if selected
      if (isSelected) {
        const handleSize = 8 / zoom;
        
        // Center handle (for moving)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, handleSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Rotation handle (top center)
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(0, -height / 2 - handleSize * 2, handleSize, 0, 2 * Math.PI);
        ctx.fill();
        
        // Connect rotation handle to center
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / zoom;
        ctx.beginPath();
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(0, -height / 2 - handleSize * 2);
        ctx.stroke();
      }
      
      // Draw product name
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${12 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 0, 0);
      
      ctx.restore();
    });
  };

  // Draw doors
  const drawDoors = (ctx: CanvasRenderingContext2D) => {
    doors.forEach(door => {
      const isSelected = selectedDoor === door.id;
      
      ctx.save();
      ctx.translate(door.position.x, door.position.y);
      ctx.rotate((door.rotation * Math.PI) / 180);
      
      // Door width and thickness
      const doorWidth = door.width * scale;
      const doorThickness = 10 / zoom;
      
      // Draw door frame
      ctx.strokeStyle = isSelected ? '#ef4444' : '#1e40af';
      ctx.lineWidth = isSelected ? 3 / zoom : 2 / zoom;
      
      ctx.beginPath();
      ctx.moveTo(-doorWidth / 2, 0);
      ctx.lineTo(doorWidth / 2, 0);
      ctx.stroke();
      
      // Draw door swing
      const swingDirection = door.swingDirection === 'inward' ? -1 : 1;
      
      ctx.beginPath();
      ctx.arc(
        -doorWidth / 2,
        0,
        doorWidth,
        0,
        (Math.PI / 2) * swingDirection,
        swingDirection < 0
      );
      ctx.stroke();
      
      // Draw door label
      if (isSelected) {
        ctx.fillStyle = '#ef4444';
        ctx.font = `bold ${12 / zoom}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Door', 0, -20 / zoom);
      }
      
      ctx.restore();
    });
  };

  // Draw rotation compass
  const drawRotationCompass = (ctx: CanvasRenderingContext2D) => {
    const product = placedProducts.find(p => p.id === selectedProduct);
    if (!product || !rotationCenter) return;
    
    const { x, y } = product.position;
    const radius = 100 / zoom;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Draw circle
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2 / zoom;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw current angle line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2 / zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const angleRad = (product.rotation * Math.PI) / 180;
    ctx.lineTo(Math.cos(angleRad) * radius, Math.sin(angleRad) * radius);
    ctx.stroke();
    
    // Draw angle text
    ctx.fillStyle = '#3b82f6';
    ctx.font = `bold ${14 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${product.rotation.toFixed(0)}°`, 0, -radius - 10 / zoom);
    
    ctx.restore();
  };

  // Calculate distance between two points
  const calculateDistance = (point1: Point, point2: Point): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy) / scale;
  };

  // Calculate distance from point to line segment
  const distancePointToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Enhanced mouse event handling with boundary detection
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;
    const point = { x, y };

    // Handle different tools
    switch (currentTool) {
      case 'wall':
        handleWallTool(point, e);
        break;
      case 'select':
        handleSelectTool(point, e);
        break;
      case 'text':
        handleTextTool(point);
        break;
      case 'door':
        handleDoorTool(point);
        break;
      case 'eraser':
        handleEraserTool(point);
        break;
      case 'wall-edit':
        handleWallEditTool(point);
        break;
      default:
        if (e.button === 2) { // Right click for panning
          setIsPanning(true);
          setLastPanPoint(point);
        }
    }
  };

  const handleWallEditTool = (point: Point) => {
    // Find clicked wall segment
    const clickThreshold = 10 / zoom;
    
    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      if (nextIndex === 0 && roomPoints.length < 3) continue;
      
      const point1 = roomPoints[i];
      const point2 = roomPoints[nextIndex];
      
      // Check if click is near this wall segment
      const distanceToLine = distancePointToLine(point, point1, point2);
      
      if (distanceToLine < clickThreshold) {
        setSelectedWall(i);
        const length = calculateDistance(point1, point2);
        setWallEditLength(length.toFixed(2));
        setShowWallLengthInput(true);
        toast.success('Wall selected - adjust length below');
        return;
      }
    }
    
    // If no wall clicked, deselect
    setSelectedWall(null);
    setShowWallLengthInput(false);
  };

  const adjustWallLength = () => {
    if (selectedWall === null || !wallEditLength) return;
    
    const newLength = parseFloat(wallEditLength);
    if (isNaN(newLength) || newLength <= 0) {
      toast.error('Please enter a valid length');
      return;
    }
    
    const nextIndex = (selectedWall + 1) % roomPoints.length;
    const point1 = roomPoints[selectedWall];
    const point2 = roomPoints[nextIndex];
    
    // Calculate current angle and apply new length
    const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
    const newPoint2 = {
      x: point1.x + Math.cos(angle) * newLength * scale,
      y: point1.y + Math.sin(angle) * newLength * scale
    };
    
    const newRoomPoints = [...roomPoints];
    newRoomPoints[nextIndex] = newPoint2;
    
    setRoomPoints(newRoomPoints);
    setShowWallLengthInput(false);
    setSelectedWall(null);
    
    toast.success(`Wall length adjusted to ${newLength}m`);
  };

  // Enhanced mouse move with boundary prevention
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;
    const point = { x, y };

    if (isDragging && selectedProduct && dragStart) {
      const deltaX = point.x - dragStart.x;
      const deltaY = point.y - dragStart.y;
      
      const product = placedProducts.find(p => p.id === selectedProduct);
      if (product && originalProductPosition) {
        const newPosition = {
          x: originalProductPosition.x + deltaX,
          y: originalProductPosition.y + deltaY
        };
        
        // Try to move with boundary check
        if (!moveProductWithBoundaryCheck(selectedProduct, newPosition)) {
          // If movement would go outside bounds, keep at boundary edge
          // This provides a "sliding along wall" effect
          return;
        }
      }
    }

    if (isRotating && selectedProduct && rotationCenter) {
      const product = placedProducts.find(p => p.id === selectedProduct);
      if (!product) return;
      
      // Calculate angle between rotation center and current point
      const dx = point.x - product.position.x;
      const dy = point.y - product.position.y;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Snap to 15-degree increments if shift is held
      if (e.shiftKey) {
        angle = Math.round(angle / 15) * 15;
      }
      
      // Try to rotate with boundary check
      rotateProductWithBoundaryCheck(selectedProduct, angle);
    }

    if (isDrawingActive && currentTool === 'wall') {
      setCurrentDrawingPoint(point);
    }

    if (isPanning && lastPanPoint) {
      const deltaX = point.x - lastPanPoint.x;
      const deltaY = point.y - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    }
  };

  // Enhanced drag start with position backup
  const startDragging = (productId: string, startPoint: Point) => {
    const product = placedProducts.find(p => p.id === productId);
    if (product) {
      setOriginalProductPosition(product.position);
      setIsDragging(true);
      setDragStart(startPoint);
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isRotating) {
      setIsDragging(false);
      setIsRotating(false);
      setDragStart(null);
      setRotationCenter(null);
      setOriginalProductPosition(null);
    }
    
    setIsPanning(false);
    setLastPanPoint(null);
  };

  // Enhanced drop handling with boundary check
  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const productData = e.dataTransfer.getData('product');
    if (!productData || !canvasRef.current) return;

    const product = JSON.parse(productData);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    const newProduct: PlacedProduct = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      position: { x, y },
      rotation: 0,
      dimensions: product.dimensions,
      color: product.color,
      scale: 1
    };

    // Check boundaries before placing
    if (checkProductBoundaries(newProduct)) {
      setPlacedProducts([...placedProducts, newProduct]);
      toast.success(`${product.name} placed in room`);
    } else {
      toast.error('Cannot place product outside room walls!');
    }
  };

  // Wall tool handler
  const handleWallTool = (point: Point, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left clicks
    
    if (!isDrawingActive) {
      setIsDrawingActive(true);
      setRoomPoints([point]);
      setCurrentDrawingPoint(point);
    } else {
      // Check if this is a double click to close the shape
      if (roomPoints.length > 2 && isNearFirstPoint(point)) {
        setIsDrawingActive(false);
        setCurrentDrawingPoint(null);
        toast.success('Room completed');
      } else {
        setRoomPoints([...roomPoints, point]);
      }
    }
  };

  // Check if point is near the first point (for closing the shape)
  const isNearFirstPoint = (point: Point): boolean => {
    if (roomPoints.length === 0) return false;
    
    const firstPoint = roomPoints[0];
    const dx = point.x - firstPoint.x;
    const dy = point.y - firstPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < 10 / zoom;
  };

  // Apply custom length to current line
  const applyCustomLength = () => {
    if (!pendingLineStart || !customLength) return;
    
    const length = parseFloat(customLength);
    if (isNaN(length) || length <= 0) {
      toast.error('Please enter a valid length');
      return;
    }
    
    // Calculate direction from last point to current mouse position
    const lastPoint = roomPoints[roomPoints.length - 1];
    const dx = currentDrawingPoint ? currentDrawingPoint.x - lastPoint.x : 0;
    const dy = currentDrawingPoint ? currentDrawingPoint.y - lastPoint.y : 0;
    const currentAngle = Math.atan2(dy, dx);
    
    // Calculate new point based on angle and custom length
    const newPoint = {
      x: lastPoint.x + Math.cos(currentAngle) * length * scale,
      y: lastPoint.y + Math.sin(currentAngle) * length * scale
    };
    
    setRoomPoints([...roomPoints, newPoint]);
    setShowLengthInput(false);
    setCustomLength('');
    setPendingLineStart(null);
  };

  // Select tool handler
  const handleSelectTool = (point: Point, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left clicks
    
    // Check for product selection
    const clickThreshold = 10 / zoom;
    
    // First, try to select rotation handle if a product is already selected
    if (selectedProduct) {
      const product = placedProducts.find(p => p.id === selectedProduct);
      if (product) {
        const productScale = product.scale || 1;
        const width = product.dimensions.length * scale * productScale;
        const height = product.dimensions.width * scale * productScale;
        
        // Calculate rotation handle position
        const handleSize = 8 / zoom;
        const rotationHandleX = product.position.x;
        const rotationHandleY = product.position.y - (height / 2 + handleSize * 2) * Math.cos((product.rotation * Math.PI) / 180);
        const rotationHandleZ = product.position.x + (height / 2 + handleSize * 2) * Math.sin((product.rotation * Math.PI) / 180);
        
        const dx = point.x - rotationHandleX;
        const dy = point.y - rotationHandleY;
        const distanceToRotationHandle = Math.sqrt(dx * dx + dy * dy);
        
        if (distanceToRotationHandle < handleSize * 2) {
          setIsRotating(true);
          setRotationCenter(product.position);
          setInitialRotation(product.rotation);
          setShowRotationCompass(true);
          return;
        }
      }
    }
    
    // Try to select a product
    for (let i = placedProducts.length - 1; i >= 0; i--) {
      const product = placedProducts[i];
      const productScale = product.scale || 1;
      const width = product.dimensions.length * scale * productScale;
      const height = product.dimensions.width * scale * productScale;
      
      // Check if click is within rotated rectangle
      const dx = point.x - product.position.x;
      const dy = point.y - product.position.y;
      
      // Rotate point to align with product
      const rotationRad = (-product.rotation * Math.PI) / 180;
      const rotatedX = dx * Math.cos(rotationRad) - dy * Math.sin(rotationRad);
      const rotatedY = dx * Math.sin(rotationRad) + dy * Math.cos(rotationRad);
      
      if (
        rotatedX >= -width / 2 - clickThreshold &&
        rotatedX <= width / 2 + clickThreshold &&
        rotatedY >= -height / 2 - clickThreshold &&
        rotatedY <= height / 2 + clickThreshold
      ) {
        setSelectedProduct(product.id);
        setSelectedText(null);
        setSelectedDoor(null);
        
        // Start dragging if clicked near center
        if (
          rotatedX >= -width / 4 &&
          rotatedX <= width / 4 &&
          rotatedY >= -height / 4 &&
          rotatedY <= height / 4
        ) {
          startDragging(product.id, point);
        }
        
        return;
      }
    }
    
    // Try to select a text annotation
    for (let i = textAnnotations.length - 1; i >= 0; i--) {
      const annotation = textAnnotations[i];
      const dx = point.x - annotation.position.x;
      const dy = point.y - annotation.position.y;
      
      // Approximate text width based on length and font size
      const textWidth = annotation.text.length * annotation.fontSize * 0.6;
      const textHeight = annotation.fontSize;
      
      if (
        dx >= -clickThreshold &&
        dx <= textWidth + clickThreshold &&
        dy >= -textHeight - clickThreshold &&
        dy <= clickThreshold
      ) {
        setSelectedText(annotation.id);
        setSelectedProduct(null);
        setSelectedDoor(null);
        
        // Check for double click to edit text
        if (e.detail === 2) {
          setIsEditingText(true);
          setEditingText(annotation.text);
        } else {
          // Start dragging text
          setIsDragging(true);
          setDragStart(point);
          setOriginalProductPosition(annotation.position);
        }
        
        return;
      }
    }
    
    // Try to select a door
    for (let i = doors.length - 1; i >= 0; i--) {
      const door = doors[i];
      const dx = point.x - door.position.x;
      const dy = point.y - door.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < door.width * scale / 2 + clickThreshold) {
        setSelectedDoor(door.id);
        setSelectedProduct(null);
        setSelectedText(null);
        return;
      }
    }
    
    // If nothing selected, clear selection
    setSelectedProduct(null);
    setSelectedText(null);
    setSelectedDoor(null);
  };

  // Text tool handler
  const handleTextTool = (point: Point) => {
    const newAnnotation: TextAnnotation = {
      id: Date.now().toString(),
      position: point,
      text: 'New Text',
      fontSize: 16
    };
    
    setTextAnnotations([...textAnnotations, newAnnotation]);
    setSelectedText(newAnnotation.id);
    setIsEditingText(true);
    setEditingText(newAnnotation.text);
  };

  // Door tool handler
  const handleDoorTool = (point: Point) => {
    if (roomPoints.length < 2) {
      toast.error('Please draw room walls first');
      return;
    }
    
    // Find closest wall segment
    const closestWall = findClosestWallSegment(point, roomPoints);
    if (!closestWall || closestWall.distance > 20 / zoom) {
      toast.error('Please click near a wall to place a door');
      return;
    }
    
    // Calculate optimal door position and rotation
    const { position, wallPosition, rotation } = findOptimalDoorPosition(point, closestWall.segment);
    
    // Standard door width (0.9m)
    const doorWidth = 0.9;
    
    // Check for conflicts with existing doors
    const newDoor: Door = {
      id: Date.now().toString(),
      position,
      rotation,
      width: doorWidth,
      swingDirection: 'inward',
      wallSegmentIndex: closestWall.index,
      isEmbedded: true,
      wallPosition
    };
    
    if (checkDoorConflict(newDoor, doors, doorWidth)) {
      toast.error('Door placement conflicts with an existing door');
      return;
    }
    
    setDoors([...doors, newDoor]);
    toast.success('Door placed');
  };

  // Eraser tool handler
  const handleEraserTool = (point: Point) => {
    const clickThreshold = 10 / zoom;
    
    // Try to erase a product
    for (let i = placedProducts.length - 1; i >= 0; i--) {
      const product = placedProducts[i];
      const productScale = product.scale || 1;
      const width = product.dimensions.length * scale * productScale;
      const height = product.dimensions.width * scale * productScale;
      
      // Check if click is within rotated rectangle
      const dx = point.x - product.position.x;
      const dy = point.y - product.position.y;
      
      // Rotate point to align with product
      const rotationRad = (-product.rotation * Math.PI) / 180;
      const rotatedX = dx * Math.cos(rotationRad) - dy * Math.sin(rotationRad);
      const rotatedY = dx * Math.sin(rotationRad) + dy * Math.cos(rotationRad);
      
      if (
        rotatedX >= -width / 2 - clickThreshold &&
        rotatedX <= width / 2 + clickThreshold &&
        rotatedY >= -height / 2 - clickThreshold &&
        rotatedY <= height / 2 + clickThreshold
      ) {
        setPlacedProducts(placedProducts.filter(p => p.id !== product.id));
        toast.success(`${product.name} removed`);
        return;
      }
    }
    
    // Try to erase a text annotation
    for (let i = textAnnotations.length - 1; i >= 0; i--) {
      const annotation = textAnnotations[i];
      const dx = point.x - annotation.position.x;
      const dy = point.y - annotation.position.y;
      
      // Approximate text width based on length and font size
      const textWidth = annotation.text.length * annotation.fontSize * 0.6;
      const textHeight = annotation.fontSize;
      
      if (
        dx >= -clickThreshold &&
        dx <= textWidth + clickThreshold &&
        dy >= -textHeight - clickThreshold &&
        dy <= clickThreshold
      ) {
        setTextAnnotations(textAnnotations.filter(a => a.id !== annotation.id));
        toast.success('Text removed');
        return;
      }
    }
    
    // Try to erase a door
    for (let i = doors.length - 1; i >= 0; i--) {
      const door = doors[i];
      const dx = point.x - door.position.x;
      const dy = point.y - door.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < door.width * scale / 2 + clickThreshold) {
        setDoors(doors.filter(d => d.id !== door.id));
        toast.success('Door removed');
        return;
      }
    }
    
    // Try to erase a wall point
    for (let i = 0; i < roomPoints.length; i++) {
      const wallPoint = roomPoints[i];
      const dx = point.x - wallPoint.x;
      const dy = point.y - wallPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < clickThreshold) {
        // Don't allow erasing if we only have 3 points or less
        if (roomPoints.length <= 3) {
          toast.error('Cannot remove more wall points - minimum 3 required');
          return;
        }
        
        const newRoomPoints = [...roomPoints];
        newRoomPoints.splice(i, 1);
        setRoomPoints(newRoomPoints);
        toast.success('Wall point removed');
        return;
      }
    }
    
    // Try to erase a wall segment
    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      const point1 = roomPoints[i];
      const point2 = roomPoints[nextIndex];
      
      const distance = distancePointToLine(point, point1, point2);
      
      if (distance < clickThreshold) {
        // Don't allow erasing if we only have 3 points or less
        if (roomPoints.length <= 3) {
          toast.error('Cannot remove wall segments - minimum 3 required');
          return;
        }
        
        const newRoomPoints = [...roomPoints];
        newRoomPoints.splice(nextIndex, 0, point);
        setRoomPoints(newRoomPoints);
        toast.success('Wall segment split');
        return;
      }
    }
  };

  // Rotate selected product
  const rotateSelectedProduct = () => {
    if (!selectedProduct) return;
    
    const product = placedProducts.find(p => p.id === selectedProduct);
    if (!product) return;
    
    // Rotate by 15 degrees
    const newRotation = (product.rotation + 15) % 360;
    
    rotateProductWithBoundaryCheck(selectedProduct, newRotation);
  };

  // Duplicate selected product
  const duplicateSelectedProduct = () => {
    if (!selectedProduct) return;
    
    const product = placedProducts.find(p => p.id === selectedProduct);
    if (!product) return;
    
    const newProduct: PlacedProduct = {
      ...product,
      id: Date.now().toString(),
      position: {
        x: product.position.x + 20,
        y: product.position.y + 20
      }
    };
    
    // Check boundaries before placing
    if (checkProductBoundaries(newProduct)) {
      setPlacedProducts([...placedProducts, newProduct]);
      setSelectedProduct(newProduct.id);
      toast.success(`${product.name} duplicated`);
    } else {
      toast.error('Cannot duplicate - would be outside room walls');
    }
  };

  // Delete selected product
  const deleteSelectedProduct = () => {
    if (!selectedProduct) return;
    
    setPlacedProducts(placedProducts.filter(p => p.id !== selectedProduct));
    setSelectedProduct(null);
    toast.success('Product deleted');
  };

  // Delete selected text
  const deleteSelectedText = () => {
    if (!selectedText) return;
    
    setTextAnnotations(textAnnotations.filter(t => t.id !== selectedText));
    setSelectedText(null);
    toast.success('Text deleted');
  };

  // Save edited text
  const saveEditedText = () => {
    if (!selectedText || !editingText) return;
    
    setTextAnnotations(textAnnotations.map(t => 
      t.id === selectedText ? { ...t, text: editingText } : t
    ));
    
    setIsEditingText(false);
    setEditingText('');
    toast.success('Text updated');
  };

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsPanning(false);
          setIsDragging(false);
          setIsRotating(false);
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Room Area Display */}
      {roomPoints.length > 2 && !isDrawingActive && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <div className="text-sm font-medium text-gray-900">
            Room Area: {calculateRoomArea().toFixed(2)} m²
          </div>
        </div>
      )}

      {/* Enhanced Tool Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.1))}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
        
        {selectedProduct && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={rotateSelectedProduct}
              title="Rotate Product (R)"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={duplicateSelectedProduct}
              title="Duplicate Product (D)"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={deleteSelectedProduct}
              title="Delete Product (Del)"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Wall Length Input Modal */}
      {showWallLengthInput && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Adjust Wall Length</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Length (meters)</label>
                <Input
                  type="number"
                  value={wallEditLength}
                  onChange={(e) => setWallEditLength(e.target.value)}
                  placeholder="Enter length in meters"
                  step="0.1"
                  min="0.1"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={adjustWallLength} className="flex-1">
                  Apply
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowWallLengthInput(false);
                    setSelectedWall(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Length Input Modal */}
      {showLengthInput && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Set Wall Length</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Length (meters)</label>
                <Input
                  type="number"
                  value={customLength}
                  onChange={(e) => setCustomLength(e.target.value)}
                  placeholder="Enter length in meters"
                  step="0.1"
                  min="0.1"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={applyCustomLength} className="flex-1">
                  Apply
                </Button>
                <Button variant="outline" onClick={() => setShowLengthInput(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Edit Modal */}
      {isEditingText && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Edit Text</h3>
            <div className="space-y-4">
              <Input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                placeholder="Enter text"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button onClick={saveEditedText} className="flex-1">
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditingText(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasWorkspace;
