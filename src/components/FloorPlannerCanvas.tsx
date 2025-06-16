
import React from 'react';
import CanvasWorkspace from './CanvasWorkspace';
import { Point, PlacedProduct, Door, TextAnnotation } from '@/types/floorPlanTypes';

interface FloorPlannerCanvasProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
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
}

const FloorPlannerCanvas: React.FC<FloorPlannerCanvasProps> = ({
  roomPoints,
  setRoomPoints,
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
  return (
    <div className="h-full w-full">
      <CanvasWorkspace
        roomPoints={roomPoints}
        setRoomPoints={setRoomPoints}
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
    </div>
  );
};

export default FloorPlannerCanvas;
