import React, { useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import CanvasWorkspace from '@/components/CanvasWorkspace';
import ProductSidebar from '@/components/ProductSidebar';
import Toolbar from '@/components/Toolbar';
import SettingsSidebar from '@/components/SettingsSidebar';
import { initialProducts } from '@/data/products';
import EnhancedCanvasWorkspace from '@/components/canvas/EnhancedCanvasWorkspace';

const FloorPlanner = () => {
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [scale, setScale] = useState(0.1);
  const [currentTool, setCurrentTool] = useState<DrawingMode>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [isDrawingRoom, setIsDrawingRoom] = useState(false);

  const handleToolChange = (tool: DrawingMode) => {
    setCurrentTool(tool);
    
    // Reset drawing states when switching tools
    if (tool === 'room') {
      setCurrentTool('room');
      setIsDrawingRoom(true);
    } else if (tool === 'wall') {
      setCurrentTool('wall');
      setIsDrawingRoom(false);
    } else {
      setCurrentTool(tool);
      setIsDrawingRoom(false);
    }
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  const handleGridToggle = () => {
    setShowGrid(prev => !prev);
  };

  const handleMeasurementsToggle = () => {
    setShowMeasurements(prev => !prev);
  };

  const handleGridSizeChange = (size: number) => {
    setGridSize(size);
  };

  const clearCanvas = useCallback(() => {
    setRoomPoints([]);
    setWallSegments([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setRooms([]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Tools and Settings */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Toolbar
                currentTool={currentTool}
                onToolChange={handleToolChange}
                showGrid={showGrid}
                onGridToggle={handleGridToggle}
                showMeasurements={showMeasurements}
                onMeasurementsToggle={handleMeasurementsToggle}
              />
              <SettingsSidebar
                scale={scale}
                onScaleChange={handleScaleChange}
                gridSize={gridSize}
                onGridSizeChange={handleGridSizeChange}
              />
            </div>
          </div>
              
              {/* Enhanced Canvas Workspace */}
              <div className="lg:col-span-3">
                <div className="bg-card rounded-lg shadow-sm border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Floor Plan Canvas</h2>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Scale: 1:{Math.round(1/scale)}
                        </span>
                        <button
                          onClick={clearCanvas}
                          className="text-destructive hover:text-destructive/80"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
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
                      onClearAll={clearCanvas}
                    />
                  </div>
                </div>
              </div>

              {/* Right sidebar - Product Catalog */}
              {/*<ProductSidebar*/}
              {/*  placedProducts={placedProducts}*/}
              {/*  setPlacedProducts={setPlacedProducts}*/}
              {/*/>*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
