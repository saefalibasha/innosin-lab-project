
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, WallSegment, Room } from '@/types/floorPlanTypes';
import { mmToCanvas, canvasToMm } from '@/utils/measurements';

interface CanvasWorkspaceProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  wallSegments: WallSegment[];
  setWallSegments: (segments: WallSegment[]) => void;
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  doors: Door[];
  setDoors: (doors: Door[]) => void;
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  scale: number;
  showGrid?: boolean;
  showMeasurements?: boolean;
  gridSize?: number;
  onClearAll?: () => void;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  roomPoints,
  setRoomPoints,
  wallSegments,
  setWallSegments,
  placedProducts,
  setPlacedProducts,
  doors,
  setDoors,
  rooms,
  setRooms,
  scale,
  showGrid = false,
  showMeasurements = false,
  gridSize = 20,
  onClearAll
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState<PlacedProduct | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // Drawing functions
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    const gridSizePx = mmToCanvas(gridSize, scale);
    
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.2)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSizePx) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSizePx) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  }, [showGrid, gridSize, scale]);

  const drawWalls = useCallback((ctx: CanvasRenderingContext2D) => {
    wallSegments.forEach(wall => {
      ctx.strokeStyle = 'hsl(var(--muted-foreground))';
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });
  }, [wallSegments]);

  const drawRooms = useCallback((ctx: CanvasRenderingContext2D) => {
    rooms.forEach(room => {
      if (room.points.length < 3) return;
      
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'hsl(var(--primary) / 0.1)';
      
      ctx.beginPath();
      ctx.moveTo(room.points[0].x, room.points[0].y);
      
      for (let i = 1; i < room.points.length; i++) {
        ctx.lineTo(room.points[i].x, room.points[i].y);
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }, [rooms]);

  const drawProducts = useCallback((ctx: CanvasRenderingContext2D) => {
    placedProducts.forEach(product => {
      const isSelected = selectedProducts.includes(product.id);
      
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation);
      
      const width = mmToCanvas(product.dimensions.length, scale);
      const height = mmToCanvas(product.dimensions.width, scale);
      
      ctx.fillStyle = isSelected 
        ? 'hsl(var(--primary) / 0.3)' 
        : product.color || 'hsl(var(--muted))';
      ctx.strokeStyle = isSelected 
        ? 'hsl(var(--primary))' 
        : 'hsl(var(--foreground))';
      ctx.lineWidth = isSelected ? 2 : 1;
      
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      // Product label
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 0, height/2 + 12);
      
      ctx.restore();
    });
  }, [placedProducts, selectedProducts, scale]);

  const drawDoors = useCallback((ctx: CanvasRenderingContext2D) => {
    doors.forEach(door => {
      ctx.save();
      ctx.translate(door.position.x, door.position.y);
      ctx.rotate(door.rotation);
      
      const width = mmToCanvas(door.width * 1000, scale);
      
      ctx.strokeStyle = 'hsl(var(--destructive))';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-width/2, 0);
      ctx.lineTo(width/2, 0);
      ctx.stroke();
      
      ctx.restore();
    });
  }, [doors, scale]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawGrid(ctx);
    drawWalls(ctx);
    drawRooms(ctx);
    drawProducts(ctx);
    drawDoors(ctx);
  }, [drawGrid, drawWalls, drawRooms, drawProducts, drawDoors]);

  const handleCanvasDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (!draggedProduct) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    const newProduct: PlacedProduct = {
      ...draggedProduct,
      id: `${draggedProduct.id}-${Date.now()}`,
      position: point,
      rotation: 0,
      scale: 1,
      category: draggedProduct.category || 'Unknown'
    };
    
    setPlacedProducts(prev => [...prev, newProduct]);
  }, [draggedProduct]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  const handleWallComplete = useCallback((walls: WallSegment[]) => {
    setWallSegments(prev => [...prev, ...walls]);
  }, []);

  const handleRoomUpdate = useCallback((points: Point[]) => {
    if (points.length >= 3) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: `Room ${rooms.length + 1}`,
        points,
        area: 0,
        perimeter: 0
      };
      
      setRooms(prev => [...prev, newRoom]);
    }
    setRoomPoints(points);
  }, [rooms.length]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="relative border rounded-lg overflow-hidden bg-background shadow-lg">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block cursor-crosshair"
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
        style={{ background: 'hsl(var(--background))' }}
      />
    </div>
  );
};

export default CanvasWorkspace;
