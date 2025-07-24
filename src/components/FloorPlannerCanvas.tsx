
import React, { useRef } from 'react';
import CanvasWorkspace from './CanvasWorkspace';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';

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
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  currentMode: DrawingMode;
  scale: number;
  gridSize: number;
  showGrid: boolean;
  showMeasurements: boolean;
  onClearAll: () => void;
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
  rooms,
  setRooms,
  currentMode,
  scale,
  gridSize,
  showGrid,
  showMeasurements,
  onClearAll
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
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
        rooms={rooms}
        setRooms={setRooms}
        currentMode={currentMode}
        scale={scale}
        gridSize={gridSize}
        showGrid={showGrid}
        showMeasurements={showMeasurements}
        onClearAll={onClearAll}
        canvasRef={canvasRef}
      />
    </div>
  );
};

export default FloorPlannerCanvas;
