import React, { useState, useRef, useEffect } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room } from '@/types/floorPlanTypes';

interface CanvasWorkspaceProps {
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
  currentMode: string;
  showGrid: boolean;
  showMeasurements: boolean;
  gridSize: number;
  onClearAll: () => void;
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
  textAnnotations,
  setTextAnnotations,
  rooms,
  setRooms,
  scale,
  currentMode: mode,
  showGrid,
  showMeasurements,
  gridSize,
  onClearAll
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < CANVAS_WIDTH; i += gridSize * scale) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
      }

      for (let j = 0; j < CANVAS_HEIGHT; j += gridSize * scale) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(CANVAS_WIDTH, j);
        ctx.stroke();
      }
    }

    // Draw rooms
    rooms.forEach(room => {
      ctx.beginPath();
      room.points.forEach((point, index) => {
        const x = point.x;
        const y = point.y;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fillStyle = room.color || 'rgba(200, 200, 200, 0.2)';
      ctx.fill();

      // Draw room name
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      const roomCenter = room.points.reduce((acc, point) => ({
        x: acc.x + point.x / room.points.length,
        y: acc.y + point.y / room.points.length
      }), { x: 0, y: 0 });
      ctx.fillText(room.name, roomCenter.x, roomCenter.y);
    });

    // Draw walls
    wallSegments.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.strokeStyle = wall.color;
      ctx.lineWidth = wall.thickness;
      ctx.stroke();

      // Draw measurements
      if (showMeasurements) {
        const midX = (wall.start.x + wall.end.x) / 2;
        const midY = (wall.start.y + wall.end.y) / 2;
        const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
        const distance = Math.sqrt(Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.y - wall.start.y, 2));
        const mm = distance / scale;

        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle + Math.PI / 2);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        ctx.fillText(`${mm.toFixed(0)} mm`, 0, -5);
        ctx.restore();
      }
    });

    // Draw doors
    doors.forEach(door => {
      ctx.beginPath();
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 5;
      ctx.arc(door.position.x, door.position.y, door.width * scale, 0, Math.PI / 2);
      ctx.stroke();
    });

    // Draw products
    placedProducts.forEach(product => {
      const img = new Image();
      img.src = product.thumbnail || '/placeholder.svg';
      img.onload = () => {
        ctx.save();
        ctx.translate(product.position.x, product.position.y);
        ctx.rotate(product.rotation);
        ctx.scale(product.scale || 1, product.scale || 1);
        ctx.drawImage(
          img,
          -product.dimensions.length * scale / 2,
          -product.dimensions.width * scale / 2,
          product.dimensions.length * scale,
          product.dimensions.width * scale
        );
        ctx.restore();
      };

      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation);
      ctx.scale(product.scale || 1, product.scale || 1);
      ctx.fillStyle = product.color;
      ctx.fillRect(
        -product.dimensions.length * scale / 2,
        -product.dimensions.width * scale / 2,
        product.dimensions.length * scale,
        product.dimensions.width * scale
      );
      ctx.restore();

      // Draw selection outline
      if (selectedProducts.includes(product.id)) {
        ctx.save();
        ctx.translate(product.position.x, product.position.y);
        ctx.rotate(product.rotation);
        ctx.scale(product.scale || 1, product.scale || 1);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          -product.dimensions.length * scale / 2,
          -product.dimensions.width * scale / 2,
          product.dimensions.length * scale,
          product.dimensions.width * scale
        );
        ctx.restore();
      }
    });

    // Draw text annotations
    textAnnotations.forEach(text => {
      ctx.font = `${text.fontSize}px sans-serif`;
      ctx.fillStyle = text.color;
      ctx.textAlign = 'center';
      ctx.fillText(text.text, text.position.x, text.position.y);
    });
  }, [
    roomPoints,
    wallSegments,
    placedProducts,
    doors,
    textAnnotations,
    rooms,
    scale,
    mode,
    showGrid,
    showMeasurements,
    gridSize,
    selectedProducts
  ]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'select') {
      // Check if a product is clicked
      for (let i = placedProducts.length - 1; i >= 0; i--) {
        const product = placedProducts[i];
        const productX = product.position.x;
        const productY = product.position.y;
        const productWidth = product.dimensions.length * scale;
        const productHeight = product.dimensions.width * scale;

        if (x >= productX - productWidth / 2 &&
            x <= productX + productWidth / 2 &&
            y >= productY - productHeight / 2 &&
            y <= productY + productHeight / 2) {
          setIsDragging(true);
          setDraggedProductId(product.id);
          setDragStart({ x, y });
          return;
        }
      }
    } else if (mode === 'wall') {
      // Start drawing a wall
      const newWall: WallSegment = {
        id: `wall-${Date.now()}`,
        start: { x, y },
        end: { x, y },
        thickness: 10,
        color: '#94a3b8'
      };
      setWallSegments(prev => [...prev, newWall]);
    } else if (mode === 'room') {
      // Start drawing a room
      setRoomPoints(prev => [...prev, { x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && draggedProductId) {
      // Drag the selected product
      setPlacedProducts(prev =>
        prev.map(product => {
          if (product.id === draggedProductId) {
            return {
              ...product,
              position: {
                x: product.position.x + x - dragStart.x,
                y: product.position.y + y - dragStart.y
              }
            };
          }
          return product;
        })
      );
      setDragStart({ x, y });
    } else if (mode === 'wall') {
      // Update the wall end point
      setWallSegments(prev =>
        prev.map(wall => {
          if (prev.length > 0 && wall.id === prev[prev.length - 1].id) {
            return {
              ...wall,
              end: { x, y }
            };
          }
          return wall;
        })
      );
    } else if (mode === 'room') {
      // Update the last room point
      setRoomPoints(prev =>
        prev.map((point, index) => {
          if (index === prev.length - 1) {
            return { x, y };
          }
          return point;
        })
      );
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    setDraggedProductId(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'wall') {
      // Finish drawing the wall
      setWallSegments(prev => {
        if (prev.length > 0) {
          const lastWall = prev[prev.length - 1];
          // Check if the wall is too short
          const distance = Math.sqrt(Math.pow(lastWall.end.x - lastWall.start.x, 2) + Math.pow(lastWall.end.y - lastWall.start.y, 2));
          if (distance < 10) {
            return prev.slice(0, -1); // Remove the last wall
          }
          return prev;
        }
        return prev;
      });
    } else if (mode === 'room') {
      // Finish drawing the room
      if (roomPoints.length > 2) {
        // Calculate area and perimeter
        let area = 0;
        let perimeter = 0;
        for (let i = 0; i < roomPoints.length; i++) {
          const current = roomPoints[i];
          const next = roomPoints[(i + 1) % roomPoints.length];
          area += current.x * next.y - next.x * current.y;
          perimeter += Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));
        }
        area = Math.abs(area / 2) / (scale * scale);
        perimeter = perimeter / scale;

        const newRoom: Room = {
          id: `room-${Date.now()}`,
          name: 'Room',
          points: roomPoints,
          area: area,
          perimeter: perimeter
        };
        setRooms(prev => [...prev, newRoom]);
        setRoomPoints([]);
      } else {
        setRoomPoints([]); // Reset if not enough points
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'door') {
      const newDoor: Door = {
        id: `door-${Date.now()}`,
        position: { x: rect.x, y: rect.y },
        width: 60,
        wallId: undefined,
        isEmbedded: false
      };
      setDoors(prev => [...prev, newDoor]);
    }

    if (mode === 'text') {
      const newText: TextAnnotation = {
        id: `text-${Date.now()}`,
        position: { x, y },
        text: 'New Text',
        fontSize: 16,
        color: '#000000'
      };
      setTextAnnotations(prev => [...prev, newText]);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const productData = e.dataTransfer.getData('product');
    if (!productData) return;

    try {
      const product = JSON.parse(productData);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newProduct: PlacedProduct = {
        id: `product-${Date.now()}`,
        productId: product.id,
        name: product.name,
        category: product.category || 'Unknown',
        position: { x, y },
        rotation: 0,
        dimensions: product.dimensions,
        color: product.color,
        scale: 1,
        modelPath: product.modelPath,
        thumbnail: product.thumbnail,
        description: product.description,
        specifications: product.specifications,
        finishes: product.finishes,
        variants: product.variants
      };

      setPlacedProducts(prev => [...prev, newProduct]);
    } catch (error) {
      console.error('Error parsing dropped product:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ background: '#fff', cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      onDrop={handleCanvasDrop}
      onDragOver={handleDragOver}
    />
  );
};

export default CanvasWorkspace;
