import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode, WallType } from '@/types/floorPlanTypes';
import { DrawingEngine } from './DrawingEngine';
import { GridSystem } from './GridSystem';
import { MeasurementSystem } from './MeasurementSystem';
import { SelectionSystem } from './SelectionSystem';
import { GRID_SIZES } from '@/utils/measurements';

interface EnhancedCanvasWorkspaceProps {
  roomPoints: Point[];
  setRoomPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  wallSegments: WallSegment[];
  setWallSegments: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  placedProducts: PlacedProduct[];
  setPlacedProducts: React.Dispatch<React.SetStateAction<PlacedProduct[]>>;
  doors: Door[];
  setDoors: React.Dispatch<React.SetStateAction<Door[]>>;
  textAnnotations: TextAnnotation[];
  setTextAnnotations: React.Dispatch<React.SetStateAction<TextAnnotation[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  scale: number;
  currentMode: DrawingMode;
  showGrid: boolean;
  showMeasurements: boolean;
  gridSize: number;
  onClearAll: () => void;
}

export const EnhancedCanvasWorkspace: React.FC<EnhancedCanvasWorkspaceProps> = ({
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
  scale,
  currentMode,
  showGrid,
  showMeasurements,
  gridSize,
  onClearAll
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 600;

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const snapToGrid = useCallback((point: Point): Point => {
    if (!showGrid) return point;
    
    const gridPixels = gridSize * scale;
    return {
      x: Math.round(point.x / gridPixels) * gridPixels,
      y: Math.round(point.y / gridPixels) * gridPixels
    };
  }, [showGrid, gridSize, scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = snapToGrid(getCanvasPoint(e));
    setLastMousePos(point);
    
    if (currentMode === 'wall') {
      setIsDrawing(true);
      setCurrentPath([point]);
    } else if (currentMode === 'room') {
      setRoomPoints(prev => [...prev, point]);
    } else if (currentMode === 'door') {
      const newDoor: Door = {
        id: `door-${Date.now()}`,
        position: point,
        width: 80,
        height: 20,
        rotation: 0,
        type: 'single',
        isOpen: false
      };
      setDoors(prev => [...prev, newDoor]);
    } else if (currentMode === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newAnnotation: TextAnnotation = {
          id: `text-${Date.now()}`,
          position: point,
          text,
          fontSize: 14,
          color: '#000000',
          rotation: 0
        };
        setTextAnnotations(prev => [...prev, newAnnotation]);
      }
    }
  }, [currentMode, getCanvasPoint, snapToGrid, setRoomPoints, setDoors, setTextAnnotations]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = snapToGrid(getCanvasPoint(e));
    setLastMousePos(point);
    
    if (isDrawing && currentMode === 'wall') {
      setCurrentPath(prev => [...prev.slice(0, -1), point]);
    }
  }, [isDrawing, currentMode, getCanvasPoint, snapToGrid]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentMode === 'wall' && currentPath.length >= 2) {
      const newWallSegment: WallSegment = {
        id: `wall-${Date.now()}`,
        start: currentPath[0],
        end: currentPath[currentPath.length - 1],
        thickness: 10,
        color: '#666666',
        type: WallType.INTERIOR
      };
      setWallSegments(prev => [...prev, newWallSegment]);
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, currentMode, currentPath, setWallSegments]);

  const handleDoubleClick = useCallback(() => {
    if (currentMode === 'room' && roomPoints.length >= 3) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: `Room ${rooms.length + 1}`,
        points: [...roomPoints],
        area: calculatePolygonArea(roomPoints),
        perimeter: calculatePolygonPerimeter(roomPoints),
        color: '#e3f2fd',
        type: 'general'
      };
      setRooms(prev => [...prev, newRoom]);
      setRoomPoints([]);
    }
  }, [currentMode, roomPoints, rooms.length, setRooms, setRoomPoints]);

  const calculatePolygonArea = (points: Point[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  const calculatePolygonPerimeter = (points: Point[]): number => {
    if (points.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid if enabled
    if (showGrid) {
      const gridPixels = gridSize * scale;
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= CANVAS_WIDTH; x += gridPixels) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      
      for (let y = 0; y <= CANVAS_HEIGHT; y += gridPixels) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }
    
    // Draw rooms
    rooms.forEach(room => {
      if (room.points.length >= 3) {
        ctx.fillStyle = room.color;
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(room.points[0].x, room.points[0].y);
        room.points.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
    
    // Draw wall segments
    wallSegments.forEach(wall => {
      ctx.strokeStyle = wall.color;
      ctx.lineWidth = wall.thickness;
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });
    
    // Draw current room path
    if (roomPoints.length > 0) {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
      roomPoints.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      
      // Draw points
      roomPoints.forEach(point => {
        ctx.fillStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // Draw current drawing path
    if (currentPath.length > 0) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
    
    // Draw doors
    doors.forEach(door => {
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(door.position.x - door.width/2, door.position.y - door.height/2, door.width, door.height);
    });
    
    // Draw text annotations
    textAnnotations.forEach(annotation => {
      ctx.fillStyle = annotation.color;
      ctx.font = `${annotation.fontSize}px Arial`;
      ctx.fillText(annotation.text, annotation.position.x, annotation.position.y);
    });
    
    // Draw placed products
    placedProducts.forEach(product => {
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(
        product.position.x - product.dimensions.length/2,
        product.position.y - product.dimensions.width/2,
        product.dimensions.length,
        product.dimensions.width
      );
      
      // Draw product name
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.fillText(product.name, product.position.x - 30, product.position.y - 20);
    });
    
  }, [showGrid, gridSize, scale, rooms, wallSegments, roomPoints, currentPath, doors, textAnnotations, placedProducts]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
};

export default EnhancedCanvasWorkspace;
