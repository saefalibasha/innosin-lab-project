
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Download, Upload, Undo, Redo } from 'lucide-react';
import CanvasDrawingEngine from '@/components/canvas/CanvasDrawingEngine';
import DrawingToolbar from '@/components/floorplan/DrawingToolbar';
import ObjectLibrary from '@/components/ObjectLibrary';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room } from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';

interface FloorPlannerState {
  roomPoints: Point[];
  placedProducts: PlacedProduct[];
  doors: Door[];
  textAnnotations: TextAnnotation[];
  wallSegments: WallSegment[];
  rooms: Room[];
}

const FloorPlanner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<'select' | 'wall' | 'door' | 'room' | 'text' | 'measure' | 'pan' | 'line' | 'freehand' | 'eraser' | 'rotate'>('select');
  
  // Floor plan state
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // History management
  const initialState: FloorPlannerState = {
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: [],
    wallSegments: [],
    rooms: []
  };

  const { saveState, undo, redo, canUndo, canRedo } = useFloorPlanHistory(initialState);

  // Save state to history whenever state changes
  useEffect(() => {
    const currentState: FloorPlannerState = {
      roomPoints,
      placedProducts,
      doors,
      textAnnotations,
      wallSegments,
      rooms
    };
    saveState(currentState);
  }, [roomPoints, placedProducts, doors, textAnnotations, wallSegments, rooms, saveState]);

  const handleProductDrop = (product: any, position: Point) => {
    const newPlacedProduct: PlacedProduct = {
      id: `product-${Date.now()}`,
      productId: product.id,
      name: product.name,
      category: product.category || 'Innosin Lab',
      position,
      rotation: 0,
      dimensions: {
        length: product.dimensions?.length || 500,
        width: product.dimensions?.width || 500,
        height: product.dimensions?.height || 750
      },
      color: '#4caf50'
    };
    setPlacedProducts(prev => [...prev, newPlacedProduct]);
  };

  const handleSave = () => {
    console.log('Saving floor plan...');
  };

  const handleLoad = () => {
    console.log('Loading floor plan...');
  };

  const handleExport = () => {
    console.log('Exporting floor plan...');
  };

  const handleUndo = () => {
    const prevState = undo();
    if (prevState) {
      setRoomPoints(prevState.roomPoints);
      setPlacedProducts(prevState.placedProducts);
      setDoors(prevState.doors);
      setTextAnnotations(prevState.textAnnotations);
      setWallSegments(prevState.wallSegments);
      setRooms(prevState.rooms);
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setRoomPoints(nextState.roomPoints);
      setPlacedProducts(nextState.placedProducts);
      setDoors(nextState.doors);
      setTextAnnotations(nextState.textAnnotations);
      setWallSegments(nextState.wallSegments);
      setRooms(nextState.rooms);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Floor Planner</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={handleUndo} variant="outline" size="sm" disabled={!canUndo}>
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button onClick={handleRedo} variant="outline" size="sm" disabled={!canRedo}>
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </Button>
          <Button onClick={handleSave} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleLoad} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Load
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r bg-muted/10 p-4 overflow-y-auto">
          <div className="space-y-4">
            <DrawingToolbar
              currentTool={currentTool}
              onToolChange={setCurrentTool}
            />
            <ObjectLibrary
              onProductDrag={(product: any) => handleProductDrop(product, { x: 100, y: 100 })}
              currentTool={currentTool}
            />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-white">
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
            currentTool={currentTool}
            scale={1}
            gridSize={20}
            showGrid={true}
            showMeasurements={false}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            onProductDrop={handleProductDrop}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-64 border-l bg-muted/10 p-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Properties</h3>
              <div className="space-y-2 text-sm">
                <div>Tool: {currentTool}</div>
                <div>Walls: {wallSegments.length}</div>
                <div>Rooms: {rooms.length}</div>
                <div>Products: {placedProducts.length}</div>
                <div>Selected: {selectedProducts.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
