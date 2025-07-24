import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Info,
  RotateCcw,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { Point, PlacedProduct, Door, TextAnnotation } from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';
import { useProductUsageTracking } from '@/hooks/useProductUsageTracking';
import SeriesSelector from '@/components/floorplan/SeriesSelector';
import ProductStatistics from '@/components/floorplan/ProductStatistics';
import QuickHelp from '@/components/floorplan/QuickHelp';
import HorizontalToolbar from '@/components/floorplan/HorizontalToolbar';

type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select' | 'interior-wall' | 'door' | 'rotate';

interface FloorPlanState {
  roomPoints: Point[];
  placedProducts: PlacedProduct[];
  doors: Door[];
  textAnnotations: TextAnnotation[];
}

const FloorPlanner = () => {
  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [draggedProduct, setDraggedProduct] = useState<any>(null);
  
  // View state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showProducts, setShowProducts] = useState(true);
  
  // UI state
  const [projectName, setProjectName] = useState('Untitled Floor Plan');
  
  // Usage tracking
  const { trackProductPlacement } = useProductUsageTracking();
  
  // History management
  const initialState: FloorPlanState = {
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: []
  };
  
  const { saveState, undo, redo, canUndo, canRedo } = useFloorPlanHistory(initialState);

  // Larger canvas dimensions
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;
  const GRID_SIZE = 20;

  // Utility functions
  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale
    };
  }, [scale, offset]);

  const snapToGrid = useCallback((point: Point): Point => {
    if (!showGrid) return point;
    return {
      x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(point.y / GRID_SIZE) * GRID_SIZE
    };
  }, [showGrid]);

  // Drawing functions
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  }, [showGrid]);

  const drawRoom = useCallback((ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 2) return;
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    
    ctx.beginPath();
    ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
    
    for (let i = 1; i < roomPoints.length; i++) {
      ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
    }
    
    if (roomPoints.length > 2) {
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.stroke();
  }, [roomPoints]);

  const drawProducts = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showProducts) return;
    
    placedProducts.forEach(product => {
      const isSelected = selectedProducts.includes(product.id);
      
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation);
      
      const width = product.dimensions.length * 100;
      const height = product.dimensions.width * 100;
      
      ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.3)' : product.color || '#6b7280';
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#374151';
      ctx.lineWidth = isSelected ? 2 : 1;
      
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 0, height/2 + 15);
      
      ctx.restore();
    });
  }, [placedProducts, selectedProducts, showProducts]);

  const drawDoors = useCallback((ctx: CanvasRenderingContext2D) => {
    doors.forEach(door => {
      ctx.save();
      ctx.translate(door.position.x, door.position.y);
      ctx.rotate(door.rotation);
      
      const width = door.width * 100;
      
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-width/2, 0);
      ctx.lineTo(width/2, 0);
      ctx.stroke();
      
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(door.swingDirection === 'inward' ? -width/2 : width/2, 0, width, 0, Math.PI/2);
      ctx.stroke();
      
      ctx.restore();
    });
  }, [doors]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(offset.x / scale, offset.y / scale);
    
    drawGrid(ctx);
    drawRoom(ctx);
    drawProducts(ctx);
    drawDoors(ctx);
    
    ctx.restore();
  }, [scale, offset, drawGrid, drawRoom, drawProducts, drawDoors]);

  // Event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = snapToGrid(getCanvasCoordinates(e));
    setIsDrawing(true);
    
    switch (currentTool) {
      case 'wall':
        setRoomPoints(prev => [...prev, point]);
        break;
      case 'select':
        // Handle product selection
        const clickedProduct = placedProducts.find(product => {
          const dx = point.x - product.position.x;
          const dy = point.y - product.position.y;
          const width = product.dimensions.length * 100;
          const height = product.dimensions.width * 100;
          return Math.abs(dx) < width/2 && Math.abs(dy) < height/2;
        });
        
        if (clickedProduct) {
          if (e.ctrlKey || e.metaKey) {
            setSelectedProducts(prev => 
              prev.includes(clickedProduct.id) 
                ? prev.filter(id => id !== clickedProduct.id)
                : [...prev, clickedProduct.id]
            );
          } else {
            setSelectedProducts([clickedProduct.id]);
          }
        } else {
          setSelectedProducts([]);
        }
        break;
      case 'door':
        const newDoor: Door = {
          id: `door-${Date.now()}`,
          position: point,
          rotation: 0,
          width: 0.9, // Default door width in meters
          swingDirection: 'inward',
          wallSegmentId: '',
          wallPosition: 0,
          isEmbedded: false
        };
        setDoors(prev => [...prev, newDoor]);
        break;
    }
  }, [currentTool, getCanvasCoordinates, snapToGrid, placedProducts]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    // Handle mouse move for different tools
  }, [isDrawing, currentTool]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    saveState({
      roomPoints,
      placedProducts,
      doors,
      textAnnotations
    });
  }, [roomPoints, placedProducts, doors, textAnnotations, saveState]);

  const handleProductDrag = useCallback((product: any) => {
    setDraggedProduct(product);
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (!draggedProduct) return;
    
    const point = getCanvasCoordinates(e as any);
    const newProduct: PlacedProduct = {
      ...draggedProduct,
      id: `${draggedProduct.id}-${Date.now()}`,
      position: point,
      rotation: 0,
      scale: 1
    };
    
    setPlacedProducts(prev => [...prev, newProduct]);
    trackProductPlacement(newProduct);
    setDraggedProduct(null);
    toast.success(`Added ${newProduct.name} to floor plan`);
  }, [draggedProduct, getCanvasCoordinates, trackProductPlacement]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  // View controls
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleFitToView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleToggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  // Product management
  const handleDeleteSelected = useCallback(() => {
    setPlacedProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
    setSelectedProducts([]);
    toast.success('Deleted selected products');
  }, [selectedProducts]);

  const handleClearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const handleRotateSelected = useCallback(() => {
    setPlacedProducts(prev => prev.map(product => 
      selectedProducts.includes(product.id)
        ? { ...product, rotation: product.rotation + Math.PI / 2 }
        : product
    ));
  }, [selectedProducts]);

  // File operations
  const handleSave = useCallback(() => {
    const floorPlanData = {
      name: projectName,
      roomPoints,
      placedProducts,
      doors,
      textAnnotations,
      scale,
      offset
    };
    
    const dataStr = JSON.stringify(floorPlanData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/\s+/g, '_')}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Floor plan saved successfully');
  }, [projectName, roomPoints, placedProducts, doors, textAnnotations, scale, offset]);

  const handleLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setProjectName(data.name || 'Loaded Floor Plan');
        setRoomPoints(data.roomPoints || []);
        setPlacedProducts(data.placedProducts || []);
        setDoors(data.doors || []);
        setTextAnnotations(data.textAnnotations || []);
        setScale(data.scale || 1);
        setOffset(data.offset || { x: 0, y: 0 });
        toast.success('Floor plan loaded successfully');
      } catch (error) {
        toast.error('Failed to load floor plan');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleClear = useCallback(() => {
    setRoomPoints([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setSelectedProducts([]);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    toast.success('Floor plan cleared');
  }, []);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      setRoomPoints(previousState.roomPoints);
      setPlacedProducts(previousState.placedProducts);
      setDoors(previousState.doors);
      setTextAnnotations(previousState.textAnnotations);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setRoomPoints(nextState.roomPoints);
      setPlacedProducts(nextState.placedProducts);
      setDoors(nextState.doors);
      setTextAnnotations(nextState.textAnnotations);
    }
  }, [redo]);

  // Render canvas
  useEffect(() => {
    render();
  }, [render]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'a':
            e.preventDefault();
            setSelectedProducts(placedProducts.map(p => p.id));
            break;
        }
      }
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedProducts.length > 0) {
            handleDeleteSelected();
          }
          break;
        case 'r':
          if (selectedProducts.length > 0) {
            handleRotateSelected();
          }
          break;
        case 'Escape':
          setSelectedProducts([]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave, selectedProducts, placedProducts, handleDeleteSelected, handleRotateSelected]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Floor Planner</h1>
              <p className="text-gray-600">Design your laboratory layout with precision</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-64"
                placeholder="Project name"
              />
              <Button onClick={handleSave} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Products: {placedProducts.length}</span>
            <span>Room Points: {roomPoints.length}</span>
            <span>Doors: {doors.length}</span>
            <span>Scale: {Math.round(scale * 100)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <ProductStatistics placedProducts={placedProducts} />
            <SeriesSelector 
              onProductDrag={handleProductDrag}
              currentTool={currentTool}
            />
            <QuickHelp />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4 space-y-4">
            {/* Horizontal Toolbar */}
            <HorizontalToolbar
              currentTool={currentTool}
              onToolChange={setCurrentTool}
              selectedProducts={selectedProducts}
              onClearSelection={handleClearSelection}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFitToView={handleFitToView}
              onToggleGrid={handleToggleGrid}
              showGrid={showGrid}
              scale={scale}
            />

            {/* Large Canvas */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Canvas</CardTitle>
                  
                  {/* Canvas Controls */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <label>
                        <Upload className="h-4 w-4 mr-2" />
                        Load
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleLoad}
                          className="hidden"
                        />
                      </label>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleClear}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onDrop={handleCanvasDrop}
                    onDragOver={handleCanvasDragOver}
                  />
                </div>
                
                {/* Canvas Status */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>Tool: {currentTool}</span>
                  <span>Canvas: {CANVAS_WIDTH} × {CANVAS_HEIGHT}</span>
                  <span>
                    {selectedProducts.length > 0 && `${selectedProducts.length} selected`}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Selection Properties */}
            {selectedProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Selection ({selectedProducts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={handleRotateSelected}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Rotate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </Button>
                  
                  {selectedProducts.length === 1 && (
                    <div className="space-y-2 pt-2 border-t">
                      <span className="text-xs font-medium">Properties:</span>
                      {(() => {
                        const product = placedProducts.find(p => p.id === selectedProducts[0]);
                        if (!product) return null;
                        
                        return (
                          <div className="space-y-1 text-xs">
                            <div><strong>Name:</strong> {product.name}</div>
                            <div><strong>Category:</strong> {product.category}</div>
                            <div><strong>Dimensions:</strong> {product.dimensions.length.toFixed(1)} × {product.dimensions.width.toFixed(1)}m</div>
                            <div><strong>Position:</strong> {product.position.x.toFixed(0)}, {product.position.y.toFixed(0)}</div>
                            <div><strong>Rotation:</strong> {Math.round(product.rotation * 180 / Math.PI)}°</div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
