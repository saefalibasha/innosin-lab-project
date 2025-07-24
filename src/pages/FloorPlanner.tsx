
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Download, 
  Upload, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Ruler,
  RotateCcw,
  Move3D,
  Maximize2,
  Settings,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  FloorPlanState, 
  Point, 
  PlacedProduct, 
  Door, 
  TextAnnotation, 
  WallSegment, 
  Room,
  DrawingTool
} from '@/types/floorPlanTypes';

import EnhancedCanvasWorkspace from '@/components/canvas/EnhancedCanvasWorkspace';
import HorizontalToolbar from '@/components/floorplan/HorizontalToolbar';
import EnhancedProductLibrary from '@/components/floorplan/EnhancedProductLibrary';
import CompactToolPanel from '@/components/CompactToolPanel';
import ToolPanel from '@/components/ToolPanel';

// Sample products data
const SAMPLE_PRODUCTS = [
  {
    id: 'cabinet-1',
    name: 'Laboratory Cabinet',
    category: 'storage',
    dimensions: { length: 600, width: 400, height: 800 },
    color: '#8B4513',
    price: 299.99,
    description: 'Standard laboratory storage cabinet',
    thumbnail: '/api/placeholder/150/150'
  },
  {
    id: 'workbench-1',
    name: 'Lab Workbench',
    category: 'furniture',
    dimensions: { length: 1200, width: 600, height: 900 },
    color: '#2F4F4F',
    price: 799.99,
    description: 'Heavy-duty laboratory workbench',
    thumbnail: '/api/placeholder/150/150'
  },
  {
    id: 'fume-hood-1',
    name: 'Fume Hood',
    category: 'equipment',
    dimensions: { length: 1500, width: 800, height: 2100 },
    color: '#4682B4',
    price: 2499.99,
    description: 'Professional laboratory fume hood',
    thumbnail: '/api/placeholder/150/150'
  }
];

