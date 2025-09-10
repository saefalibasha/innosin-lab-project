import React, { useState, useCallback, useEffect } from 'react';
import EnhancedSeriesSelector from '../floorplan/EnhancedSeriesSelector';
import EnhancedCanvasWorkspace3D from '../canvas/EnhancedCanvasWorkspace3D';

import {
  PlacedProduct,
  Point,
  Door,
  TextAnnotation,
  WallSegment,
  Room,
  DrawingMode,
} from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';
import { MeasurementUnit } from '@/utils/measurements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WallControlPanel } from '@/components/ui/WallControlPanel';

export const FloorPlanner3D = () => {
  const initialFloorPlanState = {
    roomPoints: [] as Point[],
    placedProducts: [] as PlacedProduct[],
    doors: [] as Door[],
    textAnnotations: [] as TextAnnotation[],
    wallSegments: [] as WallSegment[],
    rooms: [] as Room[],
  };

  const { currentState } = useFloorPlanHistory(initialFloorPlanState);

  const [roomPoints, setRoomPoints] = useState<Point[]>(currentState.roomPoints);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>(
    currentState.placedProducts
  );
  const [doors, setDoors] = useState<Door[]>(currentState.doors);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>(
    currentState.textAnnotations
  );
  const [wallSegments, setWallSegments] = useState<WallSegment[]>(
    currentState.wallSegments
  );
  const [rooms, setRooms] = useState<Room[]>(currentState.rooms);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedWall, setSelectedWall] = useState<WallSegment | null>(null);

  // ✅ Add a console.log to inspect wall segments on demand
  const handleLogWalls = () => {
    console.log('✅ Current Wall Segments:', wallSegments);
  };

  // Canvas settings
  const [currentMode] = useState<DrawingMode>('select');
  const [showGrid] = useState(true);
  const [showMeasurements] = useState(true);
  const [gridSize] = useState(100); // mm
  const [measurementUnit] = useState<MeasurementUnit>('mm');

  const [canvasWidth] = useState(1200);
  const [canvasHeight] = useState(800);
  const scale = 0.08; // 80 px per meter

  const handleProductDrag = useCallback((product: any) => {
    console.log('Product dragged:', product);
  }, []);

  const handleClearAll = useCallback(() => {
    setRoomPoints([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setWallSegments([]);
    setRooms([]);
    setSelectedProducts([]);
    setSelectedWall(null);
  }, []);

  const handleWallUpdate = (wallId: string, updates: Partial<WallSegment>) => {
    setWallSegments(prev => prev.map(wall => 
      wall.id === wallId ? { ...wall, ...updates } : wall
    ));
  };

  const handleWallSelect = (wallId: string) => {
    const wall = wallSegments.find(w => w.id === wallId);
    setSelectedWall(wall || null);
  };

  const handleWallVisibilityToggle = (wallId: string) => {
    setWallSegments(prev => prev.map(wall => 
      wall.id === wallId ? { ...wall, visible: wall.visible !== false ? false : true } : wall
    ));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Main content area with sidebar and canvas */}
      <div className="flex-1 flex">
        {/* Left sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Product Library</h2>
            <p className="text-sm text-muted-foreground">
              Drag products to place on canvas
            </p>
            <Badge variant="outline" className="mt-2">3D Isometric View</Badge>
          </div>
          <div className="flex-1 overflow-hidden">
            <EnhancedSeriesSelector
              onProductDrag={handleProductDrag}
              currentTool="select"
            />
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative">
          <div className="w-full h-full">
            <EnhancedCanvasWorkspace3D
              placedProducts={placedProducts}
              setPlacedProducts={setPlacedProducts}
              selectedProducts={selectedProducts}
              onProductSelect={setSelectedProducts}
              roomPoints={roomPoints}
              setRoomPoints={setRoomPoints}
              doors={doors}
              setDoors={setDoors}
              textAnnotations={textAnnotations}
              setTextAnnotations={setTextAnnotations}
              wallSegments={wallSegments}
              setWallSegments={setWallSegments}
              rooms={rooms}
              setRooms={setRooms}
              scale={scale}
              currentMode={currentMode}
              showGrid={showGrid}
              showMeasurements={showMeasurements}
              gridSize={gridSize}
              measurementUnit={measurementUnit}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              onClearAll={handleClearAll}
              onWallSelect={handleWallSelect}
            />
          </div>
        </div>
      </div>

      {/* Clean UI Controls */}
      <div className="border-t bg-background">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={selectedProducts.length === 0}>
                Rotate Selected
              </Button>
              <Button variant="outline" size="sm" disabled={selectedProducts.length === 0}>
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner3D;
