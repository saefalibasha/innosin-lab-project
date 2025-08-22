import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Info,
  RotateCcw,
  Copy,
  Maximize2,
  Home,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, FloorPlanState, DrawingMode } from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';
import { useProductUsageTracking } from '@/hooks/useProductUsageTracking';
import { formatMeasurement, canvasToMm, mmToCanvas, GRID_SIZES, MeasurementUnit } from '@/utils/measurements';
import SeriesSelector from '@/components/floorplan/SeriesSelector';
import ProductStatistics from '@/components/floorplan/ProductStatistics';
import QuickHelp from '@/components/floorplan/QuickHelp';
import HorizontalToolbar from '@/components/floorplan/HorizontalToolbar';
import EnhancedSeriesSelector from '@/components/floorplan/EnhancedSeriesSelector';
import EnhancedCanvasWorkspace from '@/components/canvas/EnhancedCanvasWorkspace';
import MeasurementInput from '@/components/canvas/MeasurementInput';
import RoomCreator from '@/components/canvas/RoomCreator';
import SegmentedUnitSelector from '@/components/SegmentedUnitSelector';
import ExportModal from '@/components/ExportModal';
import WallEditor from '@/components/floorplan/WallEditor';
import PlacedProductsBar from '@/components/floorplan/PlacedProductsBar';
import { ContactGateModal } from '@/components/ContactGateModal';
import { useAuth } from '@/contexts/AuthContext';

