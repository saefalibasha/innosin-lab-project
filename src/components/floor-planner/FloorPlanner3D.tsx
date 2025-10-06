import React, { useState, useCallback } from 'react';
import EnhancedSeriesSelector from '../floorplan/EnhancedSeriesSelector';
import EnhancedCanvasWorkspace3D from '../canvas/EnhancedCanvasWorkspace3D';
import WallEditor from '../floorplan/WallEditor';
import { AddWorktopButton } from '../canvas/AddWorktopButton';

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
import { Badge } from '@/components/ui/badge';

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
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>(currentState.placedProducts);
  const [doors, setDoors] = useState<Door[]>(currentState.doors);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>(currentState.textAnnotations);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>(currentState.wallSegments);
  const [rooms, setRooms] = useState<Room[]>(currentState.rooms);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);

  // Canvas settings
  const [currentMode] = useState<DrawingMode>('select');
  const [showGrid] = useState(true);
  const [showMeasurements] = useState(true);
  const [gridSize] = useState(100); // mm
  const [measurementUnit] = useState<MeasurementUnit>('mm');

  const [canvasWidth] = useState(1200);
  const [canvasHeight] = useState(800);
  const scale = 0.08; // 0.08 px per mm (80 px / meter)

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
    setSelectedWallId(null);
    setSelectedDoorId(null);
  }, []);

  const handleWallClick = useCallback((wallId: string) => {
    setSelectedWallId(wallId);
    setSelectedDoorId(null);
  }, []);

  const handleWallUpdate = useCallback((updatedWall: WallSegment) => {
    setWallSegments(prev => prev.map(w => w.id === updatedWall.id ? updatedWall : w));
  }, []);

  const handleWallDelete = useCallback((wallId: string) => {
    setWallSegments(prev => prev.filter(w => w.id !== wallId));
    setSelectedWallId(null);
  }, []);

  const handleDoorClick = useCallback((doorId: string) => {
    setSelectedDoorId(doorId);
    setSelectedWallId(null);
  }, []);

  const selectedWall = selectedWallId ? wallSegments.find(w => w.id === selectedWallId) || null : null;

  return (
    <div className="h-screen flex flex-col">
      {/* Main content area with sidebar and canvas */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Product Library</h2>
            <p className="text-sm text-muted-foreground">Drag products to place on canvas</p>
            <Badge variant="outline" className="mt-2">3D Isometric View</Badge>
          </div>
          <div className="flex-1 overflow-hidden">
            <EnhancedSeriesSelector onProductDrag={handleProductDrag} currentTool="select" />
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative min-w-0">
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
              onWallSelect={() => {}}
              onWallClick={handleWallClick}
              selectedDoorId={selectedDoorId}
              onDoorClick={handleDoorClick}
            />
            
            {/* Wall Editor */}
            {selectedWall && (
              <WallEditor
                selectedWall={selectedWall}
                onWallUpdate={handleWallUpdate}
                onWallDelete={handleWallDelete}
                onClose={() => setSelectedWallId(null)}
                scale={scale}
                measurementUnit={measurementUnit}
              />
            )}
          </div>
        </div>
      </div>

      {/* Functional 3D Controls - responsive, no overlap */}
      <div className="border-t bg-background">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* View Controls */}
          <div className="space-y-2 min-w-0">
            <h3 className="text-sm font-medium">View Controls</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const camera = (window as any).__threeCamera;
                  if (camera) {
                    camera.position.set(20, 20, 20);
                    camera.lookAt(0, 0, 0);
                  }
                }}
              >
                Reset View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const camera = (window as any).__threeCamera;
                  if (camera) {
                    camera.position.set(10, 15, 10);
                  }
                }}
              >
                Fit View
              </Button>
            </div>
          </div>

          {/* Product Controls */}
          <div className="space-y-2 min-w-0">
            <h3 className="text-sm font-medium">Product Controls</h3>
            <div className="flex flex-wrap gap-2">
              <AddWorktopButton
                selectedProducts={selectedProducts}
                allProducts={placedProducts}
                scale={scale}
                onAddWorktop={(worktopData) => {
                  setPlacedProducts((prev) => [...prev, worktopData as PlacedProduct]);
                  setSelectedProducts([]);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={selectedProducts.length === 0}
                onClick={() => {
                  if (selectedProducts.length > 0) {
                    const productId = selectedProducts[0];
                    const product = placedProducts.find((p) => p.id === productId);
                    if (product) {
                      const newRotation = (product.rotation || 0) + 90;
                      setPlacedProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, rotation: newRotation % 360 } : p)));
                    }
                  }
                }}
              >
                Rotate 90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedProducts.length === 0}
                onClick={() => {
                  if (selectedProducts.length > 0) {
                    setPlacedProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)));
                    setSelectedProducts([]);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Snapping */}
          <div className="space-y-2 min-w-0">
            <h3 className="text-sm font-medium">Snapping</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Grid On</Button>
              <Button variant="outline" size="sm">Auto-Snap</Button>
            </div>
          </div>

          {/* Project */}
          <div className="space-y-2 min-w-0">
            <h3 className="text-sm font-medium">Project</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleClearAll}>Clear All</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner3D;