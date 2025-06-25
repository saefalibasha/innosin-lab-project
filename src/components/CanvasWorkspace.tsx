import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment } from '@/types/floorPlanTypes';
import VisualSnapGuides from '@/components/VisualSnapGuides';
import { calculateSnapping, generateSnapGuides, SnapGuide } from '@/utils/enhancedObjectSnapping';
import { toast } from 'sonner';

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
  currentZoom?: number;
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
  canvasRef: externalCanvasRef,
  currentZoom = 1
}) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState<PlacedProduct | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [currentWallStart, setCurrentWallStart] = useState<Point | null>(null);
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

  const GRID_SIZE = 20;
  const SNAP_THRESHOLD = 10;

  // Grid snapping utility
  const snapToGrid = useCallback((point: Point): Point => {
    if (!showGrid) return point;
    
    return {
      x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(point.y / GRID_SIZE) * GRID_SIZE
    };
  }, [showGrid, GRID_SIZE]);

  // Line constraint utility for straight lines
  const constrainToStraightLine = useCallback((start: Point, current: Point): Point => {
    const dx = Math.abs(current.x - start.x);
    const dy = Math.abs(current.y - start.y);
    
    // If closer to horizontal, make it perfectly horizontal
    if (dx > dy) {
      return { x: current.x, y: start.y };
    } else {
      // If closer to vertical, make it perfectly vertical
      return { x: start.x, y: current.y };
    }
  }, []);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!showGrid) return;

    const gridSize = GRID_SIZE * currentZoom;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    // Draw grid lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw grid dots at intersections for better visibility
    ctx.fillStyle = '#9ca3af';
    ctx.globalAlpha = 0.4;
    for (let x = 0; x <= canvas.width; x += gridSize) {
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }, [showGrid, currentZoom, GRID_SIZE]);

  const drawWalls = useCallback((ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 2) return;

    // Draw completed wall segments
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 4 * currentZoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(roomPoints[0].x * currentZoom, roomPoints[0].y * currentZoom);
    
    for (let i = 1; i < roomPoints.length; i++) {
      ctx.lineTo(roomPoints[i].x * currentZoom, roomPoints[i].y * currentZoom);
    }
    
    if (roomPoints.length > 2) {
      ctx.closePath();
    }
    
    ctx.stroke();

    // Draw wall points
    roomPoints.forEach((point, index) => {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(point.x * currentZoom, point.y * currentZoom, 6 * currentZoom, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add point number for clarity
      ctx.fillStyle = '#ffffff';
      ctx.font = `${12 * currentZoom}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), point.x * currentZoom, point.y * currentZoom + 4 * currentZoom);
    });

    // Draw preview line when drawing walls
    if (isDrawingWall && currentWallStart && previewPoint) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2 * currentZoom;
      ctx.setLineDash([5 * currentZoom, 5 * currentZoom]);
      
      ctx.beginPath();
      ctx.moveTo(currentWallStart.x * currentZoom, currentWallStart.y * currentZoom);
      ctx.lineTo(previewPoint.x * currentZoom, previewPoint.y * currentZoom);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }
  }, [roomPoints, currentZoom, isDrawingWall, currentWallStart, previewPoint]);

  const drawPlacedProducts = useCallback((ctx: CanvasRenderingContext2D) => {
    placedProducts.forEach((product) => {
      const x = product.position.x * currentZoom;
      const y = product.position.y * currentZoom;
      const width = product.dimensions.length * scale * currentZoom;
      const height = product.dimensions.width * scale * currentZoom;

      // Draw main product rectangle - NO TEXT LABELS
      ctx.fillStyle = product.color || '#3b82f6';
      ctx.globalAlpha = selectedProductIds.includes(product.id) ? 0.8 : 0.6;
      ctx.fillRect(x, y, width, height);

      // Draw border
      ctx.strokeStyle = selectedProductIds.includes(product.id) ? '#1d4ed8' : '#374151';
      ctx.lineWidth = selectedProductIds.includes(product.id) ? 3 * currentZoom : 2 * currentZoom;
      ctx.globalAlpha = 1;
      ctx.strokeRect(x, y, width, height);

      // Draw selection handles if selected
      if (selectedProductIds.includes(product.id)) {
        const handleSize = 8 * currentZoom;
        ctx.fillStyle = '#1d4ed8';
        
        // Corner handles
        const handles = [
          { x: x - handleSize/2, y: y - handleSize/2 },
          { x: x + width - handleSize/2, y: y - handleSize/2 },
          { x: x + width - handleSize/2, y: y + height - handleSize/2 },
          { x: x - handleSize/2, y: y + height - handleSize/2 }
        ];
        
        handles.forEach(handle => {
          ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
        });
      }
    });
  }, [placedProducts, scale, currentZoom, selectedProductIds]);

  const drawDoors = useCallback((ctx: CanvasRenderingContext2D) => {
    doors.forEach((door) => {
      const x = door.position.x * currentZoom;
      const y = door.position.y * currentZoom;
      const width = 30 * currentZoom;
      const height = 8 * currentZoom;

      ctx.fillStyle = '#92400e';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1 * currentZoom;
      ctx.strokeRect(x, y, width, height);
    });
  }, [doors, currentZoom]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom transform
    ctx.save();
    
    // Draw components
    drawGrid(ctx, canvas);
    drawWalls(ctx);
    drawPlacedProducts(ctx);
    drawDoors(ctx);
    
    ctx.restore();
  }, [drawGrid, drawWalls, drawPlacedProducts, drawDoors]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        render();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [render]);

  const getMousePosition = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / currentZoom,
      y: (e.clientY - rect.top) / currentZoom
    };
  };

  const findProductAtPosition = (pos: Point): PlacedProduct | null => {
    for (let i = placedProducts.length - 1; i >= 0; i--) {
      const product = placedProducts[i];
      const productWidth = product.dimensions.length * scale;
      const productHeight = product.dimensions.width * scale;
      
      if (pos.x >= product.position.x && 
          pos.x <= product.position.x + productWidth &&
          pos.y >= product.position.y && 
          pos.y <= product.position.y + productHeight) {
        return product;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const mousePos = getMousePosition(e);
    const snappedPos = snapToGrid(mousePos);

    if (currentTool === 'wall') {
      if (!isDrawingWall) {
        // Start drawing a new wall
        setIsDrawingWall(true);
        setCurrentWallStart(snappedPos);
        setRoomPoints([...roomPoints, snappedPos]);
        toast.success('Wall started - click to add points, double-click to finish');
      } else {
        // Continue the wall
        if (currentWallStart) {
          const constrainedPos = constrainToStraightLine(currentWallStart, snappedPos);
          setRoomPoints([...roomPoints, constrainedPos]);
          setCurrentWallStart(constrainedPos);
        }
      }
    } else if (currentTool === 'select') {
      const clickedProduct = findProductAtPosition(mousePos);
      
      if (clickedProduct) {
        setDraggedProduct(clickedProduct);
        setDragOffset({
          x: mousePos.x - clickedProduct.position.x,
          y: mousePos.y - clickedProduct.position.y
        });
        setIsDragging(true);
        setSelectedProductIds([clickedProduct.id]);
      } else {
        setSelectedProductIds([]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const mousePos = getMousePosition(e);
    const snappedPos = snapToGrid(mousePos);

    // Handle wall drawing preview
    if (isDrawingWall && currentWallStart) {
      const constrainedPos = constrainToStraightLine(currentWallStart, snappedPos);
      setPreviewPoint(constrainedPos);
    }

    // Handle product dragging
    if (!isDragging || !draggedProduct) return;

    const newPosition = {
      x: mousePos.x - dragOffset.x,
      y: mousePos.y - dragOffset.y
    };

    // Calculate snapping
    const snapResult = calculateSnapping(
      draggedProduct,
      newPosition,
      placedProducts.filter(p => p.id !== draggedProduct.id),
      scale,
      showGrid
    );

    // Generate visual guides
    const guides = generateSnapGuides(
      draggedProduct,
      snapResult.position,
      placedProducts.filter(p => p.id !== draggedProduct.id),
      scale
    );
    setSnapGuides(guides);

    // Update product position
    setPlacedProducts(
      placedProducts.map(product =>
        product.id === draggedProduct.id
          ? { ...product, position: snapResult.position }
          : product
      )
    );
  };

  const handleMouseUp = () => {
    if (isDragging && draggedProduct) {
      setIsDragging(false);
      setDraggedProduct(null);
      setSnapGuides([]);
      toast.success('Object positioned');
    }
  };

  const handleDoubleClick = () => {
    if (currentTool === 'wall' && isDrawingWall) {
      setIsDrawingWall(false);
      setCurrentWallStart(null);
      setPreviewPoint(null);
      toast.success('Wall drawing completed');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const productData = e.dataTransfer.getData('product');
    
    if (productData && currentTool === 'select') {
      const product = JSON.parse(productData);
      const mousePos = getMousePosition(e as any);
      const snappedPos = snapToGrid(mousePos);
      
      const newProduct: PlacedProduct = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        position: snappedPos,
        rotation: 0,
        dimensions: product.dimensions,
        color: product.color,
        scale: 1
      };
      
      setPlacedProducts([...placedProducts, newProduct]);
      toast.success(`${product.name} placed`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      <VisualSnapGuides guides={snapGuides} canvasRef={canvasRef} />
    </div>
  );
};

export default CanvasWorkspace;
