import React, { useState } from 'react';
import { ProductSidebar } from '@/components/ProductSidebar';
import { SettingsSidebar } from '@/components/SettingsSidebar';
import { Toolbar } from '@/components/Toolbar';
import { EnhancedCanvasWorkspace } from '@/components/canvas/EnhancedCanvasWorkspace';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';

const FloorPlanner: React.FC = () => {
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [scale, setScale] = useState<number>(1);
  const [currentTool, setCurrentTool] = useState<DrawingMode>('select');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMeasurements, setShowMeasurements] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(100);

  const handleClearAll = () => {
    setRoomPoints([]);
    setWallSegments([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setRooms([]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white p-4 border-b">
        <h1 className="text-2xl font-semibold">Floor Planner</h1>
      </header>

      <div className="flex-1 flex">
        <ProductSidebar placedProducts={placedProducts} setPlacedProducts={setPlacedProducts} />

        <div className="flex-1 flex flex-col">
          <Toolbar
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            onClear={handleClearAll}
          />

          <div className="flex-1 relative">
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
              currentMode={currentTool}
              showGrid={showGrid}
              showMeasurements={showMeasurements}
              gridSize={gridSize}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        <SettingsSidebar
          scale={scale}
          setScale={setScale}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showMeasurements={showMeasurements}
          setShowMeasurements={setShowMeasurements}
          gridSize={gridSize}
          setGridSize={setGridSize}
        />
      </div>
    </div>
  );
};

export default FloorPlanner;
