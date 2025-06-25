
import React from 'react';
import CanvasWorkspace from './CanvasWorkspace';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment } from '@/types/floorPlanTypes';

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
  currentTool: string;
  showGrid: boolean;
  showRuler: boolean;
  onClearAll: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  currentZoom?: number;
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
  canvasRef,
  currentZoom
}) => {
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
        currentZoom={currentZoom}
      />
    </div>
  );
};

export default FloorPlannerCanvas;
