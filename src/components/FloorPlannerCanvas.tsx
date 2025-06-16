
import React from 'react';
import CanvasWorkspace from './CanvasWorkspace';

interface Point {
  x: number;
  y: number;
}

interface PlacedProduct {
  id: string;
  productId: string;
  name: string;
  position: Point;
  rotation: number;
  dimensions: { length: number; width: number; height: number };
  color: string;
  scale?: number;
}

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
