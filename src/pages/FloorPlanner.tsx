
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
  Copy,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment } from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';
import { useProductUsageTracking } from '@/hooks/useProductUsageTracking';
import { formatMeasurement, canvasToMm, mmToCanvas, GRID_SIZES } from '@/utils/measurements';
import SeriesSelector from '@/components/floorplan/SeriesSelector';
import ProductStatistics from '@/components/floorplan/ProductStatistics';
import QuickHelp from '@/components/floorplan/QuickHelp';
import HorizontalToolbar from '@/components/floorplan/HorizontalToolbar';
import EnhancedCanvasWorkspace from '@/components/canvas/EnhancedCanvasWorkspace';
import MeasurementInput from '@/components/canvas/MeasurementInput';

type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select' | 'interior-wall' | 'door' | 'rotate';

interface FloorPlanState {
  roomPoints: Point[];
  placedProducts: PlacedProduct[];
  doors: Door[];
  textAnnotations: TextAnnotation[];
  wallSegments: WallSegment[];
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
  const [wallSegments, setWallSegments] = useState<WallSegment[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [draggedProduct, setDraggedProduct] = useState<any>(null);
  
  // Enhanced measurement system
  const [scale, setScale] = useState(0.2); // pixels per mm
  const [gridSize, setGridSize] = useState(GRID_SIZES.standard);
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showProducts, setShowProducts] = useState(true);
  
  // UI state
  const [projectName, setProjectName] = useState('Untitled Floor Plan');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Usage tracking
  const { trackProductPlacement } = useProductUsageTracking();
  
  // History management
  const initialState: FloorPlanState = {
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: [],
    wallSegments: []
  };
  
  const { saveState, undo, redo, canUndo, canRedo } = useFloorPlanHistory(initialState);

  // Canvas dimensions
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // Enhanced product management
  const handleProductDrag = useCallback((product: any) => {
    setDraggedProduct(product);
  }, []);

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

  // Enhanced view controls
  const handleToggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  const handleToggleMeasurements = useCallback(() => {
    setShowMeasurements(prev => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // File operations with mm precision
  const handleSave = useCallback(() => {
    const floorPlanData = {
      name: projectName,
      roomPoints,
      placedProducts,
      doors,
      textAnnotations,
      wallSegments,
      scale,
      gridSize,
      settings: {
        showGrid,
        showMeasurements,
        showProducts
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
  }, [projectName, roomPoints, placedProducts, doors, textAnnotations, wallSegments, scale, gridSize, showGrid, showMeasurements, showProducts]);

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
        setScale(data.scale || 0.2);
        setGridSize(data.gridSize || GRID_SIZES.standard);
        
        if (data.settings) {
          setShowGrid(data.settings.showGrid ?? true);
          setShowMeasurements(data.settings.showMeasurements ?? true);
          setShowProducts(data.settings.showProducts ?? true);
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
    setSelectedProducts([]);
    setScale(0.2);
    setGridSize(GRID_SIZES.standard);
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
    }
  }, [redo]);

  // Enhanced keyboard shortcuts
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
          case 'g':
            e.preventDefault();
            handleToggleGrid();
            break;
          case 'm':
            e.preventDefault();
            handleToggleMeasurements();
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
        case 'F11':
          e.preventDefault();
          handleToggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave, selectedProducts, placedProducts, handleDeleteSelected, handleRotateSelected, handleToggleGrid, handleToggleMeasurements, handleToggleFullscreen]);

  // Calculate room area and statistics
  const roomStatistics = useMemo(() => {
    if (roomPoints.length < 3) return null;
    
    // Calculate area using shoelace formula
    let area = 0;
    for (let i = 0; i < roomPoints.length; i++) {
      const j = (i + 1) % roomPoints.length;
      area += roomPoints[i].x * roomPoints[j].y;
      area -= roomPoints[j].x * roomPoints[i].y;
    }
    area = Math.abs(area) / 2;
    
    // Convert to real-world area (mm²)
    const realArea = canvasToMm(area, scale);
    
    // Calculate perimeter
    let perimeter = 0;
    for (let i = 0; i < roomPoints.length; i++) {
      const j = (i + 1) % roomPoints.length;
      const distance = Math.sqrt(
        Math.pow(roomPoints[j].x - roomPoints[i].x, 2) + 
        Math.pow(roomPoints[j].y - roomPoints[i].y, 2)
      );
      perimeter += canvasToMm(distance, scale);
    }
    
    return {
      area: realArea,
      perimeter,
      points: roomPoints.length
    };
  }, [roomPoints, scale]);

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-gray-50" 
    : "min-h-screen bg-gray-50";

  return (
    <div className={containerClass}>
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhanced Floor Planner</h1>
              <p className="text-gray-600">Design your laboratory layout with millimeter precision</p>
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
          
          {/* Enhanced Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>Products: {placedProducts.length}</span>
            <span>Walls: {wallSegments.length}</span>
            <span>Doors: {doors.length}</span>
            <span>Scale: {scale.toFixed(4)} px/mm</span>
            {roomStatistics && (
              <>
                <span>Area: {formatMeasurement(roomStatistics.area, { unit: 'mm', precision: 0, showUnit: true })}</span>
                <span>Perimeter: {formatMeasurement(roomStatistics.perimeter, { unit: 'mm', precision: 0, showUnit: true })}</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Enhanced Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <ProductStatistics placedProducts={placedProducts} />
            <MeasurementInput
              scale={scale}
              gridSize={gridSize}
              onScaleChange={setScale}
              onGridSizeChange={setGridSize}
              showGrid={showGrid}
              onToggleGrid={handleToggleGrid}
              showMeasurements={showMeasurements}
              onToggleMeasurements={handleToggleMeasurements}
            />
            <SeriesSelector 
              onProductDrag={handleProductDrag}
              currentTool={currentTool}
            />
            <QuickHelp />
          </div>

          {/* Enhanced Main Content Area */}
          <div className="lg:col-span-4 space-y-4">
            {/* Enhanced Horizontal Toolbar */}
            <HorizontalToolbar
              currentTool={currentTool}
              onToolChange={setCurrentTool}
              selectedProducts={selectedProducts}
              onClearSelection={handleClearSelection}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onZoomIn={() => setScale(prev => Math.min(prev * 1.2, 2))}
              onZoomOut={() => setScale(prev => Math.max(prev / 1.2, 0.05))}
              onFitToView={() => setScale(0.2)}
              onToggleGrid={handleToggleGrid}
              showGrid={showGrid}
              scale={scale}
            />

            {/* Enhanced Canvas */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Canvas - Millimeter Precision</CardTitle>
                  
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
                <EnhancedCanvasWorkspace
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
                  scale={scale}
                  currentTool={currentTool}
                  showGrid={showGrid}
                  showMeasurements={showMeasurements}
                  gridSize={gridSize}
                  onClearAll={handleClear}
                />
                
                {/* Enhanced Canvas Status */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>Tool: {currentTool}</span>
                  <span>Canvas: {CANVAS_WIDTH} × {CANVAS_HEIGHT}</span>
                  <span>Grid: {gridSize}mm</span>
                  <span>
                    {selectedProducts.length > 0 && `${selectedProducts.length} selected`}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Enhanced Selection Properties */}
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
                            <div><strong>Dimensions:</strong> {product.dimensions.length}×{product.dimensions.width}mm</div>
                            <div><strong>Position:</strong> {canvasToMm(product.position.x, scale).toFixed(0)}, {canvasToMm(product.position.y, scale).toFixed(0)}mm</div>
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
