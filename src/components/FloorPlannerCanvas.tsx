import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Download, Save, Trash2, ZoomIn, ZoomOut, Send, Square, Eraser, Grid, Ruler, Move } from 'lucide-react';
import { toast } from 'sonner';
import ToolPanel from './ToolPanel';
import UnitSelector from './UnitSelector';
import ObjectLibrary from './ObjectLibrary';

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

type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select';
type Units = 'mm' | 'cm' | 'm' | 'ft' | 'in';

interface FloorPlannerCanvasProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  isDrawingMode: boolean;
  scale: number;
}

const FloorPlannerCanvas: React.FC<FloorPlannerCanvasProps> = ({
  roomPoints,
  setRoomPoints,
  placedProducts,
  setPlacedProducts,
  isDrawingMode,
  scale
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [currentTool, setCurrentTool] = useState<DrawingTool>('wall');
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(false);
  const [units, setUnits] = useState<Units>('m');
  const [customLength, setCustomLength] = useState('');
  const [showLengthInput, setShowLengthInput] = useState(false);
  const [currentDrawingPoint, setCurrentDrawingPoint] = useState<Point | null>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [freehandPath, setFreehandPath] = useState<Point[]>([]);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [roomArea, setRoomArea] = useState(0);

  useEffect(() => {
    drawCanvas();
    calculateRoomArea();
  }, [roomPoints, placedProducts, selectedProduct, zoom, pan, currentDrawingPoint, showGrid, showRuler, freehandPath]);

  // Add mouse wheel zoom
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

  const convertUnits = (valueInMeters: number): number => {
    switch (units) {
      case 'mm': return valueInMeters * 1000;
      case 'cm': return valueInMeters * 100;
      case 'm': return valueInMeters;
      case 'ft': return valueInMeters * 3.28084;
      case 'in': return valueInMeters * 39.3701;
      default: return valueInMeters;
    }
  };

  const formatLength = (lengthInMeters: number): string => {
    const converted = convertUnits(lengthInMeters);
    return `${converted.toFixed(units === 'mm' ? 0 : 2)}${units}`;
  };

  const snapToGrid = (point: Point): Point => {
    if (!showGrid) return point;
    const gridSize = scale * 0.5;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  };

  const calculateDistance = (point1: Point, point2: Point): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy) / scale;
  };

  const calculateRoomArea = () => {
    if (roomPoints.length < 3) {
      setRoomArea(0);
      return;
    }

    let area = 0;
    for (let i = 0; i < roomPoints.length; i++) {
      const j = (i + 1) % roomPoints.length;
      area += roomPoints[i].x * roomPoints[j].y;
      area -= roomPoints[j].x * roomPoints[i].y;
    }
    area = Math.abs(area / 2) / (scale * scale);
    setRoomArea(area);
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

    if (showGrid) {
      drawGrid(ctx, canvas.width / zoom, canvas.height / zoom);
    }

    if (showRuler) {
      drawRuler(ctx, canvas.width / zoom, canvas.height / zoom);
    }

    drawRoom(ctx);
    drawFreehandPath(ctx);
    drawCurrentLine(ctx);
    drawPlacedProducts(ctx);
    drawDimensions(ctx);

    ctx.restore();

    drawZoomControls();
    drawToolCursor();
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

  const drawRuler = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, 30);
    ctx.fillRect(0, 0, 30, height);

    ctx.strokeStyle = '#374151';
    ctx.fillStyle = '#374151';
    ctx.font = `${10 / zoom}px sans-serif`;
    ctx.lineWidth = 1 / zoom;

    const meterSize = scale;
    for (let x = 0; x <= width; x += meterSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 20);
      ctx.stroke();
      
      if (x > 0) {
        ctx.fillText(`${convertUnits(x / scale).toFixed(0)}${units}`, x + 2, 15);
      }
    }

    for (let y = 0; y <= height; y += meterSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(20, y);
      ctx.stroke();
      
      if (y > 0) {
        ctx.save();
        ctx.translate(15, y - 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${convertUnits(y / scale).toFixed(0)}${units}`, 0, 0);
        ctx.restore();
      }
    }
  };

  const drawRoom = (ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 1) return;

    ctx.strokeStyle = currentTool === 'eraser' ? '#ef4444' : '#374151';
    ctx.lineWidth = 3 / zoom;
    ctx.setLineDash([]);

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

    ctx.beginPath();
    ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
    for (let i = 1; i < roomPoints.length; i++) {
      ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
    }
    if (!isDrawingActive && roomPoints.length > 2) {
      ctx.closePath();
    }
    ctx.stroke();

    ctx.fillStyle = currentTool === 'eraser' ? '#ef4444' : '#374151';
    roomPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4 / zoom, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawFreehandPath = (ctx: CanvasRenderingContext2D) => {
    if (freehandPath.length < 2) return;

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(freehandPath[0].x, freehandPath[0].y);
    for (let i = 1; i < freehandPath.length; i++) {
      ctx.lineTo(freehandPath[i].x, freehandPath[i].y);
    }
    ctx.stroke();
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

    // Draw length near cursor
    const length = calculateDistance(lastPoint, currentDrawingPoint);
    const midX = (lastPoint.x + currentDrawingPoint.x) / 2;
    const midY = (lastPoint.y + currentDrawingPoint.y) / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(midX - 30, midY - 10, 60, 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `${12 / zoom}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(formatLength(length), midX, midY + 3);
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

    ctx.fillStyle = '#374151';
    ctx.font = `${10 / zoom}px sans-serif`;
    ctx.textAlign = 'center';

    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      if (nextIndex === 0 && isDrawingActive) continue;

      const point1 = roomPoints[i];
      const point2 = roomPoints[nextIndex];
      const length = calculateDistance(point1, point2);
      
      const midX = (point1.x + point2.x) / 2;
      const midY = (point1.y + point2.y) / 2;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(midX - 25, midY - 8, 50, 16);
      
      ctx.fillStyle = '#374151';
      ctx.fillText(formatLength(length), midX, midY + 3);
    }
  };

  const drawZoomControls = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const controlSize = 40;
    const margin = 20;
    const x = canvas.width - controlSize - margin;
    const yZoomIn = margin;
    const yZoomOut = margin + controlSize + 10;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, yZoomIn, controlSize, controlSize);
    ctx.fillRect(x, yZoomOut, controlSize, controlSize);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+', x + controlSize/2, yZoomIn + controlSize/2 + 7);
    ctx.fillText('−', x + controlSize/2, yZoomOut + controlSize/2 + 7);
  };

  const drawToolCursor = () => {
    // Visual feedback for current tool would be implemented here
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

    if (currentTool === 'pan') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (currentTool === 'freehand') {
      setIsDrawingFreehand(true);
      setFreehandPath([{ x, y }]);
      return;
    }

    if (currentTool === 'eraser') {
      handleErase({ x, y });
      return;
    }

    if (currentTool === 'select') {
      handleSelection({ x, y });
      return;
    }

    if (currentTool === 'wall' || currentTool === 'line') {
      handleWallDrawing({ x, y });
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

    if (isDrawingFreehand) {
      setFreehandPath(prev => [...prev, { x, y }]);
      return;
    }

    if (isDrawingActive && roomPoints.length > 0) {
      const snappedPoint = snapToGrid({ x, y });
      setCurrentDrawingPoint(snappedPoint);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setIsDrawingFreehand(false);
    setLastPanPoint(null);
  };

  const handleWallDrawing = (point: Point) => {
    const snappedPoint = snapToGrid(point);
    
    if (!isDrawingActive) {
      setRoomPoints([snappedPoint]);
      setIsDrawingActive(true);
      toast.success('Drawing started! Click to add points, double-click to finish.');
    } else {
      setRoomPoints([...roomPoints, snappedPoint]);
    }
  };

  const handleErase = (point: Point) => {
    const threshold = 20 / zoom;
    
    // Check for room points
    const pointIndex = roomPoints.findIndex(p => {
      const distance = Math.sqrt((p.x - point.x) ** 2 + (p.y - point.y) ** 2);
      return distance < threshold;
    });
    
    if (pointIndex !== -1) {
      const newPoints = roomPoints.filter((_, i) => i !== pointIndex);
      setRoomPoints(newPoints);
      if (newPoints.length === 0) setIsDrawingActive(false);
      toast.success('Point removed');
      return;
    }

    // Check for products
    const productToRemove = placedProducts.find(product => {
      const distance = Math.sqrt((product.position.x - point.x) ** 2 + (product.position.y - point.y) ** 2);
      return distance < threshold;
    });

    if (productToRemove) {
      setPlacedProducts(placedProducts.filter(p => p.id !== productToRemove.id));
      toast.success('Product removed');
    }
  };

  const handleSelection = (point: Point) => {
    const clickedProduct = placedProducts.find(product => {
      const dx = point.x - product.position.x;
      const dy = point.y - product.position.y;
      const width = (product.dimensions.length * scale * (product.scale || 1)) / 2;
      const height = (product.dimensions.width * scale * (product.scale || 1)) / 2;
      return Math.abs(dx) <= width && Math.abs(dy) <= height;
    });

    setSelectedProduct(clickedProduct ? clickedProduct.id : null);
  };

  const handleCanvasDoubleClick = () => {
    if (isDrawingActive && roomPoints.length >= 3) {
      setIsDrawingActive(false);
      setCurrentDrawingPoint(null);
      toast.success('Shape completed!');
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

      setPlacedProducts([...placedProducts, newProduct]);
      toast.success(`${productData.name} placed`);
    } catch (error) {
      console.error('Error placing product:', error);
    }
  };

  const rotateSelectedProduct = () => {
    if (!selectedProduct) return;
    const updatedProducts = placedProducts.map((product: PlacedProduct) =>
      product.id === selectedProduct
        ? { ...product, rotation: (product.rotation + 15) % 360 }
        : product
    );
    setPlacedProducts(updatedProducts);
  };

  const scaleSelectedProduct = (factor: number) => {
    if (!selectedProduct) return;
    const updatedProducts = placedProducts.map((product: PlacedProduct) =>
      product.id === selectedProduct
        ? { ...product, scale: Math.max(0.1, (product.scale || 1) * factor) }
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

    setPlacedProducts([...placedProducts, newProduct]);
    setSelectedProduct(newProduct.id);
    toast.success('Product duplicated');
  };

  const clearAll = () => {
    setRoomPoints([]);
    setPlacedProducts([]);
    setFreehandPath([]);
    setIsDrawingActive(false);
    setCurrentDrawingPoint(null);
    setSelectedProduct(null);
    toast.success('Canvas cleared');
  };

  const exportLayout = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'floor-plan.png';
    link.href = canvas.toDataURL();
    link.click();
    
    toast.success('Floor plan exported');
  };

  const handleSendFloorPlan = () => {
    if (!userEmail) {
      toast.error('Please enter your email address');
      return;
    }

    console.log('Sending floor plan:', { userEmail, userMessage, roomPoints, placedProducts, roomArea });
    toast.success('Floor plan sent successfully!');
    setShowSendForm(false);
    setUserEmail('');
    setUserMessage('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <ToolPanel 
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showRuler={showRuler}
          onToggleRuler={() => setShowRuler(!showRuler)}
          onClear={clearAll}
          isDrawingActive={isDrawingActive}
          onFinishShape={() => {
            setIsDrawingActive(false);
            setCurrentDrawingPoint(null);
            toast.success('Shape completed!');
          }}
        />
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <UnitSelector units={units} onUnitsChange={setUnits} />
            <div className="flex space-x-2">
              {selectedProduct && (
                <>
                  <Button variant="outline" size="sm" onClick={rotateSelectedProduct}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Rotate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => scaleSelectedProduct(1.1)}>
                    Scale +
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => scaleSelectedProduct(0.9)}>
                    Scale -
                  </Button>
                  <Button variant="outline" size="sm" onClick={duplicateSelectedProduct}>
                    Duplicate
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => {
                    setPlacedProducts(placedProducts.filter(p => p.id !== selectedProduct));
                    setSelectedProduct(null);
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={exportLayout}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button size="sm" onClick={() => setShowSendForm(true)}>
                <Send className="w-4 h-4 mr-1" />
                Send Plan
              </Button>
            </div>
          </div>

          {roomArea > 0 && (
            <div className="text-sm bg-blue-50 p-3 rounded-lg">
              <strong>Room Area:</strong> {convertUnits(roomArea).toFixed(2)} {units}²
            </div>
          )}

          <Card>
            <CardContent className="p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-300 rounded cursor-crosshair bg-white w-full"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onDoubleClick={handleCanvasDoubleClick}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              />
              
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>
                  Tool: {currentTool} | Zoom: {Math.round(zoom * 100)}%
                </span>
                <span>
                  Points: {roomPoints.length} | Products: {placedProducts.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {showLengthInput && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Label htmlFor="customLength">Enter exact length ({units})</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="customLength"
                      value={customLength}
                      onChange={(e) => setCustomLength(e.target.value)}
                      placeholder={`Length in ${units}`}
                      type="number"
                    />
                    <Button onClick={() => {
                      // Implementation for custom length would go here
                      setShowLengthInput(false);
                      setCustomLength('');
                    }}>
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showSendForm && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Send Floor Plan</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="userEmail">Email Address *</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="your.email@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userMessage">Message</Label>
                      <Input
                        id="userMessage"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSendFloorPlan}>Send</Button>
                    <Button variant="outline" onClick={() => setShowSendForm(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <ObjectLibrary 
          onProductDrag={(product) => {
            // Handle product drag start
            console.log('Dragging product:', product);
          }}
          currentTool={currentTool}
        />
      </div>
    </div>
  );
};

export default FloorPlannerCanvas;
