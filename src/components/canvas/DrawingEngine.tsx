
import React, { useRef, useCallback, useEffect } from 'react';
import { Point, WallSegment, Room, Door, TextAnnotation, WallType } from '@/types/floorPlanTypes';

interface DrawingEngineProps {
  currentMode: string;
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  wallSegments: WallSegment[];
  setWallSegments: (segments: WallSegment[]) => void;
  doors: Door[];
  setDoors: (doors: Door[]) => void;
  textAnnotations: TextAnnotation[];
  setTextAnnotations: (annotations: TextAnnotation[]) => void;
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  onWallComplete?: (wall: WallSegment) => void;
  onRoomComplete?: (room: Room) => void;
  scale?: number;
  gridSize?: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

// DrawingEngine component
const DrawingEngine: React.FC<DrawingEngineProps> = ({
  currentMode,
  roomPoints,
  setRoomPoints,
  wallSegments,
  setWallSegments,
  doors,
  setDoors,
  textAnnotations,
  setTextAnnotations,
  rooms,
  setRooms,
  onWallComplete,
  onRoomComplete,
  scale = 1,
  gridSize = 10,
  canvasRef
}) => {
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);
  const tempPoints = useRef<Point[]>([]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;

    const gridSpacing = gridSize * scale!;

    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [gridSize, scale]);

  const drawWall = useCallback((ctx: CanvasRenderingContext2D, wall: WallSegment) => {
    ctx.strokeStyle = wall.color;
    ctx.lineWidth = wall.thickness * scale!;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(wall.start.x, wall.start.y);
    ctx.lineTo(wall.end.x, wall.end.y);
    ctx.stroke();
  }, [scale]);

  const drawRoom = useCallback((ctx: CanvasRenderingContext2D, room: Room) => {
    ctx.fillStyle = room.color || 'rgba(173, 216, 230, 0.2)';
    ctx.beginPath();
    if (room.points.length > 0) {
      ctx.moveTo(room.points[0].x, room.points[0].y);
      for (let i = 1; i < room.points.length; i++) {
        ctx.lineTo(room.points[i].x, room.points[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Draw room name
    ctx.fillStyle = 'black';
    ctx.font = `${14 * scale!}px sans-serif`;
    if (room.points.length > 0) {
      const centroid = room.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      const textX = centroid.x / room.points.length;
      const textY = centroid.y / room.points.length;
      ctx.fillText(room.name, textX, textY);
    }
  }, [scale]);

  const drawDoor = useCallback((ctx: CanvasRenderingContext2D, door: Door) => {
    ctx.strokeStyle = 'brown';
    ctx.lineWidth = 3 * scale!;
    ctx.beginPath();
    ctx.arc(door.position.x, door.position.y, door.width / 2 * scale!, 0, Math.PI);
    ctx.stroke();
  }, [scale]);

  const drawText = useCallback((ctx: CanvasRenderingContext2D, text: TextAnnotation) => {
    ctx.fillStyle = text.color;
    ctx.font = `${text.fontSize * scale!}px sans-serif`;
    ctx.fillText(text.text, text.position.x, text.position.y);
  }, [scale]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentMode === 'wall') {
      if (!isDrawing.current) {
        startPoint.current = { x, y };
        isDrawing.current = true;
        tempPoints.current = [{ x, y }];
      } else {
        tempPoints.current.push({ x, y });
      }
    }

    if (currentMode === 'door') {
      const newDoor: Door = {
        id: `door-${Date.now()}`,
        position: { x, y },
        width: 60,
        wallId: undefined,
        wallSegmentId: undefined,
        wallPosition: undefined,
        isEmbedded: false
      };
      setDoors((prev: Door[]) => [...prev, newDoor]);
    }

    if (currentMode === 'text') {
      const newText: TextAnnotation = {
        id: `text-${Date.now()}`,
        position: { x, y },
        text: 'New Text',
        fontSize: 12,
        color: 'black'
      };
      setTextAnnotations((prev: TextAnnotation[]) => [...prev, newText]);
    }
  }, [currentMode, setDoors, setTextAnnotations, canvasRef]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentMode === 'wall' && isDrawing.current && startPoint.current) {
      // Optionally update a temporary wall for preview
    }
  }, [currentMode]);

  const finishWallDrawing = useCallback(() => {
    if (startPoint.current && tempPoints.current.length > 0) {
      const lastPoint = tempPoints.current[tempPoints.current.length - 1];
      const newWall: WallSegment = {
        id: `wall-${Date.now()}`,
        start: startPoint.current,
        end: lastPoint,
        thickness: 10,
        color: '#000000',
        type: WallType.INTERIOR
      };
      
      setWallSegments((prev: WallSegment[]) => [...prev, newWall]);
      if (onWallComplete) onWallComplete(newWall);
      
      startPoint.current = null;
      tempPoints.current = [];
      isDrawing.current = false;
    }
  }, [setWallSegments, onWallComplete]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && currentMode === 'wall') {
      finishWallDrawing();
    }
  }, [currentMode, finishWallDrawing]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw existing walls
    wallSegments.forEach(wall => drawWall(ctx, wall));

    // Draw rooms
    rooms.forEach(room => drawRoom(ctx, room));

    // Draw doors
    doors.forEach(door => drawDoor(ctx, door));

    // Draw text annotations
    textAnnotations.forEach(text => drawText(ctx, text));
  }, [drawGrid, drawWall, drawRoom, drawDoor, drawText, wallSegments, rooms, doors, textAnnotations, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={800}
      className="w-full h-full bg-white cursor-crosshair"
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
    />
  );
};

export default DrawingEngine;
