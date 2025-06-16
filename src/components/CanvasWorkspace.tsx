import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Move, RotateCcw, Copy, Trash2, Eraser } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
}

interface PlacedProduct {
  id: string;
  productId: string;
  name: string;
  position: Point;
  rotation: number;
  dimensions: { length: number; width: number; height: number };
  color: string;
  scale?: number;
}

interface CanvasWorkspaceProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  scale: number;
  currentTool: string;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  roomPoints,
  setRoomPoints,
  placedProducts,
  setPlacedProducts,
  scale,
  currentTool
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [currentDrawingPoint, setCurrentDrawingPoint] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [showLengthInput, setShowLengthInput] = useState(false);
  const [customLength, setCustomLength] = useState('');
  const [pendingLineStart, setPendingLineStart] = useState<Point | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStart, setRotationStart] = useState<Point | null>(null);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC to release line drawing
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isDrawingActive) {
          setIsDrawingActive(false);
          setCurrentDrawingPoint(null);
          setPendingLineStart(null);
          toast.success('Drawing cancelled');
        } else {
          setSelectedProduct(null);
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

      if (!selectedProduct) return;
      
      switch (e.key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          rotateSelectedProduct();
          break;
        case 'd':
          e.preventDefault();
          duplicateSelectedProduct();
          break;
        case 'delete':
        case 'backspace':
          e.preventDefault();
          deleteSelectedProduct();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedProduct, isDrawingActive, currentDrawingPoint, roomPoints]);

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
    };

    canvas.addEventListener('wheel', handleWheel);
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // Canvas resize
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [roomPoints, placedProducts, selectedProduct, zoom, pan, currentDrawingPoint]);

  const calculateRoomArea = (): number => {
    if (roomPoints.length < 3 || isDrawingActive) return 0;
    
    // Use shoelace formula to calculate polygon area
    let area = 0;
    for (let i = 0; i < roomPoints.length; i++) {
      const j = (i + 1) % roomPoints.length;
      area += roomPoints[i].x * roomPoints[j].y;
      area -= roomPoints[j].x * roomPoints[i].y;
    }
    area = Math.abs(area) / 2;
    
    // Convert from pixels to square meters
    return area / (scale * scale);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw grid
    drawGrid(ctx, canvas.width / zoom, canvas.height / zoom);
    
    // Draw room
    drawRoom(ctx);
    
    // Draw current line while drawing
    drawCurrentLine(ctx);
    
    // Draw placed products
    drawPlacedProducts(ctx);
    
    // Draw dimensions on completed walls
    drawDimensions(ctx);

    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1 / zoom;

    const gridSize = scale * 0.5;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawRoom = (ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 1) return;

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3 / zoom;

    // Fill room if completed
    if (roomPoints.length > 2 && !isDrawingActive) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
      for (let i = 1; i < roomPoints.length; i++) {
        ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Draw walls
    ctx.beginPath();
    ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
    for (let i = 1; i < roomPoints.length; i++) {
      ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
    }
    if (!isDrawingActive && roomPoints.length > 2) {
      ctx.closePath();
    }
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#374151';
    roomPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4 / zoom, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawCurrentLine = (ctx: CanvasRenderingContext2D) => {
    if (!currentDrawingPoint || roomPoints.length === 0 || !isDrawingActive) return;

    const lastPoint = roomPoints[roomPoints.length - 1];
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([5 / zoom, 5 / zoom]);

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentDrawingPoint.x, currentDrawingPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw length directly on the line
    const length = calculateDistance(lastPoint, currentDrawingPoint);
    const midX = (lastPoint.x + currentDrawingPoint.x) / 2;
    const midY = (lastPoint.y + currentDrawingPoint.y) / 2;
    
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${16 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${length.toFixed(2)}m`, midX, midY - 8);
  };

  const drawPlacedProducts = (ctx: CanvasRenderingContext2D) => {
    placedProducts.forEach(product => {
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate((product.rotation * Math.PI) / 180);

      const width = product.dimensions.length * scale * (product.scale || 1);
      const height = product.dimensions.width * scale * (product.scale || 1);

      ctx.fillStyle = product.color;
      ctx.strokeStyle = selectedProduct === product.id ? '#ef4444' : '#1f2937';
      ctx.lineWidth = (selectedProduct === product.id ? 3 : 1) / zoom;
      
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.strokeRect(-width/2, -height/2, width, height);

      ctx.fillStyle = '#ffffff';
      ctx.font = `${10 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 0, 2);

      ctx.restore();
    });
  };

  const drawDimensions = (ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 2) return;

    ctx.font = `bold ${12 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';

    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      if (nextIndex === 0 && isDrawingActive) continue;

      const point1 = roomPoints[i];
      const point2 = roomPoints[nextIndex];
      const length = calculateDistance(point1, point2);
      
      const midX = (point1.x + point2.x) / 2;
      const midY = (point1.y + point2.y) / 2;
      
      ctx.fillText(`${length.toFixed(2)}m`, midX, midY - 8);
    }
  };

  const calculateDistance = (point1: Point, point2: Point): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy) / scale;
  };

  const snapToGrid = (point: Point): Point => {
    const gridSize = scale * 0.5;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x * zoom) / zoom;
    const y = (e.clientY - rect.top - pan.y * zoom) / zoom;
    return { x, y };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);

    // Right click or middle mouse for panning
    if (e.button === 2 || e.button === 1 || currentTool === 'pan') {
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (currentTool === 'eraser') {
      handleEraser({ x, y });
    } else if (currentTool === 'wall') {
      handleWallDrawing({ x, y });
    } else if (currentTool === 'select') {
      const clickedProduct = placedProducts.find(product => {
        const dx = x - product.position.x;
        const dy = y - product.position.y;
        const width = (product.dimensions.length * scale * (product.scale || 1)) / 2;
        const height = (product.dimensions.width * scale * (product.scale || 1)) / 2;
        return Math.abs(dx) <= width && Math.abs(dy) <= height;
      });

      if (clickedProduct) {
        setSelectedProduct(clickedProduct.id);
        setIsRotating(true);
        setRotationStart({ x, y });
      } else {
        setSelectedProduct(null);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);

    if (isPanning && lastPanPoint) {
      const deltaX = (e.clientX - lastPanPoint.x) / zoom;
      const deltaY = (e.clientY - lastPanPoint.y) / zoom;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isRotating && selectedProduct && rotationStart) {
      const product = placedProducts.find(p => p.id === selectedProduct);
      if (product) {
        const angle1 = Math.atan2(rotationStart.y - product.position.y, rotationStart.x - product.position.x);
        const angle2 = Math.atan2(y - product.position.y, x - product.position.x);
        const deltaAngle = (angle2 - angle1) * (180 / Math.PI);
        
        const updatedProducts = placedProducts.map(p =>
          p.id === selectedProduct
            ? { ...p, rotation: (p.rotation + deltaAngle) % 360 }
            : p
        );
        setPlacedProducts(updatedProducts);
        setRotationStart({ x, y });
      }
      return;
    }

    if (isDrawingActive && roomPoints.length > 0) {
      const snappedPoint = snapToGrid({ x, y });
      setCurrentDrawingPoint(snappedPoint);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setLastPanPoint(null);
    setIsRotating(false);
    setRotationStart(null);
  };

  // Prevent context menu on right click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleEraser = (point: Point) => {
    // Erase products
    const clickedProduct = placedProducts.find(product => {
      const dx = point.x - product.position.x;
      const dy = point.y - product.position.y;
      const width = (product.dimensions.length * scale * (product.scale || 1)) / 2;
      const height = (product.dimensions.width * scale * (product.scale || 1)) / 2;
      return Math.abs(dx) <= width && Math.abs(dy) <= height;
    });

    if (clickedProduct) {
      const updatedProducts = placedProducts.filter(p => p.id !== clickedProduct.id);
      setPlacedProducts(updatedProducts);
      toast.success('Product erased');
      return;
    }

    // Erase wall points
    const clickedPointIndex = roomPoints.findIndex(roomPoint => {
      const dx = point.x - roomPoint.x;
      const dy = point.y - roomPoint.y;
      return Math.sqrt(dx * dx + dy * dy) <= 20;
    });

    if (clickedPointIndex !== -1) {
      const updatedPoints = roomPoints.filter((_, index) => index !== clickedPointIndex);
      setRoomPoints(updatedPoints);
      toast.success('Wall point erased');
    }
  };

  const handleWallDrawing = (point: Point) => {
    const snappedPoint = snapToGrid(point);
    
    if (!isDrawingActive) {
      setRoomPoints([snappedPoint]);
      setIsDrawingActive(true);
      toast.success('Drawing started! Click to add points, ESC to finish, Enter for custom length.');
    } else {
      const updatedPoints = [...roomPoints, snappedPoint];
      setRoomPoints(updatedPoints);
    }
  };

  const handleCanvasDoubleClick = () => {
    if (isDrawingActive && roomPoints.length >= 3) {
      setIsDrawingActive(false);
      setCurrentDrawingPoint(null);
      toast.success('Room completed!');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e as any);

    try {
      const productData = JSON.parse(e.dataTransfer.getData('product'));
      const snappedPosition = snapToGrid({ x, y });
      
      const newProduct: PlacedProduct = {
        id: `${productData.id}-${Date.now()}`,
        productId: productData.id,
        name: productData.name,
        position: snappedPosition,
        rotation: 0,
        dimensions: productData.dimensions,
        color: productData.color,
        scale: 1
      };

      const updatedProducts = [...placedProducts, newProduct];
      setPlacedProducts(updatedProducts);
      toast.success(`${productData.name} placed`);
    } catch (error) {
      console.error('Error placing product:', error);
    }
  };

  const rotateSelectedProduct = () => {
    if (!selectedProduct) return;
    const updatedProducts = placedProducts.map(product =>
      product.id === selectedProduct
        ? { ...product, rotation: (product.rotation + 15) % 360 }
        : product
    );
    setPlacedProducts(updatedProducts);
  };

  const duplicateSelectedProduct = () => {
    if (!selectedProduct) return;
    const product = placedProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const newProduct = {
      ...product,
      id: `${product.productId}-${Date.now()}`,
      position: { x: product.position.x + 50, y: product.position.y + 50 }
    };

    const updatedProducts = [...placedProducts, newProduct];
    setPlacedProducts(updatedProducts);
    setSelectedProduct(newProduct.id);
    toast.success('Product duplicated');
  };

  const deleteSelectedProduct = () => {
    if (!selectedProduct) return;
    const updatedProducts = placedProducts.filter(p => p.id !== selectedProduct);
    setPlacedProducts(updatedProducts);
    setSelectedProduct(null);
    toast.success('Product deleted');
  };

  const clearAll = () => {
    setRoomPoints([]);
    setPlacedProducts([]);
    setSelectedProduct(null);
    setIsDrawingActive(false);
    setCurrentDrawingPoint(null);
    toast.success('Floor plan cleared');
  };

  const applyCustomLength = () => {
    const length = parseFloat(customLength);
    if (!length || !pendingLineStart || !currentDrawingPoint) return;

    const angle = Math.atan2(
      currentDrawingPoint.y - pendingLineStart.y,
      currentDrawingPoint.x - pendingLineStart.x
    );
    
    const newPoint = {
      x: pendingLineStart.x + Math.cos(angle) * length * scale,
      y: pendingLineStart.y + Math.sin(angle) * length * scale
    };

    const updatedPoints = [...roomPoints, snapToGrid(newPoint)];
    setRoomPoints(updatedPoints);
    setShowLengthInput(false);
    setCustomLength('');
    setPendingLineStart(null);
    toast.success(`${length}m line added`);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${
          currentTool === 'eraser' ? 'cursor-crosshair' : 
          currentTool === 'pan' ? 'cursor-move' : 
          currentTool === 'select' && selectedProduct ? 'cursor-grab' :
          'cursor-crosshair'
        }`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onContextMenu={handleContextMenu}
      />

      {/* Room Area Display - Enhanced */}
      {roomPoints.length >= 3 && !isDrawingActive && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-1">Room Area</div>
          <div className="text-2xl font-bold text-blue-600">
            {calculateRoomArea().toFixed(2)} m²
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(calculateRoomArea() * 10.764).toFixed(1)} sq ft
          </div>
        </div>
      )}

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
          onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
          onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.1))}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="text-xs text-center bg-white/90 backdrop-blur-sm rounded px-2 py-1 shadow-lg">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Selected Product Controls */}
      {selectedProduct && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm shadow-lg"
            onClick={duplicateSelectedProduct}
            title="Duplicate (D)"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="bg-white/90 backdrop-blur-sm shadow-lg"
            onClick={deleteSelectedProduct}
            title="Delete (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Clear All Button */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-600/90 hover:bg-red-700 backdrop-blur-sm shadow-lg"
          onClick={clearAll}
          title="Clear All"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Custom Length Input */}
      {showLengthInput && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-4 border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Enter Line Length</div>
          <div className="flex space-x-2">
            <Input
              value={customLength}
              onChange={(e) => setCustomLength(e.target.value)}
              placeholder="Length (m)"
              type="number"
              step="0.1"
              className="w-28"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyCustomLength();
                } else if (e.key === 'Escape') {
                  setShowLengthInput(false);
                  setCustomLength('');
                  setPendingLineStart(null);
                }
              }}
            />
            <Button size="sm" onClick={applyCustomLength}>
              Apply
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setShowLengthInput(false);
                setCustomLength('');
                setPendingLineStart(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Status Bar */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm shadow-lg rounded px-3 py-2 text-xs text-gray-600 border">
        <div className="flex flex-col space-y-1">
          <div>Tool: <span className="font-medium">{currentTool}</span> | Points: {roomPoints.length} | Products: {placedProducts.length}</div>
          <div className="text-gray-500">
            {isDrawingActive ? 'ESC=Finish, Enter=Custom Length' : selectedProduct ? 'Drag to rotate, D=Duplicate, Del=Delete' : 'Left=Draw/Select, Right=Pan'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasWorkspace;
