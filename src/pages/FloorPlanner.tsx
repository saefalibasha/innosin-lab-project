
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  Plus, 
  Settings, 
  Download, 
  Upload, 
  Ruler, 
  Grid, 
  Eye, 
  RotateCcw, 
  RotateCw, 
  Trash2,
  Square,
  Circle,
  Triangle,
  Zap,
  Target,
  Move,
  MousePointer,
  Pencil,
  DoorOpen,
  Package,
  Maximize,
  Users,
  BarChart3,
  Clock,
  Bookmark,
  Search,
  Filter,
  SortAsc,
  Info,
  CheckCircle
} from 'lucide-react';

import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, FloorPlanState, DrawingMode } from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';
import { useProductUsageTracking } from '@/hooks/useProductUsageTracking';
import ProductDimensionEditor from '@/components/ProductDimensionEditor';
import EnhancedCanvasWorkspace from '@/components/canvas/EnhancedCanvasWorkspace';
import RoomCreator from '@/components/canvas/RoomCreator';

const FloorPlanner: React.FC = () => {
  // Floor plan state
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  
  // UI state
  const [selectedProduct, setSelectedProduct] = useState<PlacedProduct | null>(null);
  const [currentMode, setCurrentMode] = useState<DrawingMode>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [gridSize, setGridSize] = useState(100); // mm
  const [scale, setScale] = useState(1);
  const [units, setUnits] = useState<'mm' | 'cm' | 'm' | 'ft' | 'in'>('mm');
  const [sidebarTab, setSidebarTab] = useState('products');
  const [showRoomCreator, setShowRoomCreator] = useState(false);

  // Initialize floor plan state
  const initialFloorPlanState: FloorPlanState = {
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: [],
    wallSegments: [],
    rooms: []
  };

  // History management
  const { saveState, undo, redo, canUndo, canRedo } = useFloorPlanHistory(initialFloorPlanState);
  
  // Usage tracking
  const { 
    trackProductPlacement, 
    removeProductFromSession, 
    getUsageStats, 
    getSessionProducts,
    currentSession,
    startNewSession
  } = useProductUsageTracking();

  // Initialize session
  useEffect(() => {
    startNewSession('My Floor Plan');
  }, [startNewSession]);

  // Save state on changes
  useEffect(() => {
    const currentState: FloorPlanState = {
      roomPoints,
      placedProducts,
      doors,
      textAnnotations,
      wallSegments,
      rooms
    };
    saveState(currentState);
  }, [roomPoints, placedProducts, doors, textAnnotations, wallSegments, rooms, saveState]);

  // Sample products for testing
  const sampleProducts = [
    {
      id: 'mc-pc-755065',
      productId: 'mc-pc-755065',
      name: 'MC-PC Mobile Cabinet',
      category: 'Mobile Cabinets',
      dimensions: { length: 750, width: 500, height: 650 },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: '#6b7280',
      modelPath: '/products/innosin-mc-pc-755065/MC-PC (755065).glb',
      thumbnail: '/products/innosin-mc-pc-755065/MC-PC (755065).jpg'
    },
    {
      id: 'tcg-pc-754018',
      productId: 'tcg-pc-754018',
      name: 'TCG-PC Tall Cabinet',
      category: 'Tall Cabinets',
      dimensions: { length: 750, width: 400, height: 1800 },
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      color: '#6b7280',
      modelPath: '/products/innosin-tcg-pc-754018/TCG-PC (754018).glb',
      thumbnail: '/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg'
    }
  ];

  // Event handlers
  const handleProductDrop = useCallback((product: PlacedProduct) => {
    const newProduct: PlacedProduct = {
      ...product,
      id: `${product.id}-${Date.now()}`,
      position: { x: 100, y: 100 }
    };
    
    setPlacedProducts(prev => [...prev, newProduct]);
    trackProductPlacement(newProduct);
  }, [trackProductPlacement]);

  const handleProductUpdate = useCallback((updatedProduct: PlacedProduct) => {
    setPlacedProducts(prev => prev.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
  }, []);

  const handleProductDelete = useCallback(() => {
    if (selectedProduct) {
      setPlacedProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      removeProductFromSession(selectedProduct.id);
      setSelectedProduct(null);
    }
  }, [selectedProduct, removeProductFromSession]);

  const handleProductDuplicate = useCallback(() => {
    if (selectedProduct) {
      const duplicatedProduct: PlacedProduct = {
        ...selectedProduct,
        id: `${selectedProduct.id}-duplicate-${Date.now()}`,
        position: {
          x: selectedProduct.position.x + 50,
          y: selectedProduct.position.y + 50
        }
      };
      
      setPlacedProducts(prev => [...prev, duplicatedProduct]);
      trackProductPlacement(duplicatedProduct);
    }
  }, [selectedProduct, trackProductPlacement]);

  const handleClearAll = useCallback(() => {
    setRoomPoints([]);
    setWallSegments([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setRooms([]);
    setSelectedProduct(null);
  }, []);

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

  const handleRoomCreated = useCallback((room: Room) => {
    setRooms(prev => [...prev, room]);
    setShowRoomCreator(false);
  }, []);

  // Get usage statistics
  const usageStats = getUsageStats();
  const sessionProducts = getSessionProducts();

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Floor Planner
          </h1>
        </div>

        <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 m-4">
            <TabsTrigger value="products" className="text-xs">
              <Package className="w-4 h-4 mr-1" />
              Products
            </TabsTrigger>
            <TabsTrigger value="room" className="text-xs">
              <Square className="w-4 h-4 mr-1" />
              Room
            </TabsTrigger>
            <TabsTrigger value="editor" className="text-xs">
              <Settings className="w-4 h-4 mr-1" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">
              <BarChart3 className="w-4 h-4 mr-1" />
              Stats
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="products" className="h-full p-4 pt-0">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Available Products</h3>
                    <Badge variant="outline">{sampleProducts.length}</Badge>
                  </div>
                  
                  <div className="grid gap-2">
                    {sampleProducts.map((product) => (
                      <Card 
                        key={product.id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleProductDrop(product)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.category}</p>
                              <p className="text-xs text-gray-400">
                                {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height}mm
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="room" className="h-full p-4 pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Room Setup</h3>
                  <Button
                    size="sm"
                    onClick={() => setShowRoomCreator(true)}
                    className="text-xs"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Room
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={currentMode === 'room' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentMode('room')}
                      className="text-xs"
                    >
                      <Square className="w-4 h-4 mr-1" />
                      Draw Room
                    </Button>
                    <Button
                      variant={currentMode === 'select' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentMode('select')}
                      className="text-xs"
                    >
                      <MousePointer className="w-4 h-4 mr-1" />
                      Select
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs">Current Rooms</Label>
                    {rooms.length === 0 ? (
                      <p className="text-xs text-gray-500">No rooms created yet</p>
                    ) : (
                      <div className="space-y-2">
                        {rooms.map((room) => (
                          <div key={room.id} className="p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium">{room.name}</div>
                            <div className="text-gray-500">
                              Area: {(room.area / 1000000).toFixed(2)} m²
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="editor" className="h-full p-4 pt-0">
              <ProductDimensionEditor
                selectedProduct={selectedProduct}
                onUpdateProduct={handleProductUpdate}
                onDeleteProduct={handleProductDelete}
                onDuplicateProduct={handleProductDuplicate}
                units={units}
              />
            </TabsContent>

            <TabsContent value="stats" className="h-full p-4 pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Project Statistics</h3>
                  <Badge variant="outline">{placedProducts.length}</Badge>
                </div>

                <div className="grid gap-3">
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-xs text-gray-500">Total Products</div>
                      <div className="text-lg font-semibold">{placedProducts.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3">
                      <div className="text-xs text-gray-500">Rooms Created</div>
                      <div className="text-lg font-semibold">{rooms.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3">
                      <div className="text-xs text-gray-500">Total Floor Area</div>
                      <div className="text-lg font-semibold">
                        {(rooms.reduce((sum, room) => sum + room.area, 0) / 1000000).toFixed(2)} m²
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {sessionProducts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Products in Session</Label>
                    <div className="space-y-1">
                      {sessionProducts.map(({ product, count }) => (
                        <div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                          <span className="truncate">{product.name}</span>
                          <Badge variant="outline" className="text-xs">×{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!canRedo}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center gap-1">
                <Button
                  variant={currentMode === 'select' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentMode('select')}
                >
                  <MousePointer className="w-4 h-4" />
                </Button>
                <Button
                  variant={currentMode === 'room' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentMode('room')}
                >
                  <Square className="w-4 h-4" />
                </Button>
                <Button
                  variant={currentMode === 'wall' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentMode('wall')}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant={currentMode === 'door' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentMode('door')}
                >
                  <DoorOpen className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMeasurements(!showMeasurements)}
              >
                <Ruler className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4">
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
            onClearAll={handleClearAll}
          />
        </div>
      </div>

      {/* Room Creator Modal */}
      {showRoomCreator && (
        <RoomCreator
          onRoomCreated={handleRoomCreated}
          onCancel={() => setShowRoomCreator(false)}
        />
      )}
    </div>
  );
};

export default FloorPlanner;
