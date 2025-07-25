
import React, { useRef, useEffect, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode, WallType } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas, GRID_SIZES } from '@/utils/measurements';

interface CanvasDrawingEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
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
  currentMode: DrawingMode;
  scale: number;
  gridSize: number;
  showGrid: boolean;
  showMeasurements: boolean;
  selectedProducts: string[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  onProductDrop: (product: any, position: Point) => void;
}

export const CanvasDrawingEngine: React.FC<CanvasDrawingEngineProps> = ({
  canvasRef,
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
  selectedProducts,
  setSelectedProducts,
  onProductDrop
}) => {
  const isDrawing = useRef(false);
  const currentPath = useRef<Point[]>([]);
  const tempRoomPoints = useRef<Point[]>([]);
  const wallStart = useRef<Point | null>(null);

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 600;

  // Get canvas coordinates from mouse event
  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, [canvasRef]);

  // Snap to grid
  const snapToGrid = useCallback((point: Point): Point => {
    if (!showGrid) return point;
    
    const gridPixels = mmToCanvas(gridSize, scale);
    return {
      x: Math.round(point.x / gridPixels) * gridPixels,
      y: Math.round(point.y / gridPixels) * gridPixels
    };
  }, [showGrid, gridSize, scale]);

  // Drawing functions
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    const gridPixels = mmToCanvas(gridSize, scale);
    
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
  }, [showGrid, gridSize, scale]);

  const drawWall = useCallback((ctx: CanvasRenderingContext2D, wall: WallSegment) => {
    ctx.strokeStyle = wall.color;
    ctx.lineWidth = mmToCanvas(wall.thickness, scale);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(wall.start.x, wall.start.y);
    ctx.lineTo(wall.end.x, wall.end.y);
    ctx.stroke();

    if (showMeasurements) {
      const lengthMm = Math.sqrt(
        Math.pow(canvasToMm(wall.end.x - wall.start.x, scale), 2) +
        Math.pow(canvasToMm(wall.end.y - wall.start.y, scale), 2)
      );
      const midX = (wall.start.x + wall.end.x) / 2;
      const midY = (wall.start.y + wall.end.y) / 2;
      
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(formatMeasurement(lengthMm, { unit: 'mm', precision: 0, showUnit: true }), midX, midY - 5);
    }
  }, [scale, showMeasurements]);

  const drawRoom = useCallback((ctx: CanvasRenderingContext2D, room: Room) => {
    if (room.points.length < 3) return;
    
    ctx.fillStyle = room.color || 'rgba(173, 216, 230, 0.3)';
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
    
    // Draw room name
    const centroid = room.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    const centerX = centroid.x / room.points.length;
    const centerY = centroid.y / room.points.length;
    
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, centerX, centerY);
  }, []);

  const drawProduct = useCallback((ctx: CanvasRenderingContext2D, product: PlacedProduct) => {
    const isSelected = selectedProducts.includes(product.id);
    
    ctx.save();
    ctx.translate(product.position.x, product.position.y);
    ctx.rotate(product.rotation);
    
    // Draw product rectangle
    const width = mmToCanvas(product.dimensions.length, scale);
    const height = mmToCanvas(product.dimensions.width, scale);
    
    ctx.fillStyle = isSelected ? '#ff6b6b' : (product.color || '#4caf50');
    ctx.strokeStyle = isSelected ? '#ff0000' : '#333333';
    ctx.lineWidth = isSelected ? 3 : 1;
    
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    
    ctx.restore();
    
    // Draw product name
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(product.name, product.position.x, product.position.y - mmToCanvas(product.dimensions.width, scale) / 2 - 15);
  }, [selectedProducts, scale]);

  const drawDoor = useCallback((ctx: CanvasRenderingContext2D, door: Door) => {
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(door.position.x, door.position.y, mmToCanvas(door.width, scale) / 2, 0, Math.PI);
    ctx.stroke();
  }, [scale]);

  const drawText = useCallback((ctx: CanvasRenderingContext2D, text: TextAnnotation) => {
    ctx.fillStyle = text.color;
    ctx.font = `${text.fontSize}px Arial`;
    ctx.fillText(text.text, text.position.x, text.position.y);
  }, []);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw rooms
    rooms.forEach(room => drawRoom(ctx, room));
    
    // Draw walls
    wallSegments.forEach(wall => drawWall(ctx, wall));
    
    // Draw current room path
    if (currentMode === 'room' && tempRoomPoints.current.length > 0) {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tempRoomPoints.current[0].x, tempRoomPoints.current[0].y);
      tempRoomPoints.current.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      
      // Draw points
      tempRoomPoints.current.forEach(point => {
        ctx.fillStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // Draw current wall path
    if (currentMode === 'wall' && currentPath.current.length > 0) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentPath.current[0].x, currentPath.current[0].y);
      currentPath.current.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
    
    // Draw doors
    doors.forEach(door => drawDoor(ctx, door));
    
    // Draw text annotations
    textAnnotations.forEach(text => drawText(ctx, text));
    
    // Draw products
    placedProducts.forEach(product => drawProduct(ctx, product));
  }, [
    canvasRef, drawGrid, drawRoom, drawWall, drawDoor, drawText, drawProduct,
    currentMode, rooms, wallSegments, doors, textAnnotations, placedProducts
  ]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = snapToGrid(getCanvasPoint(e));
    
    if (currentMode === 'wall') {
      if (!wallStart.current) {
        wallStart.current = point;
        currentPath.current = [point];
      } else {
        currentPath.current.push(point);
      }
    } else if (currentMode === 'room') {
      tempRoomPoints.current.push(point);
    } else if (currentMode === 'door') {
      const newDoor: Door = {
        id: `door-${Date.now()}`,
        position: point,
        width: 800, // 800mm default door width
        wallId: undefined,
        wallSegmentId: undefined,
        wallPosition: undefined,
        isEmbedded: false
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
          color: '#000000'
        };
        setTextAnnotations(prev => [...prev, newAnnotation]);
      }
    } else if (currentMode === 'select') {
      // Check if clicking on a product
      let clickedProduct: PlacedProduct | null = null;
      
      for (const product of placedProducts) {
        const width = mmToCanvas(product.dimensions.length, scale);
        const height = mmToCanvas(product.dimensions.width, scale);
        
        if (point.x >= product.position.x - width / 2 &&
            point.x <= product.position.x + width / 2 &&
            point.y >= product.position.y - height / 2 &&
            point.y <= product.position.y + height / 2) {
          clickedProduct = product;
          break;
        }
      }
      
      if (clickedProduct) {
        if (e.shiftKey) {
          setSelectedProducts(prev => 
            prev.includes(clickedProduct!.id) 
              ? prev.filter(id => id !== clickedProduct!.id)
              : [...prev, clickedProduct!.id]
          );
        } else {
          setSelectedProducts([clickedProduct.id]);
        }
      } else {
        setSelectedProducts([]);
      }
    }
  }, [currentMode, snapToGrid, getCanvasPoint, setDoors, setTextAnnotations, placedProducts, scale, setSelectedProducts]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentMode === 'wall' && wallStart.current) {
      const point = snapToGrid(getCanvasPoint(e));
      currentPath.current = [wallStart.current, point];
    }
  }, [currentMode, snapToGrid, getCanvasPoint]);

  const handleDoubleClick = useCallback(() => {
    if (currentMode === 'wall' && wallStart.current && currentPath.current.length >= 2) {
      const newWall: WallSegment = {
        id: `wall-${Date.now()}`,
        start: wallStart.current,
        end: currentPath.current[currentPath.current.length - 1],
        thickness: 100, // 100mm default wall thickness
        color: '#666666',
        type: WallType.INTERIOR
      };
      setWallSegments(prev => [...prev, newWall]);
      wallStart.current = null;
      currentPath.current = [];
    } else if (currentMode === 'room' && tempRoomPoints.current.length >= 3) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: `Room ${rooms.length + 1}`,
        points: [...tempRoomPoints.current],
        area: calculatePolygonArea(tempRoomPoints.current),
        perimeter: calculatePolygonPerimeter(tempRoomPoints.current),
        color: '#e3f2fd'
      };
      setRooms(prev => [...prev, newRoom]);
      tempRoomPoints.current = [];
    }
  }, [currentMode, setWallSegments, setRooms, rooms.length]);

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

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const productData = e.dataTransfer.getData('application/json');
    if (!productData) return;

    try {
      const product = JSON.parse(productData);
      const point = getCanvasPoint(e as any);
      onProductDrop(product, point);
    } catch (error) {
      console.error('Error parsing dropped product:', error);
    }
  }, [getCanvasPoint, onProductDrop]);

  // Re-render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full h-full bg-white cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    />
  );
};

export default CanvasDrawingEngine;
