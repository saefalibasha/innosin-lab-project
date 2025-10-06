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
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Point,
  PlacedProduct,
  Door,
  TextAnnotation,
  WallSegment,
  Room,
  FloorPlanState,
  DrawingMode
} from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';
import { useProductUsageTracking } from '@/hooks/useProductUsageTracking';
import { formatMeasurement, canvasToMm, GRID_SIZES, MeasurementUnit } from '@/utils/measurements';
import SeriesSelector from '@/components/floorplan/SeriesSelector';
import FloorPlanner3D from '@/components/floor-planner/FloorPlanner3D';
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
import ProductRotationControl from '@/components/floorplan/ProductRotationControl';
import { ContactGateModal } from '@/components/ContactGateModal';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedCanvasWorkspace3D from '@/components/canvas/EnhancedCanvasWorkspace3D';
import { FloorPlannerOnboarding } from '@/components/floorplan/FloorPlannerOnboarding';
import { AddWorktopButton } from '@/components/canvas/AddWorktopButton';

const FloorPlanner = () => {
  const { user, isAdmin, loading } = useAuth();
  
  // Access control state
  const [hasAccess, setHasAccess] = useState(false);
  const [showContactGate, setShowContactGate] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check for admin access or existing session
  useEffect(() => {
    const checkAccess = () => {
      const hasAccess = sessionStorage.getItem('floorPlannerAccess');
      if (user && isAdmin) {
        setHasAccess(true);
        setShowContactGate(false);
        return;
      }
      if (hasAccess === 'granted') {
        setHasAccess(true);
        setShowContactGate(false);
      }
    };
    checkAccess();
  }, [user, isAdmin, loading]);

  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMode, setCurrentMode] = useState<DrawingMode>('select');

