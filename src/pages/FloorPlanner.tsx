import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import { initialFloorPlanState } from '@/constants';
import { useDisclosure } from "@/components/ui/use-disclosure"
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast"
import { Delete, Save } from 'lucide-react';

const EnhancedCanvasWorkspace = dynamic(() => import('@/components/canvas/EnhancedCanvasWorkspace'), {
  ssr: false,
});
const ProductSidebar = dynamic(() => import('@/components/ProductSidebar'), {
  ssr: false,
});
const Toolbar = dynamic(() => import('@/components/Toolbar'), {
  ssr: false,
});
const DimensionSettings = dynamic(() => import('@/components/DimensionSettings'), {
  ssr: false,
});
const ResetConfirmation = dynamic(() => import('@/components/ResetConfirmation'), {
  ssr: false,
});

const FloorPlanner: React.FC = () => {
  const [roomPoints, setRoomPoints] = useState<Point[]>(initialFloorPlanState.roomPoints);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>(initialFloorPlanState.wallSegments);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>(initialFloorPlanState.placedProducts);
  const [doors, setDoors] = useState<Door[]>(initialFloorPlanState.doors);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>(initialFloorPlanState.textAnnotations);
  const [rooms, setRooms] = useState<Room[]>(initialFloorPlanState.rooms);
  const [scale, setScale] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMeasurements, setShowMeasurements] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(500);
  const [currentTool, setCurrentTool] = useState<DrawingMode>('select');

  const dimensionSettingsDisclosure = useDisclosure()
  const resetConfirmationDisclosure = useDisclosure()
  const { toast } = useToast()

  const handleClearAll = useCallback(() => {
    setRoomPoints([]);
    setWallSegments([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    setRooms([]);
    toast({
      title: "Cleared!",
      description: "All items cleared from canvas.",
    })
  }, [toast]);

  const handleToolChange = (tool: DrawingMode) => {
    setCurrentTool(tool);
    console.log('Tool changed to:', tool);
  };

  return (
    <div className="flex h-screen">
      {/* Product Sidebar */}
      <ProductSidebar placedProducts={placedProducts} setPlacedProducts={setPlacedProducts} scale={scale} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <Toolbar
          currentTool={currentTool}
          onToolChange={handleToolChange}
          onDimensionSettingsOpen={dimensionSettingsDisclosure.onOpen}
          onResetConfirmationOpen={resetConfirmationDisclosure.onOpen}
        />

        {/* Canvas Workspace */}
        <div className="flex-1 flex items-center justify-center overflow-auto">
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

      <DimensionSettings
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showMeasurements={showMeasurements}
        setShowMeasurements={setShowMeasurements}
        gridSize={gridSize}
        setGridSize={setGridSize}
        scale={scale}
        setScale={setScale}
        disclosure={dimensionSettingsDisclosure}
      />

      <ResetConfirmation
        disclosure={resetConfirmationDisclosure}
        onClearAll={handleClearAll}
      />
    </div>
  );
};

export default FloorPlanner;