const FloorPlanner: React.FC = () => {
  // Core state
  const [floorPlan, setFloorPlan] = useState<FloorPlanState>({
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: [],
    wallSegments: [],
    rooms: []
  });

  // UI state
  const [currentTool, setCurrentTool] = useState<DrawingTool>('select');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showRuler, setShowRuler] = useState(false);
  const [scale, setScale] = useState(1);
  const [gridSize, setGridSize] = useState(500); // 500mm grid
  const [isDrawingActive, setIsDrawingActive] = useState(false);

  // History state
  const [history, setHistory] = useState<FloorPlanState[]>([floorPlan]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // History management
  const addToHistory = useCallback((newState: FloorPlanState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFloorPlan(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFloorPlan(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Tool handlers
  const handleToolChange = useCallback((tool: DrawingTool) => {
    setCurrentTool(tool);
    setIsDrawingActive(tool === 'wall' || tool === 'room');
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const handleFitToView = useCallback(() => {
    setScale(1);
    toast.success('View reset to fit');
  }, []);

  const handleToggleGrid = useCallback(() => {
    setShowGrid(!showGrid);
  }, [showGrid]);

  const handleToggleRuler = useCallback(() => {
    setShowRuler(!showRuler);
  }, [showRuler]);

  const handleZoomIn = useCallback(() => {
    setScale(Math.min(scale * 1.2, 5));
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    setScale(Math.max(scale / 1.2, 0.1));
  }, [scale]);

  const handleFinishShape = useCallback(() => {
    setIsDrawingActive(false);
    setCurrentTool('select');
    toast.success('Shape completed');
  }, []);

  const handleClearAll = useCallback(() => {
    const newState: FloorPlanState = {
      roomPoints: [],
      placedProducts: [],
      doors: [],
      textAnnotations: [],
      wallSegments: [],
      rooms: []
    };
    setFloorPlan(newState);
    addToHistory(newState);
    setSelectedProducts([]);
    toast.success('Floor plan cleared');
  }, [addToHistory]);

  // State updaters
  const updateRoomPoints = useCallback((points: Point[]) => {
    const newState = { ...floorPlan, roomPoints: points };
    setFloorPlan(newState);
    addToHistory(newState);
  }, [floorPlan, addToHistory]);

  const updateWallSegments = useCallback((segments: WallSegment[]) => {
    const newState = { ...floorPlan, wallSegments: segments };
    setFloorPlan(newState);
    addToHistory(newState);
  }, [floorPlan, addToHistory]);

  const updatePlacedProducts = useCallback((products: PlacedProduct[]) => {
    const newState = { ...floorPlan, placedProducts: products };
    setFloorPlan(newState);
    addToHistory(newState);
  }, [floorPlan, addToHistory]);

  const updateDoors = useCallback((doors: Door[]) => {
    const newState = { ...floorPlan, doors: doors };
    setFloorPlan(newState);
    addToHistory(newState);
  }, [floorPlan, addToHistory]);

  const updateTextAnnotations = useCallback((annotations: TextAnnotation[]) => {
    const newState = { ...floorPlan, textAnnotations: annotations };
    setFloorPlan(newState);
    addToHistory(newState);
  }, [floorPlan, addToHistory]);

  const updateRooms = useCallback((rooms: Room[]) => {
    const newState = { ...floorPlan, rooms: rooms };
    setFloorPlan(newState);
    addToHistory(newState);
  }, [floorPlan, addToHistory]);

  // File operations
  const handleSave = useCallback(() => {
    const data = JSON.stringify(floorPlan, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'floor-plan.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Floor plan saved');
  }, [floorPlan]);

  const handleLoad = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setFloorPlan(data);
          addToHistory(data);
          toast.success('Floor plan loaded');
        } catch (error) {
          toast.error('Error loading floor plan');
        }
      };
      reader.readAsText(file);
    }
  }, [addToHistory]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Floor Planner</h1>
            <Badge variant="outline" className="text-xs">
              v2.0
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleLoad}
              className="hidden"
              id="load-file"
            />
            <Button variant="outline" size="sm" onClick={() => document.getElementById('load-file')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Load
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Tools & Library */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-white border-r border-gray-200 flex flex-col">
              <Tabs defaultValue="tools" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 m-2">
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="library">Library</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tools" className="flex-1 p-2">
                  <ToolPanel
                    currentTool={currentTool}
                    onToolChange={handleToolChange}
                    showGrid={showGrid}
                    onToggleGrid={handleToggleGrid}
                    showRuler={showRuler}
                    onToggleRuler={handleToggleRuler}
                    onClear={handleClearAll}
                    isDrawingActive={isDrawingActive}
                    onFinishShape={handleFinishShape}
                  />
                </TabsContent>
                
                <TabsContent value="library" className="flex-1 p-2">
                  <EnhancedProductLibrary
                    products={SAMPLE_PRODUCTS}
                    onProductSelect={(product) => {
                      // Handle product selection
                      console.log('Product selected:', product);
                    }}
                    currentTool={currentTool}
                    onToolChange={handleToolChange}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel - Canvas */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full bg-white flex flex-col">
              {/* Toolbar */}
              <div className="p-3 border-b border-gray-200">
                <HorizontalToolbar
                  currentTool={currentTool}
                  onToolChange={handleToolChange}
                  selectedProducts={selectedProducts}
                  onClearSelection={handleClearSelection}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onFitToView={handleFitToView}
                  onToggleGrid={handleToggleGrid}
                  showGrid={showGrid}
                  scale={scale}
                />
              </div>

              {/* Canvas */}
              <div className="flex-1 p-4 overflow-hidden">
                <EnhancedCanvasWorkspace
                  roomPoints={floorPlan.roomPoints}
                  setRoomPoints={updateRoomPoints}
                  wallSegments={floorPlan.wallSegments}
                  setWallSegments={updateWallSegments}
                  placedProducts={floorPlan.placedProducts}
                  setPlacedProducts={updatePlacedProducts}
                  doors={floorPlan.doors}
                  setDoors={updateDoors}
                  textAnnotations={floorPlan.textAnnotations}
                  setTextAnnotations={updateTextAnnotations}
                  rooms={floorPlan.rooms}
                  setRooms={updateRooms}
                  scale={scale}
                  currentMode={currentTool}
                  showGrid={showGrid}
                  showMeasurements={showMeasurements}
                  gridSize={gridSize}
                  onClearAll={handleClearAll}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - Properties */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-white border-l border-gray-200">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Properties</h3>
              </div>
              
              <div className="p-3 space-y-4">
                {/* Grid Settings */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Grid Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Show Grid</span>
                      <Button
                        variant={showGrid ? "default" : "outline"}
                        size="sm"
                        onClick={handleToggleGrid}
                      >
                        <Grid className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Grid Size</span>
                      <span className="text-xs font-mono">{gridSize}mm</span>
                    </div>
                  </CardContent>
                </Card>

                {/* View Settings */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">View Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Zoom</span>
                      <span className="text-xs font-mono">{Math.round(scale * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Measurements</span>
                      <Button
                        variant={showMeasurements ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowMeasurements(!showMeasurements)}
                      >
                        <Ruler className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Selection Info */}
                {selectedProducts.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Items</span>
                          <Badge variant="outline" className="text-xs">
                            {selectedProducts.length}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearSelection}
                          className="w-full"
                        >
                          Clear Selection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default FloorPlanner;
