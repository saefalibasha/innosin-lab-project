
import React, { useRef, useEffect, useState } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import CanvasWorkspace from './CanvasWorkspace';
import DrawingEngine from './canvas/DrawingEngine';

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
  scale: number;
  currentMode: DrawingMode;
  showGrid: boolean;
  showMeasurements: boolean;
  gridSize: number;
  onClearAll: () => void;
}

const FloorPlannerCanvas: React.FC<FloorPlannerCanvasProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleWallComplete = (wall: WallSegment) => {
    props.setWallSegments([...props.wallSegments, wall]);
  };

  const handleRoomUpdate = (points: Point[]) => {
    props.setRoomPoints(points);
  };

  return (
    <div className="relative w-full h-full">
      <CanvasWorkspace
        roomPoints={props.roomPoints}
        setRoomPoints={props.setRoomPoints}
        wallSegments={props.wallSegments}
        setWallSegments={props.setWallSegments}
        placedProducts={props.placedProducts}
        setPlacedProducts={props.setPlacedProducts}
        doors={props.doors}
        setDoors={props.setDoors}
        textAnnotations={props.textAnnotations}
        setTextAnnotations={props.setTextAnnotations}
        rooms={props.rooms}
        setRooms={props.setRooms}
        scale={props.scale}
        currentMode={props.currentMode}
        showGrid={props.showGrid}
        showMeasurements={props.showMeasurements}
        gridSize={props.gridSize}
        onClearAll={props.onClearAll}
        canvasRef={canvasRef}
      />
      <DrawingEngine
        canvasRef={canvasRef}
        currentMode={props.currentMode}
        scale={props.scale}
        gridSize={props.gridSize}
        showGrid={props.showGrid}
        showMeasurements={props.showMeasurements}
        onWallComplete={handleWallComplete}
        onRoomUpdate={handleRoomUpdate}
        roomPoints={props.roomPoints}
        wallSegments={props.wallSegments}
        rooms={props.rooms}
      />
    </div>
  );
};

export default FloorPlannerCanvas;
