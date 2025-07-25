
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Download, 
  Upload, 
  Maximize2,
  Info,
  Copy,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, FloorPlanState, DrawingMode } from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';
import { formatMeasurement, canvasToMm, mmToCanvas, GRID_SIZES, parseDimensionString } from '@/utils/measurements';
import { Product } from '@/types/product';
import CanvasDrawingEngine from '@/components/canvas/CanvasDrawingEngine';
import ProductLibrary from '@/components/floorplan/ProductLibrary';
import DrawingToolbar from '@/components/floorplan/DrawingToolbar';

const FloorPlanner = () => {
  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMode, setCurrentMode] = useState<DrawingMode>('select');
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
  
  // Settings
  const [scale, setScale] = useState(0.2); // pixels per mm
  const [gridSize, setGridSize] = useState(GRID_SIZES.standard);
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  
  // UI state
  const [projectName, setProjectName] = useState('New Floor Plan');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // History management
  const initialState: FloorPlanState = {
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: [],
    wallSegments: [],
    rooms: []
  };
  
  const { saveState, undo, redo, canUndo, canRedo } = useFloorPlanHistory(initialState);

  // Product drag handler
  const handleProductDrag = useCallback((product: Product) => {
    setDraggedProduct(product);
    console.log('Product dragged:', product.name);
  }, []);

  // Product drop handler
  const handleProductDrop = useCallback((product: Product, position: Point) => {
    console.log('Product dropped:', product.name, 'at position:', position);
    
    // Parse dimensions from the product
    const dimensions = parseDimensionString(product.dimensions);
    if (!dimensions) {
      toast.error('Invalid product dimensions');
      return;
    }

    const newProduct: PlacedProduct = {
      id: `product-${Date.now()}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      position: position,
      rotation: 0,
      dimensions: {
        length: dimensions.width,
        width: dimensions.depth,
        height: dimensions.height
      },
      color: '#4caf50',
      scale: 1,
      modelPath: product.modelPath,
      thumbnail: product.thumbnail,
      description: product.description,
      specifications: product.specifications
    };

    setPlacedProducts(prev => [...prev, newProduct]);
    setDraggedProduct(null);
    
    // Save state for undo/redo
    const newState = {
      roomPoints,
      placedProducts: [...placedProducts, newProduct],
      doors,
      textAnnotations,
      wallSegments,
      rooms
    };
    saveState(newState);
    
    toast.success(`${product.name} placed on canvas`);
  }, [roomPoints, placedProducts, doors, textAnnotations, wallSegments, rooms, saveState]);

  // Tool change handler
  const handleModeChange = useCallback((mode: DrawingMode) => {
    setCurrentMode(mode);
    setSelectedProducts([]);
    console.log('Mode changed to:', mode);
  }, []);

  // View controls
  const handleToggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  const handleToggleMeasurements = useCallback(() => {
    setShowMeasurements(prev => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Selected product actions
  const handleDeleteSelected = useCallback(() => {
    if (selectedProducts.length === 0) return;
    
    setPlacedProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
    setSelectedProducts([]);
    
    // Save state for undo/redo
    const newState = {
      roomPoints,
      placedProducts: placedProducts.filter(product => !selectedProducts.includes(product.id)),
      doors,
      textAnnotations,
      wallSegments,
      rooms
    };
    saveState(newState);
    
    toast.success(`${selectedProducts.length} product(s) deleted`);
  }, [selectedProducts, roomPoints, placedProducts, doors, textAnnotations, wallSegments, rooms, saveState]);

  const handleRotateSelected = useCallback(() => {
    if (selectedProducts.length === 0) return;
    
    setPlacedProducts(prev => prev.map(product => 
      selectedProducts.includes(product.id)
        ? { ...product, rotation: product.rotation + Math.PI / 2 }
        : product
    ));
    
    toast.success(`${selectedProducts.length} product(s) rotated`);
  }, [selectedProducts]);

  const handleCopySelected = useCallback(() => {
    if (selectedProducts.length === 0) return;
    
    const productsToCopy = placedProducts.filter(product => selectedProducts.includes(product.id));
    const copiedProducts = productsToCopy.map(product => ({
      ...product,
      id: `product-${Date.now()}-${Math.random()}`,
      position: { x: product.position.x + 50, y: product.position.y + 50 }
    }));
    
    setPlacedProducts(prev => [...prev, ...copiedProducts]);
    setSelectedProducts(copiedProducts.map(p => p.id));
    
    toast.success(`${productsToCopy.length} product(s) copied`);
  }, [selectedProducts, placedProducts]);

  // File operations
  const handleSave = useCallback(() => {
    const floorPlanData = {
      name: projectName,
      roomPoints,
      placedProducts,
      doors,
      textAnnotations,
      wallSegments,
      rooms,
      scale,
      gridSize,
      settings: {
        showGrid,
        showMeasurements
      }
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
  }, [projectName, roomPoints, placedProducts, doors, textAnnotations, wallSegments, rooms, scale, gridSize, showGrid, showMeasurements]);

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
        setWallSegments(data.wallSegments || []);
        setRooms(data.rooms || []);
        setScale(data.scale || 0.2);
        setGridSize(data.gridSize || GRID_SIZES.standard);
        
        if (data.settings) {
          setShowGrid(data.settings.showGrid ?? true);
          setShowMeasurements(data.settings.showMeasurements ?? true);
        }
        
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
    setWallSegments([]);
    setRooms([]);
    setSelectedProducts([]);
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
      setWallSegments(previousState.wallSegments);
      setRooms(previousState.rooms);
      toast.success('Undo successful');
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setRoomPoints(nextState.roomPoints);
      setPlacedProducts(nextState.placedProducts);
      setDoors(nextState.doors);
      setTextAnnotations(nextState.textAnnotations);
      setWallSegments(nextState.wallSegments);
      setRooms(nextState.rooms);
      toast.success('Redo successful');
    }
  }, [redo]);

  // Keyboard shortcuts
  React.useEffect(() => {
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
        case 'v':
          setCurrentMode('select');
          break;
        case 'w':
          setCurrentMode('wall');
          break;
        case 'q':
          setCurrentMode('room');
          break;
        case 'd':
          setCurrentMode('door');
          break;
        case 't':
          setCurrentMode('text');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave, selectedProducts, placedProducts, handleDeleteSelected, handleRotateSelected]);

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background" 
    : "min-h-screen bg-background";

  return (
    <div className={containerClass}>
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Floor Planner</h1>
              <p className="text-muted-foreground">Design your laboratory layout with precision</p>
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
              <Button onClick={handleToggleFullscreen} variant="outline">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>Mode: {currentMode}</span>
            <span>Products: {placedProducts.length}</span>
            <span>Rooms: {rooms.length}</span>
            <span>Walls: {wallSegments.length}</span>
            <span>Doors: {doors.length}</span>
            <span>Scale: {scale.toFixed(4)} px/mm</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-4">
            <DrawingToolbar
              currentMode={currentMode}
              onModeChange={handleModeChange}
              showGrid={showGrid}
              onToggleGrid={handleToggleGrid}
              showMeasurements={showMeasurements}
              onToggleMeasurements={handleToggleMeasurements}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onClear={handleClear}
            />
            
            <ProductLibrary onProductDrag={handleProductDrag} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Canvas */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Canvas</CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {gridSize}mm grid
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {(1/scale).toFixed(2)}mm/px
                    </Badge>
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
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="w-full h-[600px] border rounded-lg overflow-hidden">
                  <CanvasDrawingEngine
                    canvasRef={canvasRef}
                    roomPoints={roomPoints}
                    setRoomPoints={setRoomPoints}
                    wallSegments={wallSegments}
                    setWallSegments={setWallSegments}
                    placedProducts={placedProducts}
                    setPlacedProducts={setPlacedProducts}
                    doors={doors}
                    setDoors={setDoors}
                    textAnnotations={textAnnotations}
                    setTextAnnotations={setTextAnnotations}
                    rooms={rooms}
                    setRooms={setRooms}
                    currentMode={currentMode}
                    scale={scale}
                    gridSize={gridSize}
                    showGrid={showGrid}
                    showMeasurements={showMeasurements}
                    selectedProducts={selectedProducts}
                    setSelectedProducts={setSelectedProducts}
                    onProductDrop={handleProductDrop}
                  />
                </div>
                
                {/* Canvas Status */}
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Canvas: 1000 × 600 pixels</span>
                  <span>Grid: {gridSize}mm</span>
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
                      onClick={handleCopySelected}
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
