
import React from 'react';
import CanvasWorkspace from './CanvasWorkspace';
import { Point, PlacedProduct } from '@/types/floorPlanTypes';

interface FloorPlannerCanvasProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
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
