// src/components/floor-planner/FloorPlanner.tsx
import React, { useState, useCallback } from 'react';
import EnhancedSeriesSelector from '../floorplan/EnhancedSeriesSelector';
// ⬇️ EnhancedCanvasWorkspace is a DEFAULT export — import it like this:
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

  // Canvas settings
  const [currentMode] = useState<DrawingMode>('select');
  const [showGrid] = useState(true);
  const [showMeasurements] = useState(true);
  const [gridSize] = useState(100); // mm
  const [measurementUnit] = useState<MeasurementUnit>('mm');
  const [canvasWidth] = useState(1200);
  const [canvasHeight] = useState(800);

  const handleProductDrag = useCallback((product: any) => {
    // Drag preview handled inside the canvas; keep for logs/debug
    console.log('Product dragged:', product);
  }, []);

  // ⬇️ This is what actually places a product coming from the sidebar
  const handleProductSelect = useCallback((product: PlacedProduct) => {
    setPlacedProducts((prev) => [...prev, product]);
  }, []);

  const handleClearAll = useCallback(() => {
    setRoomPoints([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setWallSegments([]);
    setRooms([]);
  }, []);

  // Room-aware scale: optimized for large laboratory spaces (20x20m support)
  const scale = 0.08; // 0.08 px/mm (≈80 px per meter)

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Product Library</h2>
          <p className="text-sm text-muted-foreground">Drag or click “Add” to place</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <EnhancedSeriesSelector
            onProductDrag={handleProductDrag}
            currentTool="select"
            // ⬇️ Important: pass this so clicking “Add to Floor Plan” works
            onProductSelect={handleProductSelect}
            // Optional: align scaling with your canvas (not required)
            scale={scale}
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <EnhancedCanvasWorkspace
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
        />
      </div>
    </div>
  );
};

export default FloorPlanner;
