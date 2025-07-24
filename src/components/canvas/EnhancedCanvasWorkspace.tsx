
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Point, WallSegment, Room, Door, TextAnnotation, PlacedProduct, WallType } from '@/types/floorPlanTypes';

interface EnhancedCanvasWorkspaceProps {
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
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  onWallComplete?: (wall: WallSegment) => void;
  onRoomComplete?: (room: Room) => void;
  scale?: number;
  gridSize?: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const EnhancedCanvasWorkspace: React.FC<EnhancedCanvasWorkspaceProps> = ({
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
  placedProducts,
  setPlacedProducts,
  onWallComplete,
  onRoomComplete,
  scale = 1,
  gridSize = 10,
  canvasRef
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [tempPoints, setTempPoints] = useState<Point[]>([]);
  const [draggedProduct, setDraggedProduct] = useState<PlacedProduct | null>(null);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;

    const gridSpacing = gridSize * scale;

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
    ctx.lineWidth = wall.thickness * scale;
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
    ctx.font = `${14 * scale}px sans-serif`;
    if (room.points.length > 0) {
      const centroid = room.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      const textX = centroid.x / room.points.length;
      const textY = centroid.y / room.points.length;
      ctx.fillText(room.name, textX, textY);
    }
  }, [scale]);

  const drawDoor = useCallback((ctx: CanvasRenderingContext2D, door: Door) => {
    ctx.strokeStyle = 'brown';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(door.position.x, door.position.y, door.width / 2 * scale, 0, Math.PI);
    ctx.stroke();
  }, [scale]);

  const drawText = useCallback((ctx: CanvasRenderingContext2D, text: TextAnnotation) => {
    ctx.fillStyle = text.color;
    ctx.font = `${text.fontSize * scale}px sans-serif`;
    ctx.fillText(text.text, text.position.x, text.position.y);
  }, [scale]);

  const drawProduct = useCallback((ctx: CanvasRenderingContext2D, product: PlacedProduct) => {
    // Draw product as a rectangle for now
    ctx.fillStyle = product.color || 'rgba(0, 100, 200, 0.3)';
    ctx.strokeStyle = product.color || 'rgba(0, 100, 200, 0.8)';
    ctx.lineWidth = 2;
    
    const width = product.dimensions.length * scale;
    const height = product.dimensions.width * scale;
    
    ctx.fillRect(product.position.x - width/2, product.position.y - height/2, width, height);
    ctx.strokeRect(product.position.x - width/2, product.position.y - height/2, width, height);
    
    // Draw product name
    ctx.fillStyle = 'black';
    ctx.font = `${12 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(product.name, product.position.x, product.position.y);
    ctx.textAlign = 'left';
  }, [scale]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentMode === 'wall') {
      if (!isDrawing) {
        setStartPoint({ x, y });
        setIsDrawing(true);
        setTempPoints([{ x, y }]);
      } else {
        setTempPoints(prev => [...prev, { x, y }]);
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
      setDoors([...doors, newDoor]);
    }

    if (currentMode === 'text') {
      const newText: TextAnnotation = {
        id: `text-${Date.now()}`,
        position: { x, y },
        text: 'New Text',
        fontSize: 12,
        color: 'black'
      };
      setTextAnnotations([...textAnnotations, newText]);
    }
  }, [currentMode, isDrawing, setDoors, setTextAnnotations, canvasRef, doors, textAnnotations]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentMode === 'wall' && isDrawing && startPoint) {
      // Optionally update a temporary wall for preview
    }
  }, [currentMode, isDrawing, startPoint]);

  const finishWallDrawing = useCallback(() => {
    if (startPoint && tempPoints.length > 0) {
      const lastPoint = tempPoints[tempPoints.length - 1];
      const newWall: WallSegment = {
        id: `wall-${Date.now()}`,
        start: startPoint,
        end: lastPoint,
        thickness: 10,
        color: '#000000',
        type: WallType.INTERIOR
      };
      
      setWallSegments([...wallSegments, newWall]);
      if (onWallComplete) onWallComplete(newWall);
      
      setStartPoint(null);
      setTempPoints([]);
      setIsDrawing(false);
    }
  }, [startPoint, tempPoints, setWallSegments, onWallComplete, wallSegments]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && currentMode === 'wall') {
      finishWallDrawing();
    }
  }, [currentMode, finishWallDrawing]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const productData = e.dataTransfer.getData('application/json');
    if (productData) {
      try {
        const product = JSON.parse(productData);
        const newProduct: PlacedProduct = {
          id: `placed-${Date.now()}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          position: { x, y },
          rotation: 0,
          dimensions: product.dimensions || { length: 100, width: 50, height: 30 },
          color: product.color || '#4A90E2',
          scale: 1,
          modelPath: product.modelPath,
          thumbnail: product.thumbnail,
          description: product.description,
          specifications: product.specifications,
          finishes: product.finishes,
          variants: product.variants
        };
        setPlacedProducts([...placedProducts, newProduct]);
      } catch (error) {
        console.error('Error parsing dropped product data:', error);
      }
    }
  }, [canvasRef, setPlacedProducts, placedProducts]);

  const handleProductDragStart = useCallback((e: React.DragEvent<HTMLCanvasElement>, product: PlacedProduct) => {
    setDraggedProduct(product);
  }, []);

  const handleProductDragEnd = useCallback(() => {
    setDraggedProduct(null);
  }, []);

  const handleProductMove = useCallback((productId: string, newPosition: Point) => {
    setPlacedProducts(placedProducts.map(p => 
      p.id === productId ? { ...p, position: newPosition } : p
    ));
  }, [placedProducts, setPlacedProducts]);

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

    // Draw placed products
    placedProducts.forEach(product => drawProduct(ctx, product));
  }, [drawGrid, drawWall, drawRoom, drawDoor, drawText, drawProduct, wallSegments, rooms, doors, textAnnotations, placedProducts, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={800}
      className="w-full h-full bg-white cursor-crosshair"
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    />
  );
};

export default EnhancedCanvasWorkspace;
