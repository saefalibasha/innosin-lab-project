
import React, { useState, useCallback } from 'react';
import { FloorPlanState, Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
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

  const [currentTool, setCurrentTool] = useState<DrawingMode>('select');
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

  const updateRoomPoints = useCallback((points: Point[]) => {
    setFloorPlanState(prev => ({ ...prev, roomPoints: points }));
  }, []);

  const updateWallSegments = useCallback((segments: WallSegment[]) => {
    setFloorPlanState(prev => ({ ...prev, wallSegments: segments }));
  }, []);

  const updatePlacedProducts = useCallback((products: PlacedProduct[]) => {
    setFloorPlanState(prev => ({ ...prev, placedProducts: products }));
  }, []);

  const updateDoors = useCallback((doors: Door[]) => {
    setFloorPlanState(prev => ({ ...prev, doors }));
  }, []);

  const updateTextAnnotations = useCallback((annotations: TextAnnotation[]) => {
    setFloorPlanState(prev => ({ ...prev, textAnnotations: annotations }));
  }, []);

  const updateRooms = useCallback((rooms: Room[]) => {
    setFloorPlanState(prev => ({ ...prev, rooms }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Floor Planner</h1>
          <p className="text-gray-600">Design your laboratory layout with precision</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
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
            onClick={() => setCurrentTool('measure')}
            className={`px-4 py-2 rounded text-white ${currentTool === 'measure' ? 'bg-blue-600' : 'bg-gray-500'} hover:bg-blue-700`}
          >
            Measure
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
          <div className="lg:col-span-4">
            <EnhancedCanvasWorkspace
              roomPoints={floorPlanState.roomPoints}
              setRoomPoints={updateRoomPoints}
              wallSegments={floorPlanState.wallSegments}
              setWallSegments={updateWallSegments}
              placedProducts={floorPlanState.placedProducts}
              setPlacedProducts={updatePlacedProducts}
              doors={floorPlanState.doors}
              setDoors={updateDoors}
              textAnnotations={floorPlanState.textAnnotations}
              setTextAnnotations={updateTextAnnotations}
              rooms={floorPlanState.rooms}
              setRooms={updateRooms}
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
        </div>

        {/* Statistics Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Products</h3>
            <p className="text-2xl font-bold text-blue-600">{floorPlanState.placedProducts.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Rooms</h3>
            <p className="text-2xl font-bold text-green-600">{floorPlanState.rooms.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Walls</h3>
            <p className="text-2xl font-bold text-purple-600">{floorPlanState.wallSegments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
