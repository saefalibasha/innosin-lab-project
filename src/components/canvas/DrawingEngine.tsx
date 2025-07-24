
import React, { useRef, useEffect, useCallback } from 'react';
import { Point, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';

interface DrawingEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentMode: DrawingMode;
  scale: number;
  gridSize: number;
  showGrid: boolean;
  showMeasurements: boolean;
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
  onWallComplete,
  onRoomUpdate,
  roomPoints,
  wallSegments,
  rooms
}) => {
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentPoints, setCurrentPoints] = React.useState<Point[]>([]);

  const handleCanvasClick = useCallback((e: MouseEvent) => {
    if (currentMode === 'select') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (currentMode === 'room') {
      setCurrentPoints(prev => [...prev, point]);
      onRoomUpdate([...currentPoints, point]);
    }
  }, [currentMode, canvasRef, currentPoints, onRoomUpdate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCurrentPoints([]);
      setIsDrawing(false);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCanvasClick, handleKeyDown]);

  return null; // This component doesn't render anything
};

export default DrawingEngine;
