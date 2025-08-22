
import React, { useState, useCallback } from 'react';
import EnhancedSeriesSelector from '../floorplan/EnhancedSeriesSelector';
import { EnhancedCanvasWorkspace } from '../canvas/EnhancedCanvasWorkspace';
import { PlacedProduct, Point, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';
import { MeasurementUnit } from '@/utils/measurements';

export const FloorPlanner = () => {
  const initialFloorPlanState = {
    roomPoints: [] as Point[],
    placedProducts: [] as PlacedProduct[],
    doors: [] as Door[],
    textAnnotations: [] as TextAnnotation[],
    wallSegments: [] as WallSegment[],
    rooms: [] as Room[]
  };

  const {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState
  } = useFloorPlanHistory(initialFloorPlanState);

  const [roomPoints, setRoomPoints] = useState<Point[]>(currentState.roomPoints);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>(currentState.placedProducts);
  const [doors, setDoors] = useState<Door[]>(currentState.doors);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>(currentState.textAnnotations);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>(currentState.wallSegments);
  const [rooms, setRooms] = useState<Room[]>(currentState.rooms);

  // Canvas settings
  const [currentMode, setCurrentMode] = useState<DrawingMode>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [gridSize, setGridSize] = useState(100); // in mm
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('mm');
  const [canvasWidth] = useState(1200);
  const [canvasHeight] = useState(800);

  const handleProductDrag = useCallback((product: any) => {
    // This will be handled by the canvas workspace
    console.log('Product dragged:', product);
  }, []);

  const handleProductSelect = useCallback((product: PlacedProduct) => {
    setPlacedProducts(prevProducts => [...prevProducts, product]);
  }, []);

  const handleClearAll = useCallback(() => {
    setRoomPoints([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setWallSegments([]);
    setRooms([]);
  }, []);

  // Room-aware scale: optimized for laboratory spaces
  const scale = 0.15; // 0.15 pixels per mm (150 pixels per meter)

  return (
    <div className="h-screen flex">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Product Library</h2>
          <p className="text-sm text-muted-foreground">Drag products to place on canvas</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <EnhancedSeriesSelector
            onProductDrag={handleProductDrag}
            currentTool="select"
          />
        </div>
      </div>
      <div className="flex-1 relative">
        <EnhancedCanvasWorkspace
          placedProducts={placedProducts}
          setPlacedProducts={setPlacedProducts}
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
        />
      </div>
    </div>
  );
};
