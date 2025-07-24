
import React, { useState } from 'react';
import CanvasWorkspace from './CanvasWorkspace';
import FloorPlannerViewControls from './FloorPlannerViewControls';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, DrawingMode } from '@/types/floorPlanTypes';

interface FloorPlannerCanvasProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  wallSegments: WallSegment[];
  setWallSegments: (segments: WallSegment[]) => void;
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  doors: Door[];
  setDoors: (doors: Door[]) => void;
  textAnnotations: TextAnnotation[];
  setTextAnnotations: (annotations: TextAnnotation[]) => void;
  scale: number;
  currentTool: DrawingMode;
  showGrid: boolean;
  showRuler: boolean;
  onClearAll: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const FloorPlannerCanvas: React.FC<FloorPlannerCanvasProps> = ({
  roomPoints,
  setRoomPoints,
  wallSegments,
  setWallSegments,
  placedProducts,
  setPlacedProducts,
  doors,
  setDoors,
  textAnnotations,
  setTextAnnotations,
  scale,
  currentTool,
  showGrid,
  showRuler,
  onClearAll,
  canvasRef
}) => {
  const [currentZoom, setCurrentZoom] = useState(1);

  const handleZoomIn = () => {
    setCurrentZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setCurrentZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleFitToView = () => {
    // This would calculate optimal zoom based on content
    setCurrentZoom(1);
  };

  const handleResetView = () => {
    setCurrentZoom(1);
  };

  return (
    <div className="h-full w-full relative">
      <CanvasWorkspace
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
        scale={scale}
        currentTool={currentTool}
        showGrid={showGrid}
        showRuler={showRuler}
        onClearAll={onClearAll}
        canvasRef={canvasRef}
      />
      
      <FloorPlannerViewControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToView={handleFitToView}
        onResetView={handleResetView}
        currentZoom={currentZoom}
      />
    </div>
  );
};

export default FloorPlannerCanvas;
