import React, { useState, useCallback } from 'react';
import EnhancedSeriesSelector from '../floorplan/EnhancedSeriesSelector';
import EnhancedCanvasWorkspace from '../canvas/EnhancedCanvasWorkspace';
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

export const FloorPlanner: React.FC = () => {
  const initialFloorPlanState = {
    roomPoints: [] as Point[],
    placedProducts: [] as PlacedProduct[],
    doors: [] as Door[],
    textAnnotations: [] as TextAnnotation[],
    wallSegments: [] as WallSegment[],
    rooms: [] as Room[],
  };

  const { saveState, undo, redo, canUndo, canRedo, currentState } =
    useFloorPlanHistory(initialFloorPlanState);

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

  // Canvas settings
  const [currentMode, setCurrentMode] = useState<DrawingMode>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [gridSize, setGridSize] = useState(100); // mm
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('mm');
  const [canvasWidth] = useState(1200);
  const [canvasHeight] = useState(800);

  const handleProductDrag = useCallback((product: any) => {
    // Drag start from the library; placement happens via canvas drop
    // (left here for compatibility with your selector)
    // console.log('Product dragged:', product);
  }, []);

  const handleClearAll = useCallback(() => {
    setRoomPoints([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setWallSegments([]);
    setRooms([]);
  }, []);

  // Room-aware scale: pixels per mm
  const scale = 0.08; // 0.08 px/mm (≈80 px per meter)

  return (
    <div className="h-screen flex">
      {/* Sidebar / Product Library */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Product Library</h2>
          <p className="text-sm text-muted-foreground">
            Drag products to place on canvas
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <EnhancedSeriesSelector
            onProductDrag={handleProductDrag}
            currentTool={currentMode}        // keep the sidebar in sync with the active tool
            onProductUsed={() => { /* no-op for compatibility */ }}
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <EnhancedCanvasWorkspace
          // placement & selection
          placedProducts={placedProducts}
          setPlacedProducts={setPlacedProducts}
          selectedProducts={selectedProducts}
          onProductSelect={setSelectedProducts}
          // room & walls
          roomPoints={roomPoints}
          setRoomPoints={setRoomPoints}
          wallSegments={wallSegments}
          setWallSegments={setWallSegments}
          rooms={rooms}
          setRooms={setRooms}
          // doors & annotations
          doors={doors}
          setDoors={setDoors}
          textAnnotations={textAnnotations}
          setTextAnnotations={setTextAnnotations}
          // canvas config
          scale={scale}
          currentMode={currentMode}
          showGrid={showGrid}
          showMeasurements={showMeasurements}
          gridSize={gridSize}
          measurementUnit={measurementUnit}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          // actions
          onClearAll={handleClearAll}
        />
      </div>
    </div>
  );
};

export default FloorPlanner;
