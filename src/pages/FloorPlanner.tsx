import React, { useState, useCallback } from 'react';
import { FloorPlanState, Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room } from '@/types/floorPlanTypes';
import ProductPanel from '@/components/ProductPanel';
import WallPanel from '@/components/WallPanel';
import RoomPanel from '@/components/RoomPanel';
import DoorPanel from '@/components/DoorPanel';
import AnnotationPanel from '@/components/AnnotationPanel';
import EnhancedCanvasWorkspace from '@/components/canvas/EnhancedCanvasWorkspace';

const FloorPlanner: React.FC = () => {
  const [floorPlanState, setFloorPlanState] = useState<FloorPlanState>({
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: [],
    wallSegments: [],
    rooms: []
  });

  const [currentTool, setCurrentTool] = useState<string>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<PlacedProduct | null>(null);

  const [scale, setScale] = useState(0.5);
  const [gridSize, setGridSize] = useState(25);

  const handleClearAll = useCallback(() => {
    setFloorPlanState({
      roomPoints: [],
      placedProducts: [],
      doors: [],
      textAnnotations: [],
      wallSegments: [],
      rooms: []
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Floor Planner</h1>
          <p className="text-gray-600">Design your laboratory layout with precision</p>
        </div>

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setCurrentTool('select')}
            className={`px-4 py-2 rounded text-white ${currentTool === 'select' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
          >
            Select
          </button>
          <button
            onClick={() => setCurrentTool('room')}
            className={`px-4 py-2 rounded text-white ${currentTool === 'room' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
          >
            Room
          </button>
          <button
            onClick={() => setCurrentTool('wall')}
            className={`px-4 py-2 rounded text-white ${currentTool === 'wall' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
          >
            Wall
          </button>
          <button
            onClick={() => setCurrentTool('door')}
            className={`px-4 py-2 rounded text-white ${currentTool === 'door' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
          >
            Door
          </button>
          <button
            onClick={() => setCurrentTool('product')}
            className={`px-4 py-2 rounded text-white ${currentTool === 'product' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
          >
            Product
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-700 text-white"
          >
            Clear All
          </button>
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            <span>Show Grid</span>
          </label>
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={showMeasurements}
              onChange={(e) => setShowMeasurements(e.target.checked)}
            />
            <span>Show Measurements</span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <EnhancedCanvasWorkspace
              roomPoints={floorPlanState.roomPoints}
              setRoomPoints={(points) => setFloorPlanState(prev => ({ ...prev, roomPoints: points }))}
              wallSegments={floorPlanState.wallSegments}
              setWallSegments={(segments) => setFloorPlanState(prev => ({ ...prev, wallSegments: segments }))}
              placedProducts={floorPlanState.placedProducts}
              setPlacedProducts={(products) => setFloorPlanState(prev => ({ ...prev, placedProducts: products }))}
              doors={floorPlanState.doors}
              setDoors={(doors) => setFloorPlanState(prev => ({ ...prev, doors }))}
              textAnnotations={floorPlanState.textAnnotations}
              setTextAnnotations={(annotations) => setFloorPlanState(prev => ({ ...prev, textAnnotations: annotations }))}
              rooms={floorPlanState.rooms}
              setRooms={(rooms) => setFloorPlanState(prev => ({ ...prev, rooms: rooms }))}
              scale={scale}
              setScale={setScale}
              currentMode={currentTool}
              showGrid={showGrid}
              showMeasurements={showMeasurements}
              gridSize={gridSize}
              setGridSize={setGridSize}
              onClearAll={handleClearAll}
            />
          </div>

          <div className="lg:col-span-1 flex flex-col space-y-4">
            <ProductPanel
              placedProducts={floorPlanState.placedProducts}
              setPlacedProducts={(products) => setFloorPlanState(prev => ({ ...prev, placedProducts: products }))}
              setSelectedProduct={setSelectedProduct}
            />
            <WallPanel
              wallSegments={floorPlanState.wallSegments}
              setWallSegments={(segments) => setFloorPlanState(prev => ({ ...prev, wallSegments: segments }))}
            />
            <RoomPanel
              rooms={floorPlanState.rooms}
              setRooms={(rooms) => setFloorPlanState(prev => ({ ...prev, rooms: rooms }))}
            />
            <DoorPanel
              doors={floorPlanState.doors}
              setDoors={(doors) => setFloorPlanState(prev => ({ ...prev, doors: doors }))}
            />
            <AnnotationPanel
              textAnnotations={floorPlanState.textAnnotations}
              setTextAnnotations={(annotations) => setFloorPlanState(prev => ({ ...prev, textAnnotations: annotations }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
