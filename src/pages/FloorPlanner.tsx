
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductSidebar from '@/components/ProductSidebar';
import Toolbar from '@/components/Toolbar';
import SettingsSidebar from '@/components/SettingsSidebar';
import { initialProducts } from '@/data/products';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import EnhancedCanvasWorkspace from '@/components/canvas/EnhancedCanvasWorkspace';
import FloorPlannerCanvas from '@/components/FloorPlannerCanvas';
import WallThicknessControl from '@/components/canvas/WallThicknessControl';

const FloorPlanner = () => {
  // State management
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentMode, setCurrentMode] = useState<DrawingMode>('select');
  const [scale, setScale] = useState(0.1);
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [wallThickness, setWallThickness] = useState(100);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [gridSize, setGridSize] = useState(20);

  // History management
  const initialState = {
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: [],
    wallSegments: [],
    rooms: []
  };

  const {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState
  } = useFloorPlanHistory(initialState);

  // Auto-save state changes
  useEffect(() => {
    const state = {
      roomPoints,
      placedProducts,
      doors,
      textAnnotations,
      wallSegments,
      rooms
    };
    saveState(state);
  }, [roomPoints, placedProducts, doors, textAnnotations, wallSegments, rooms, saveState]);

  const handleClearAll = () => {
    setRoomPoints([]);
    setWallSegments([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setRooms([]);
  };

  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      setRoomPoints(previousState.roomPoints);
      setPlacedProducts(previousState.placedProducts);
      setDoors(previousState.doors);
      setTextAnnotations(previousState.textAnnotations);
      setWallSegments(previousState.wallSegments);
      setRooms(previousState.rooms);
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

  const handleExport = () => {
    console.log('Export floor plan');
  };

  const handleImport = () => {
    console.log('Import floor plan');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Floor Planner</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
            >
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
            >
              Redo
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport}>
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>
        
        {/* Wall thickness control for wall mode */}
        {currentMode === 'wall' && (
          <div className="mt-2">
            <WallThicknessControl
              thickness={wallThickness}
              onChange={setWallThickness}
            />
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Products */}
        <div className="w-80 border-r bg-background overflow-y-auto">
          <ProductSidebar
            products={initialProducts}
            onProductSelect={(product) => {
              console.log('Selected product:', product);
            }}
          />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b bg-background p-2">
            <Toolbar
              currentMode={currentMode}
              onModeChange={setCurrentMode}
              onClearAll={handleClearAll}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              showRuler={showRuler}
              onToggleRuler={() => setShowRuler(!showRuler)}
              showMeasurements={showMeasurements}
              onToggleMeasurements={() => setShowMeasurements(!showMeasurements)}
            />
          </div>

          {/* Canvas workspace */}
          <div className="flex-1 p-4 overflow-hidden">
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
              wallThickness={wallThickness}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        {/* Right sidebar - Settings */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <SettingsSidebar
            scale={scale}
            onScaleChange={setScale}
            gridSize={gridSize}
            onGridSizeChange={setGridSize}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            showMeasurements={showMeasurements}
            onToggleMeasurements={() => setShowMeasurements(!showMeasurements)}
            wallThickness={wallThickness}
            onWallThicknessChange={setWallThickness}
          />
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
