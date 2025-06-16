
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Download, Save, Trash2, ZoomIn, ZoomOut, Send } from 'lucide-react';
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
}

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
  const [showLengthInput, setShowLengthInput] = useState(false);
  const [currentLineLength, setCurrentLineLength] = useState('');
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [currentDrawingPoint, setCurrentDrawingPoint] = useState<Point | null>(null);
  const [showSendForm, setShowSendForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userMessage, setUserMessage] = useState('');

  useEffect(() => {
    drawCanvas();
  }, [roomPoints, placedProducts, selectedProduct, zoom, pan, currentDrawingPoint]);

  const snapToGrid = (point: Point): Point => {
    const gridSize = scale;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context and apply zoom/pan
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw grid
    drawGrid(ctx, canvas.width / zoom, canvas.height / zoom);

    // Draw room outline (work in progress)
    if (roomPoints.length > 0) {
      drawRoomInProgress(ctx);
    }

    // Draw current drawing line
    if (isDrawingMode && roomPoints.length > 0 && currentDrawingPoint) {
      drawCurrentLine(ctx);
    }

    // Draw completed room
    if (roomPoints.length > 2) {
      drawRoom(ctx);
    }

    // Draw placed products
    placedProducts.forEach(product => {
      drawProduct(ctx, product);
    });

    ctx.restore();

    // Draw zoom controls overlay
    drawZoomControls();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;

    const gridSize = scale;
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

  const drawRoomInProgress = (ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 1) return;

    // Draw lines between points
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
    
    for (let i = 1; i < roomPoints.length; i++) {
      ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
    }
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#ef4444';
    roomPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawCurrentLine = (ctx: CanvasRenderingContext2D) => {
    if (!currentDrawingPoint || roomPoints.length === 0) return;

    const lastRoomPoint = roomPoints[roomPoints.length - 1];
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(lastRoomPoint.x, lastRoomPoint.y);
    ctx.lineTo(currentDrawingPoint.x, currentDrawingPoint.y);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  const drawRoom = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
    
    for (let i = 1; i < roomPoints.length; i++) {
      ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawProduct = (ctx: CanvasRenderingContext2D, product: PlacedProduct) => {
    ctx.save();
    ctx.translate(product.position.x, product.position.y);
    ctx.rotate((product.rotation * Math.PI) / 180);

    const width = product.dimensions.length * scale;
    const height = product.dimensions.width * scale;

    // Product rectangle
    ctx.fillStyle = product.color;
    ctx.strokeStyle = selectedProduct === product.id ? '#ef4444' : '#1f2937';
    ctx.lineWidth = selectedProduct === product.id ? 3 : 1;
    
    ctx.fillRect(-width/2, -height/2, width, height);
    ctx.strokeRect(-width/2, -height/2, width, height);

    // Product label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, 0, 4);

    ctx.restore();
  };

  const drawZoomControls = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw zoom controls background
    const controlSize = 40;
    const margin = 20;
    const x = canvas.width - controlSize - margin;
    const yZoomIn = margin;
    const yZoomOut = margin + controlSize + 10;

    // Zoom In button
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, yZoomIn, controlSize, controlSize);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+', x + controlSize/2, yZoomIn + controlSize/2 + 7);

    // Zoom Out button
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, yZoomOut, controlSize, controlSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('−', x + controlSize/2, yZoomOut + controlSize/2 + 7);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x * zoom) / zoom;
    const y = (e.clientY - rect.top - pan.y * zoom) / zoom;
    return { x, y };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Check if clicking on zoom controls
    const controlSize = 40;
    const margin = 20;
    const controlX = canvas.width - controlSize - margin;
    const zoomInY = margin;
    const zoomOutY = margin + controlSize + 10;

    if (rawX >= controlX && rawX <= controlX + controlSize) {
      if (rawY >= zoomInY && rawY <= zoomInY + controlSize) {
        handleZoomIn();
        return;
      }
      if (rawY >= zoomOutY && rawY <= zoomOutY + controlSize) {
        handleZoomOut();
        return;
      }
    }

    const { x, y } = getCanvasCoordinates(e);

    if (isDrawingMode) {
      const snappedPoint = snapToGrid({ x, y });
      setRoomPoints([...roomPoints, snappedPoint]);
      
      if (roomPoints.length > 0) {
        setLastPoint(roomPoints[roomPoints.length - 1]);
        setShowLengthInput(true);
      }
    } else {
      // Check if clicking on a product
      const clickedProduct = placedProducts.find(product => {
        const dx = x - product.position.x;
        const dy = y - product.position.y;
        const width = (product.dimensions.length * scale) / 2;
        const height = (product.dimensions.width * scale) / 2;
        return Math.abs(dx) <= width && Math.abs(dy) <= height;
      });

      setSelectedProduct(clickedProduct ? clickedProduct.id : null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawingMode && roomPoints.length > 0) {
      const { x, y } = getCanvasCoordinates(e);
      const snappedPoint = snapToGrid({ x, y });
      setCurrentDrawingPoint(snappedPoint);
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
        color: productData.color
      };

      setPlacedProducts([...placedProducts, newProduct]);
      toast.success(`${productData.name} placed in floor plan`);
    } catch (error) {
      console.error('Error placing product:', error);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const rotateSelectedProduct = () => {
    if (!selectedProduct) return;

    const updatedProducts = placedProducts.map(product =>
      product.id === selectedProduct
        ? { ...product, rotation: (product.rotation + 90) % 360 }
        : product
    );
    setPlacedProducts(updatedProducts);
  };

  const deleteSelectedProduct = () => {
    if (!selectedProduct) return;

    const updatedProducts = placedProducts.filter(product => product.id !== selectedProduct);
    setPlacedProducts(updatedProducts);
    setSelectedProduct(null);
    toast.success('Product removed from floor plan');
  };

  const clearRoom = () => {
    setRoomPoints([]);
    setShowLengthInput(false);
    setLastPoint(null);
    setCurrentDrawingPoint(null);
    toast.success('Room outline cleared');
  };

  const exportLayout = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'floor-plan.png';
    link.href = canvas.toDataURL();
    link.click();
    
    toast.success('Floor plan exported as PNG');
  };

  const applyLineLength = () => {
    if (!lastPoint || !currentLineLength) return;
    
    const lengthInMm = parseFloat(currentLineLength);
    if (isNaN(lengthInMm)) return;

    const lengthInPixels = (lengthInMm / 1000) * scale; // Convert mm to meters, then to pixels
    
    // For simplicity, extend horizontally
    const newPoint = snapToGrid({
      x: lastPoint.x + lengthInPixels,
      y: lastPoint.y
    });

    const updatedPoints = [...roomPoints];
    updatedPoints[updatedPoints.length - 1] = newPoint;
    setRoomPoints(updatedPoints);
    
    setShowLengthInput(false);
    setCurrentLineLength('');
    setLastPoint(null);
  };

  const handleSendFloorPlan = () => {
    if (!userEmail) {
      toast.error('Please enter your email address');
      return;
    }

    // Here you would integrate with HubSpot or your preferred CRM
    // For now, we'll show a success message
    console.log('Sending floor plan to:', userEmail);
    console.log('Message:', userMessage);
    console.log('Room points:', roomPoints);
    console.log('Placed products:', placedProducts);
    
    toast.success('Floor plan sent successfully! Our team will contact you soon.');
    setShowSendForm(false);
    setUserEmail('');
    setUserMessage('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {selectedProduct && (
            <>
              <Button variant="outline" size="sm" onClick={rotateSelectedProduct}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Rotate
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteSelectedProduct}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={clearRoom}>
            Clear Room
          </Button>
          <Button variant="outline" size="sm" onClick={exportLayout}>
            <Download className="w-4 h-4 mr-2" />
            Export PNG
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowSendForm(true)}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Floor Plan
          </Button>
        </div>
      </div>

      {showLengthInput && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="lineLength">Wall Length (mm):</Label>
              <Input
                id="lineLength"
                type="number"
                value={currentLineLength}
                onChange={(e) => setCurrentLineLength(e.target.value)}
                placeholder="4500"
                className="w-32"
              />
              <Button onClick={applyLineLength}>Apply</Button>
              <Button variant="outline" onClick={() => setShowLengthInput(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showSendForm && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Send Floor Plan to Our Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userEmail">Email Address *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="userMessage">Additional Notes</Label>
                  <Input
                    id="userMessage"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Tell us about your lab requirements..."
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSendFloorPlan} className="bg-black text-white hover:bg-gray-800">
                  Send to Team
                </Button>
                <Button variant="outline" onClick={() => setShowSendForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-300 rounded cursor-crosshair bg-white"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          />
          
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>
              {isDrawingMode 
                ? 'Click to add points to room outline (lines snap to grid)' 
                : 'Drag products from library or click to select'
              }
            </span>
            <span>Products placed: {placedProducts.length} | Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloorPlannerCanvas;