// Define view mode type and state
type ViewMode = '2d' | '3d';
const [viewMode, setViewMode] = useState<ViewMode>('2d');
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

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 3;

  // Room-aware measurement system with intelligent scaling for large rooms
  const [scale, setScale] = useState(0.08); // 0.08 px/mm = 80px/m (supports ~20x20m rooms)
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

  // Canvas dimensions (fixed)
  const CANVAS_WIDTH = 2000;
  const CANVAS_HEIGHT = 1400;

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(MAX_ZOOM, prev * 1.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(MIN_ZOOM, prev / 1.2));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (placedProducts.length === 0 && roomPoints.length === 0) return;
    
    // Calculate bounds of all content
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    [...roomPoints, ...placedProducts.map(p => p.position)].forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
    
    if (minX === Infinity) return;
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const padding = 100; // 100px padding
    
    const scaleX = (window.innerWidth - padding * 2) / contentWidth;
    const scaleY = (window.innerHeight - padding * 2) / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, MAX_ZOOM);
    
    setZoomLevel(newZoom);
    setPanOffset({
      x: -(minX + contentWidth / 2) * newZoom + window.innerWidth / 2,
      y: -(minY + contentHeight / 2) * newZoom + window.innerHeight / 2
    });
  }, [placedProducts, roomPoints]);

  // Mouse wheel zoom handler
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel * (1 + delta)));
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  // Product management — all variant (drawer) picking happens inside EnhancedSeriesSelector now
  const handleProductDrag = useCallback((product: any) => {
    // Expect product to already include selected variant info (e.g., drawerCount, configuration, dimensions, etc.)
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
    toast.success(`Rotated ${selectedProducts.length} product(s)`);
  }, [selectedProducts]);

  const handleRotateCounterClockwise = useCallback(() => {
    setPlacedProducts(prev => prev.map(product => 
      selectedProducts.includes(product.id)
        ? { ...product, rotation: (product.rotation || 0) - Math.PI / 2 }
        : product
    ));
  }, [selectedProducts]);

  const handleRotateToAngle = useCallback((angle: number) => {
    setPlacedProducts(prev => prev.map(product => 
      selectedProducts.includes(product.id)
        ? { ...product, rotation: angle }
        : product
    ));
  }, [selectedProducts]);

  // Wall management handlers
  const handleWallUpdate = useCallback((updatedWall: WallSegment) => {
    setWallSegments(prev => prev.map(wall => 
      wall.id === updatedWall.id ? updatedWall : wall
    ));
    setSelectedWall(updatedWall);
    
    // Save state for undo/redo
    saveState({
      roomPoints,
      placedProducts,
      doors,
      textAnnotations,
      wallSegments: wallSegments.map(wall => 
        wall.id === updatedWall.id ? updatedWall : wall
      ),
      rooms
    });
  }, [wallSegments, roomPoints, placedProducts, doors, textAnnotations, rooms, saveState]);

  const handleWallDelete = useCallback((wallId: string) => {
    setWallSegments(prev => prev.filter(wall => wall.id !== wallId));
    setSelectedWall(null);
  }, []);

  // View controls
  const handleToggleGrid = useCallback(() => setShowGrid(prev => !prev), []);
  const handleToggleMeasurements = useCallback(() => setShowMeasurements(prev => !prev), []);
  const handleUnitChange = useCallback((unit: MeasurementUnit) => setMeasurementUnit(unit), []);
  const handleScaleChange = useCallback((newScale: number) => setScale(newScale), []);
  const handleToggleFullscreen = useCallback(() => setIsFullscreen(prev => !prev), []);

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

  // File operations
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
      } catch {
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
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) handleRedo();
            else handleUndo();
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
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomReset();
            break;
        }
      }
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedProducts.length > 0) handleDeleteSelected();
          break;
        case 'r':
        case 'R':
          if (selectedProducts.length > 0) handleRotateSelected();
          else toast.info('Select products first, then press R to rotate');
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
        case 'v': setCurrentMode('select'); break;
        case 'w': setCurrentMode('wall'); break;
        case 'i': setCurrentMode('interior-wall'); break;
        case 'm': setCurrentMode('move'); break;
        case 'q': setCurrentMode('room'); break;
        case 'd': setCurrentMode('door'); break;
        case 't': setCurrentMode('text'); break;
      }
    };

    const handleWheelEvent = (e: WheelEvent) => handleWheel(e);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheelEvent, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheelEvent);
    };
  }, [
    handleUndo, handleRedo,
    selectedProducts, placedProducts,
    handleDeleteSelected, handleRotateSelected,
    handleToggleGrid, handleToggleMeasurements,
    handleToggleFullscreen, handleZoomIn, handleZoomOut, 
    handleZoomReset, handleWheel
  ]);

  // Room stats
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
    
    // Check if onboarding should be shown
    const hasSeenOnboarding = sessionStorage.getItem('floorPlannerOnboardingShown');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleContactCancel = useCallback(() => {
    window.location.href = '/';
  }, []);

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background" 
    : "min-h-screen bg-background";

  
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

  const handleShowHelp = () => {
    setShowOnboarding(true);
  };

  return (
    <div className={containerClass}>
      {/* Onboarding Modal */}
      <FloorPlannerOnboarding 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Enhanced Floor Planner</h1>
              <p className="text-muted-foreground">Design your laboratory layout with precision snapping and collision detection</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShowHelp}>
                <Info className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-64"
                placeholder="Project name"
              />
              <ExportModal
                canvasRef={canvasRef}
                roomPoints={roomPoints}
                placedProducts={placedProducts}
              >
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </ExportModal>
              <Button onClick={handleToggleFullscreen} variant="outline">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>View: {viewMode.toUpperCase()}</span>
            <span>Rooms: {rooms.length}</span>
            <span>Products: {placedProducts.length}</span>
            <span>Walls: {wallSegments.length}</span>
            <span>Doors: {doors.length}</span>
            <span>Scale: {scale.toFixed(4)} px/mm</span>
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            {roomStatistics && (
              <>
                <span>Total Area: {formatMeasurement(roomStatistics.totalArea, measurementUnit, measurementUnit === 'mm' ? 0 : 2)}</span>
                <span>Total Perimeter: {formatMeasurement(roomStatistics.totalPerimeter, measurementUnit, measurementUnit === 'mm' ? 0 : 2)}</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Sticky with independent scrolling */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 h-[calc(100vh-120px)]">
              <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col">
                <div className="p-4 border-b flex-shrink-0">
                  <h2 className="text-lg font-semibold">Product Library</h2>
                  <p className="text-sm text-muted-foreground">Select products to place on your floor plan</p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <EnhancedSeriesSelector
                    onProductDrag={handleProductDrag}
                    currentTool={currentMode}
                    onProductUsed={(productId) => console.log('Product used:', productId)}
                    existingProducts={placedProducts}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
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

            {viewMode === "2d" && (
              <>
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
                />

                {showRoomCreator && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <RoomCreator
                      onRoomCreate={handleRoomCreate}
                      onCancel={() => setShowRoomCreator(false)}
                      scale={scale}
                    />
                  </div>
                )}

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 bg-muted rounded-md p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= MIN_ZOOM}
                            className="h-8 w-8 p-0"
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <span className="text-xs px-2 min-w-[60px] text-center">
                            {Math.round(zoomLevel * 100)}%
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= MAX_ZOOM}
                            className="h-8 w-8 p-0"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomToFit}
                            className="h-8 px-2 text-xs"
                          >
                            Fit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomReset}
                            className="h-8 px-2 text-xs"
                          >
                            Reset
                          </Button>
                        </div>
                        
                        <div className="bg-muted rounded-md p-1">
                          <Button
                            variant={viewMode === ("2d" as ViewMode) ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("2d" as ViewMode)}
                            className="h-8 px-3 text-xs"
                          >
                            2D
                          </Button>
                          <Button
                            variant={viewMode === ("3d" as ViewMode) ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("3d" as ViewMode)}
                            className="h-8 px-3 text-xs"
                          >
                            3D
                          </Button>
                        </div>
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
                  
                  <CardContent className="pt-6">
                    <div className="w-full h-[700px] relative overflow-hidden">
                      <div 
                        style={{
                          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                          transformOrigin: '0 0',
                          transition: 'transform 0.1s ease-out'
                        }}
                      >
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
                          selectedProducts={selectedProducts}
                          onProductSelect={setSelectedProducts}
                          onWallUpdate={handleWallUpdate}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {viewMode === "3d" && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Canvas - 3D Isometric View</CardTitle>
                    <div className="flex items-center space-x-2">
                      {/* View Mode Toggle */}
                      <div className="bg-muted rounded-md p-1">
                        <Button
                          variant={viewMode === ("2d" as ViewMode) ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("2d" as ViewMode)}
                          className="h-8 px-3 text-xs"
                        >
                          2D
                        </Button>
                        <Button
                          variant={viewMode === ("3d" as ViewMode) ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("3d" as ViewMode)}
                          className="h-8 px-3 text-xs"
                        >
                          3D
                        </Button>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        3D Isometric
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        WebGL Rendering
                      </Badge>
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
                    <EnhancedCanvasWorkspace3D
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
                      selectedProducts={selectedProducts}
                      onProductSelect={setSelectedProducts}
                      onWallUpdate={handleWallUpdate}
                    />
                  </div>
                  
                  {/* 3D Controls Below Canvas */}
                  <div className="mt-4 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* View Controls */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">View Controls</h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Reset View</Button>
                          <Button variant="outline" size="sm">Fit to View</Button>
                        </div>
                      </div>
                      
                      {/* Product Controls */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Product Controls</h3>
                        <div className="flex gap-2 flex-wrap">
                          <AddWorktopButton
                            selectedProducts={selectedProducts}
                            allProducts={placedProducts}
                            onAddWorktop={(worktopData) => {
                              const newWorktop = {
                                ...worktopData,
                                id: worktopData.id || `worktop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                position: worktopData.position || { x: 0, y: 0 },
                                rotation: worktopData.rotation || 0,
                                dimensions: worktopData.dimensions || { length: 0, width: 0, height: 0 },
                                color: worktopData.color || '#8B4513',
                              } as PlacedProduct;
                              setPlacedProducts(prev => [...prev, newWorktop]);
                              setSelectedProducts([]);
                            }}
                            scale={scale}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={selectedProducts.length === 0}
                            onClick={handleRotateSelected}
                          >
                            Rotate Selected
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={selectedProducts.length === 0}
                            onClick={handleDeleteSelected}
                          >
                            Delete Selected
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Scene Statistics */}
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>Products: {placedProducts.length}</span>
                        <span>Walls: {wallSegments.length}</span>
                        <span>Rooms: {rooms.length}</span>
                        <span>Selected: {selectedProducts.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Only show these controls in 2D mode */}
            {viewMode === "2d" && (
              <>
                <ProductRotationControl
                  selectedProducts={selectedProducts}
                  onRotateClockwise={handleRotateSelected}
                  onRotateCounterClockwise={handleRotateCounterClockwise}
                  onRotateToAngle={handleRotateToAngle}
                />
                
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
                        {rooms.map((room) => (
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
                        <Button variant="outline" size="sm" className="flex-1">
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
                                <div>
                                  <strong>Position:</strong> {canvasToMm(product.position.x, scale).toFixed(0)}, {canvasToMm(product.position.y, scale).toFixed(0)}mm
                                </div>
                                <div><strong>Rotation:</strong> {Math.round((product.rotation || 0) * 180 / Math.PI)}°</div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