const FloorPlanner = () => {
  const { user, isAdmin, loading } = useAuth();
  
  // Access control state
  const [hasAccess, setHasAccess] = useState(false);
  const [showContactGate, setShowContactGate] = useState(true);
  
  // Check for admin access or existing session
  useEffect(() => {
    const checkAccess = () => {
      console.log('FloorPlanner checkAccess - user:', user?.email, 'isAdmin:', isAdmin, 'loading:', loading);
      
      // Check for existing contact info
      const contactInfo = sessionStorage.getItem('contactInfo');
      console.log('Contact info from session:', contactInfo);
      
      // Admin bypass: if user is logged in as admin
      if (user && isAdmin) {
        console.log('Admin access granted - bypassing contact gate');
        setHasAccess(true);
        setShowContactGate(false);
        return;
      }
      
      // Regular user: check if they provided contact info
      if (contactInfo) {
        console.log('Contact info found - granting access');
        setHasAccess(true);
        setShowContactGate(false);
      } else {
        console.log('No access conditions met - showing contact gate');
      }
    };
    
    checkAccess();
  }, [user, isAdmin, loading]);

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
  const [draggedProduct, setDraggedProduct] = useState<any>(null);
  const [showRoomCreator, setShowRoomCreator] = useState(false);
  const [selectedWall, setSelectedWall] = useState<WallSegment | null>(null);
  
  // Room-aware measurement system with intelligent scaling
  const [scale, setScale] = useState(0.15); // Optimized for room context: 0.15 px/mm = 150px/m
  const [gridSize, setGridSize] = useState(GRID_SIZES.standard);
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showProducts, setShowProducts] = useState(true);
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('mm');
  
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
    wallSegments: [],
    rooms: []
  };
  
  const { saveState, undo, redo, canUndo, canRedo } = useFloorPlanHistory(initialState);

  // Canvas dimensions - Enhanced size for better workspace
  const CANVAS_WIDTH = 1600;
  const CANVAS_HEIGHT = 1000;

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
        ? { ...product, rotation: (product.rotation || 0) + Math.PI / 2 }
        : product
    ));
  }, [selectedProducts]);

  // Wall management handlers
  const handleWallUpdate = useCallback((updatedWall: WallSegment) => {
    setWallSegments(prev => prev.map(wall => 
      wall.id === updatedWall.id ? updatedWall : wall
    ));
    setSelectedWall(updatedWall);
  }, []);

  const handleWallDelete = useCallback((wallId: string) => {
    setWallSegments(prev => prev.filter(wall => wall.id !== wallId));
    setSelectedWall(null);
  }, []);

  // Enhanced view controls
  const handleToggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  const handleToggleMeasurements = useCallback(() => {
    setShowMeasurements(prev => !prev);
  }, []);

  const handleUnitChange = useCallback((unit: MeasurementUnit) => {
    setMeasurementUnit(unit);
  }, []);

  const handleScaleChange = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Room creation
  const handleRoomCreate = useCallback((room: Room) => {
    setRooms(prev => [...prev, room]);
    setRoomPoints(room.points);
    setShowRoomCreator(false);
    toast.success(`Room "${room.name}" created successfully`);
  }, []);

  const handleStartRoomCreation = useCallback(() => {
    setCurrentMode('room');
    setShowRoomCreator(false);
    toast.info('Click on canvas to start drawing room perimeter');
  }, []);

  // Tool change handler
  const handleToolChange = useCallback((tool: string) => {
    setCurrentMode(tool as DrawingMode);
    if (tool === 'room') {
      setShowRoomCreator(true);
    }
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
      rooms,
      scale,
      gridSize,
      measurementUnit,
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
  }, [projectName, roomPoints, placedProducts, doors, textAnnotations, wallSegments, rooms, scale, gridSize, measurementUnit, showGrid, showMeasurements, showProducts]);

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
        setMeasurementUnit(data.measurementUnit || 'mm');
        
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
    setRooms([]);
    setSelectedProducts([]);
    setScale(0.2);
    setGridSize(GRID_SIZES.standard);
    setMeasurementUnit('mm');
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
          setShowRoomCreator(false);
          setCurrentMode('select');
          break;
        case 'F11':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'v':
          setCurrentMode('select');
          break;
        case 'w':
          setCurrentMode('wall');
          break;
        case 'i':
          setCurrentMode('interior-wall');
          break;
        case 'm':
          setCurrentMode('move');
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
  }, [handleUndo, handleRedo, handleSave, selectedProducts, placedProducts, handleDeleteSelected, handleRotateSelected, handleToggleGrid, handleToggleMeasurements, handleToggleFullscreen]);

  // Calculate room area and statistics
  const roomStatistics = useMemo(() => {
    if (rooms.length === 0) return null;
    
    const totalArea = rooms.reduce((sum, room) => sum + room.area, 0);
    const totalPerimeter = rooms.reduce((sum, room) => sum + room.perimeter, 0);
    
    return {
      totalArea,
      totalPerimeter,
      roomCount: rooms.length,
      averageRoomSize: totalArea / rooms.length
    };
  }, [rooms]);

  const handleContactSuccess = useCallback(() => {
    setHasAccess(true);
    setShowContactGate(false);
  }, []);

  const handleContactCancel = useCallback(() => {
    // Redirect to home or show access denied message
    window.location.href = '/';
  }, []);

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background" 
    : "min-h-screen bg-background";

  // Show contact gate modal if no access
  if (!hasAccess) {
    return (
      <>
        <ContactGateModal
          isOpen={showContactGate}
          onSuccess={handleContactSuccess}
          onCancel={handleContactCancel}
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Required</h1>
            <p className="text-muted-foreground">Please provide your contact details to access the Floor Planner.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={containerClass}>
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Enhanced Floor Planner</h1>
              <p className="text-muted-foreground">Design your laboratory layout with room-based precision</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <SegmentedUnitSelector
                selectedUnit={measurementUnit}
                onUnitChange={handleUnitChange}
              />
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
              <ExportModal
                canvasRef={canvasRef}
                roomPoints={roomPoints}
                placedProducts={placedProducts}
              >
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </ExportModal>
              <Button onClick={handleToggleFullscreen} variant="outline">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Stats */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>Rooms: {rooms.length}</span>
            <span>Products: {placedProducts.length}</span>
            <span>Walls: {wallSegments.length}</span>
            <span>Doors: {doors.length}</span>
            <span>Scale: {scale.toFixed(4)} px/mm</span>
            {roomStatistics && (
              <>
                <span>Total Area: {formatMeasurement(roomStatistics.totalArea, measurementUnit, measurementUnit === 'mm' ? 0 : 2)}</span>
                <span>Total Perimeter: {formatMeasurement(roomStatistics.totalPerimeter, measurementUnit, measurementUnit === 'mm' ? 0 : 2)}</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Left Sidebar with Tabs - Made Narrower */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Product Library</h2>
                <p className="text-sm text-muted-foreground">Select products to place on your floor plan</p>
              </div>
              <div className="p-4">
                <EnhancedSeriesSelector
                  onProductDrag={handleProductDrag}
                  currentTool={currentMode}
                  onProductUsed={(productId) => console.log('Product used:', productId)}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Main Content Area - Extended to the left */}
          <div className="lg:col-span-3 space-y-4">
            {/* Placed Products Horizontal Bar */}
            <PlacedProductsBar
              placedProducts={placedProducts}
              selectedProducts={selectedProducts}
              onProductSelect={(productId, multiSelect) => {
                if (multiSelect) {
                  setSelectedProducts(prev => 
                    prev.includes(productId) 
                      ? prev.filter(id => id !== productId)
                      : [...prev, productId]
                  );
                } else {
                  setSelectedProducts([productId]);
                }
              }}
              onDeleteSelected={handleDeleteSelected}
              onRotateSelected={handleRotateSelected}
              onClearSelection={handleClearSelection}
            />
            {/* Enhanced Horizontal Toolbar - Remove Zoom Controls */}
            <HorizontalToolbar
              currentTool={currentMode}
              onToolChange={handleToolChange}
              selectedProducts={selectedProducts}
              onClearSelection={handleClearSelection}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onToggleGrid={handleToggleGrid}
              showGrid={showGrid}
              scale={scale}
              onScaleChange={handleScaleChange}
              doorOrientation={'horizontal'}
              onDoorOrientationChange={(orientation) => {
                console.log('Door orientation changed to:', orientation);
              }}
            />

            {/* Room Creator Modal */}
            {showRoomCreator && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <RoomCreator
                  onRoomCreate={handleRoomCreate}
                  onCancel={() => setShowRoomCreator(false)}
                  scale={scale}
                />
              </div>
            )}

            {/* Enhanced Canvas - Made Smaller */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Canvas - Room-Based Design</CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    {/* Unit Toggle Above Canvas */}
                    <div className="bg-muted rounded-md p-1">
                      <Button
                        variant={measurementUnit === 'mm' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setMeasurementUnit('mm')}
                        className="h-8 px-3 text-xs"
                      >
                        MM
                      </Button>
                      <Button
                        variant={measurementUnit === 'm' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setMeasurementUnit('m')}
                        className="h-8 px-3 text-xs"
                      >
                        M
                      </Button>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {gridSize}mm grid
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {(1/scale).toFixed(2)}mm/px
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Mode: {currentMode}
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
                <div className="w-full h-[700px]">
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
                    rooms={rooms}
                    setRooms={setRooms}
                    scale={scale}
                    currentMode={currentMode}
                    showGrid={showGrid}
                    showMeasurements={showMeasurements}
                    gridSize={gridSize}
                    measurementUnit={measurementUnit}
                    canvasWidth={CANVAS_WIDTH}
                    canvasHeight={CANVAS_HEIGHT}
                    onClearAll={handleClear}
                  />
                  
                  {/* Wall Editor Panel */}
                  {selectedWall && (
                    <WallEditor
                      selectedWall={selectedWall}
                      onWallUpdate={handleWallUpdate}
                      onWallDelete={handleWallDelete}
                      onClose={() => setSelectedWall(null)}
                      scale={scale}
                      measurementUnit={measurementUnit}
                    />
                  )}
                </div>
                
                {/* Enhanced Canvas Status */}
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Mode: {currentMode}</span>
                  <span>Canvas: {CANVAS_WIDTH} × {CANVAS_HEIGHT}</span>
                  <span>Grid: {gridSize}mm</span>
                  <span>Rooms: {rooms.length}</span>
                  <span>
                    {selectedProducts.length > 0 && `${selectedProducts.length} selected`}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Room Information Panel */}
            {rooms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Room Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rooms.map((room, index) => (
                      <div key={room.id} className="border rounded p-3 space-y-2">
                        <div className="font-medium">{room.name}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Area: {formatMeasurement(room.area, measurementUnit, measurementUnit === 'mm' ? 0 : 2)}</div>
                          <div>Perimeter: {formatMeasurement(room.perimeter, measurementUnit, measurementUnit === 'mm' ? 0 : 2)}</div>
                          <div>Points: {room.points.length}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
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
