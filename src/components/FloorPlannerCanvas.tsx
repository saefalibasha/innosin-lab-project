
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
  isDrawingMode: boolean;
  scale: number;
}

const FloorPlannerCanvas: React.FC<FloorPlannerCanvasProps> = ({
  roomPoints,
  setRoomPoints,
  placedProducts,
  setPlacedProducts,
  isDrawingMode,
  scale
}) => {
  return (
    <div className="h-full w-full">
      <CanvasWorkspace
        roomPoints={roomPoints}
        setRoomPoints={setRoomPoints}
        placedProducts={placedProducts}
        setPlacedProducts={setPlacedProducts}
        isDrawingMode={isDrawingMode}
        scale={scale}
        currentTool={isDrawingMode ? 'wall' : 'select'}
      />
    </div>
  );
};

export default FloorPlannerCanvas;
