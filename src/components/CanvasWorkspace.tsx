
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation } from '@/types/floorPlanTypes';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Crosshair } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

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
  const animationFrameRef = useRef<number>();
  
  // Canvas state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  
  // New state for enhanced features
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapTolerance] = useState(10); // pixels
  const [snapPoint, setSnapPoint] = useState<Point | null>(null);
  const [rightClickTolerance] = useState(6); // pixels for right-click sensitivity
  const [rightClickStart, setRightClickStart] = useState<Point | null>(null);

  // Grid settings
  const gridSize = 20;

  // Snap to grid function
  const snapToGridPoint = useCallback((point: Point): Point => {
    if (!snapToGrid) return point;
    
    const snappedX = Math.round(point.x / gridSize) * gridSize;
    const snappedY = Math.round(point.y / gridSize) * gridSize;
    
    // Check if point is within snap tolerance
    const distance = Math.sqrt(Math.pow(point.x - snappedX, 2) + Math.pow(point.y - snappedY, 2));
    
    if (distance <= snapTolerance) {
      return { x: snappedX, y: snappedY };
    }
    
    return point;
  }, [snapToGrid, snapTolerance, gridSize]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenPoint: Point): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return screenPoint;
    
    const rect = canvas.getBoundingClientRect();
    const x = (screenPoint.x - rect.left - panOffset.x) / zoomLevel;
    const y = (screenPoint.y - rect.top - panOffset.y) / zoomLevel;
    
    return { x, y };
  }, [panOffset, zoomLevel]);

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasPoint: Point): Point => {
    const x = canvasPoint.x * zoomLevel + panOffset.x;
    const y = canvasPoint.y * zoomLevel + panOffset.y;
    return { x, y };
  }, [panOffset, zoomLevel]);

  // Check if point is near a grid intersection
  const checkSnapPoint = useCallback((point: Point): Point | null => {
    if (!snapToGrid) return null;
    
    const snapped = snapToGridPoint(point);
    const distance = Math.sqrt(Math.pow(point.x - snapped.x, 2) + Math.pow(point.y - snapped.y, 2));
    
    if (distance <= snapTolerance) {
      return snapped;
    }
    
    return null;
  }, [snapToGrid, snapToGridPoint, snapTolerance]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showGrid) return;
    
    ctx.save();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    
    const startX = Math.floor(-panOffset.x / zoomLevel / gridSize) * gridSize;
    const startY = Math.floor(-panOffset.y / zoomLevel / gridSize) * gridSize;
    const endX = startX + Math.ceil(width / zoomLevel) + gridSize;
    const endY = startY + Math.ceil(height / zoomLevel) + gridSize;
    
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      const screenX = x * zoomLevel + panOffset.x;
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
    }
    
    for (let y = startY; y <= endY; y += gridSize) {
      const screenY = y * zoomLevel + panOffset.y;
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
    }
    ctx.stroke();
    ctx.restore();
  }, [showGrid, panOffset, zoomLevel, gridSize]);

  const drawRulers = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showRuler) return;
    
    ctx.save();
    ctx.fillStyle = '#f5f5f5';
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.fillStyle = '#666';
    
    // Horizontal ruler
    ctx.fillRect(0, 0, width, 30);
    ctx.strokeRect(0, 0, width, 30);
    
    // Vertical ruler
    ctx.fillRect(0, 30, 30, height - 30);
    ctx.strokeRect(0, 30, 30, height - 30);
    
    // Ruler marks and labels
    const markSpacing = gridSize * zoomLevel;
    const startX = Math.floor(-panOffset.x / markSpacing) * markSpacing;
    const startY = Math.floor((-panOffset.y + 30) / markSpacing) * markSpacing;
    
    ctx.fillStyle = '#333';
    
    // Horizontal marks
    for (let x = startX; x < width; x += markSpacing) {
      const canvasX = (x - panOffset.x) / zoomLevel;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 30);
      ctx.stroke();
      ctx.fillText(`${Math.round(canvasX)}`, x + 2, 18);
    }
    
    // Vertical marks
    for (let y = startY; y < height; y += markSpacing) {
      const canvasY = (y - panOffset.y - 30) / zoomLevel;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(30, y);
      ctx.stroke();
      ctx.save();
      ctx.translate(18, y - 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${Math.round(canvasY)}`, 0, 0);
      ctx.restore();
    }
    
    ctx.restore();
  }, [showRuler, panOffset, zoomLevel, gridSize]);

  const drawCrosshair = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showCrosshair || currentTool === 'select') return;
    
    ctx.save();
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    const screenPos = canvasToScreen(mousePos);
    
    ctx.beginPath();
    ctx.moveTo(0, screenPos.y);
    ctx.lineTo(width, screenPos.y);
    ctx.moveTo(screenPos.x, 0);
    ctx.lineTo(screenPos.x, height);
    ctx.stroke();
    ctx.restore();
  }, [showCrosshair, currentTool, mousePos, canvasToScreen]);

  const drawSnapPoint = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!snapPoint) return;
    
    ctx.save();
    ctx.fillStyle = '#007bff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    const screenPos = canvasToScreen(snapPoint);
    
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Pulsing effect
    const time = Date.now() / 200;
    const pulseRadius = 8 + Math.sin(time) * 3;
    
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, pulseRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.restore();
  }, [snapPoint, canvasToScreen]);

  const drawRoomWalls = useCallback((ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 2) return;
    
    ctx.save();
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    
    ctx.beginPath();
    const firstPoint = canvasToScreen(roomPoints[0]);
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < roomPoints.length; i++) {
      const point = canvasToScreen(roomPoints[i]);
      ctx.lineTo(point.x, point.y);
    }
    
    if (roomPoints.length > 2) {
      ctx.closePath();
    }
    
    ctx.stroke();
    ctx.restore();
  }, [roomPoints, canvasToScreen]);

  const drawProducts = useCallback((ctx: CanvasRenderingContext2D) => {
    placedProducts.forEach(product => {
      ctx.save();
      ctx.fillStyle = product.color || '#3b82f6';
      ctx.strokeStyle = selectedProductId === product.id ? '#ef4444' : '#1f2937';
      ctx.lineWidth = selectedProductId === product.id ? 3 : 1;
      
      const screenPos = canvasToScreen(product.position);
      const width = product.dimensions.length * scale * zoomLevel;
      const height = product.dimensions.width * scale * zoomLevel;
      
      ctx.fillRect(
        screenPos.x - width / 2,
        screenPos.y - height / 2,
        width,
        height
      );
      ctx.strokeRect(
        screenPos.x - width / 2,
        screenPos.y - height / 2,
        width,
        height
      );
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, screenPos.x, screenPos.y);
      
      ctx.restore();
    });
  }, [placedProducts, selectedProductId, scale, zoomLevel, canvasToScreen]);

  const drawCurrentPath = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!isDrawing || currentPath.length === 0) return;
    
    ctx.save();
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    ctx.beginPath();
    const firstPoint = canvasToScreen(currentPath[0]);
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < currentPath.length; i++) {
      const point = canvasToScreen(currentPath[i]);
      ctx.lineTo(point.x, point.y);
    }
    
    ctx.stroke();
    ctx.restore();
  }, [isDrawing, currentPath, canvasToScreen]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw layers in order
    drawGrid(ctx, width, height);
    drawRoomWalls(ctx);
    drawProducts(ctx);
    drawCurrentPath(ctx);
    drawCrosshair(ctx, width, height);
    drawSnapPoint(ctx);
    drawRulers(ctx, width, height);
    
  }, [drawGrid, drawRoomWalls, drawProducts, drawCurrentPath, drawCrosshair, drawSnapPoint, drawRulers]);

  // Handle mouse events
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const canvasPoint = screenToCanvas(screenPoint);
    
    setMousePos(canvasPoint);
    
    // Check for snap point
    const snap = checkSnapPoint(canvasPoint);
    setSnapPoint(snap);
    
    // Show crosshair when using drawing tools
    setShowCrosshair(['wall', 'door', 'text'].includes(currentTool));
    
    // Handle dragging
    if (isDragging && currentTool === 'select') {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [canvasRef, screenToCanvas, checkSnapPoint, currentTool, isDragging, dragStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) return; // Handle right-click separately
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const canvasPoint = screenToCanvas(screenPoint);
    
    // Use snap point if available
    const finalPoint = snapPoint || canvasPoint;
    
    if (currentTool === 'wall') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPath([finalPoint]);
      } else {
        setCurrentPath(prev => [...prev, finalPoint]);
      }
    } else if (currentTool === 'select') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [canvasRef, screenToCanvas, snapPoint, currentTool, isDrawing]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setIsDragging(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if mouse moved within tolerance since right-click started
    if (rightClickStart) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - rightClickStart.x, 2) + 
        Math.pow(e.clientY - rightClickStart.y, 2)
      );
      
      if (distance > rightClickTolerance) {
        setRightClickStart(null);
        return;
      }
    }
    
    // Handle right-click actions based on current tool
    if (currentTool === 'wall' && isDrawing) {
      // Finish drawing
      if (currentPath.length >= 2) {
        setRoomPoints([...roomPoints, ...currentPath]);
        toast.success('Wall completed');
      }
      setIsDrawing(false);
      setCurrentPath([]);
    }
    
    setRightClickStart(null);
  }, [rightClickStart, rightClickTolerance, currentTool, isDrawing, currentPath, roomPoints, setRoomPoints]);

  const handleRightMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) {
      setRightClickStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel * zoomFactor));
    
    // Zoom towards cursor
    const zoomDelta = newZoom - zoomLevel;
    const newPanX = panOffset.x - (mouseX - panOffset.x) * (zoomDelta / zoomLevel);
    const newPanY = panOffset.y - (mouseY - panOffset.y) * (zoomDelta / zoomLevel);
    
    setZoomLevel(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  }, [canvasRef, zoomLevel, panOffset]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isDrawing) {
        setIsDrawing(false);
        setCurrentPath([]);
        toast.info('Drawing cancelled');
      }
      setSelectedProductId(null);
    }
  }, [isDrawing]);

  // Canvas setup and animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const productData = JSON.parse(e.dataTransfer.getData('product'));
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const canvasPoint = screenToCanvas(screenPoint);
      
      const newProduct: PlacedProduct = {
        id: `${productData.id}-${Date.now()}`,
        productId: productData.id,
        name: productData.name,
        dimensions: productData.dimensions,
        position: canvasPoint,
        rotation: 0,
        color: productData.color
      };
      
      setPlacedProducts([...placedProducts, newProduct]);
      toast.success(`${productData.name} placed`);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [canvasRef, screenToCanvas, placedProducts, setPlacedProducts]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      {/* Snap to Grid Toggle */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <Button
          variant={snapToGrid ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSnapToGrid(!snapToGrid)}
          className="h-8 px-3"
        >
          <Grid3X3 className="w-4 h-4 mr-1" />
          Snap to Grid
        </Button>
        {snapToGrid && (
          <Badge variant="secondary" className="text-xs">
            Tolerance: {snapTolerance}px
          </Badge>
        )}
      </div>

      {/* Drawing Mode Indicator */}
      {isDrawing && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="default" className="animate-pulse">
            <Crosshair className="w-3 h-3 mr-1" />
            Drawing Mode
          </Badge>
        </div>
      )}

      {/* Coordinate Display */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono">
        X: {Math.round(mousePos.x)} Y: {Math.round(mousePos.y)}
        {snapPoint && (
          <span className="ml-2 text-blue-600">
            (Snapped: {Math.round(snapPoint.x)}, {Math.round(snapPoint.y)})
          </span>
        )}
      </div>

      {/* Zoom Level Display */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>

      {/* Main Canvas */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onContextMenu={handleContextMenu}
            onMouseDownCapture={handleRightMouseDown}
            onWheel={handleWheel}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              cursor: currentTool === 'select' ? 'default' : 'crosshair',
              border: isDrawing ? '2px solid #007bff' : '1px solid #e5e7eb'
            }}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setSnapToGrid(!snapToGrid)}>
            {snapToGrid ? 'Disable' : 'Enable'} Grid Snap
          </ContextMenuItem>
          {isDrawing && (
            <ContextMenuItem onClick={() => {
              setIsDrawing(false);
              setCurrentPath([]);
            }}>
              Cancel Drawing
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={onClearAll}>
            Clear All
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};

export default CanvasWorkspace;
