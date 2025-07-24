
import React, { useEffect, useCallback } from 'react';
import { Point, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';

interface DrawingEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentMode: DrawingMode;
  scale: number;
  gridSize: number;
  showGrid: boolean;
  showMeasurements: boolean;
  zoom: number;
  pan: Point;
  onWallComplete: (wall: WallSegment) => void;
  onRoomUpdate: (points: Point[]) => void;
  roomPoints: Point[];
  wallSegments: WallSegment[];
  rooms: Room[];
}

const DrawingEngine: React.FC<DrawingEngineProps> = ({
  canvasRef,
  currentMode,
  scale,
  gridSize,
  showGrid,
  showMeasurements,
  zoom,
  pan,
  onWallComplete,
  onRoomUpdate,
  roomPoints,
  wallSegments,
  rooms
}) => {
  const handleCanvasClick = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const point: Point = {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };

    if (currentMode === 'room') {
      const newPoints = [...roomPoints, point];
      onRoomUpdate(newPoints);
    }
  }, [canvasRef, currentMode, pan, zoom, roomPoints, onRoomUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleCanvasClick);
    
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [handleCanvasClick]);

  return null; // This component doesn't render anything, it just handles drawing logic
};

export default DrawingEngine;
