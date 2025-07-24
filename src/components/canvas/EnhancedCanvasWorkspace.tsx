import React, { useRef, useEffect, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import { toast } from 'sonner';
import { formatMeasurement, canvasToMm, mmToCanvas } from '@/utils/measurements';

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

const EnhancedCanvasWorkspace: React.FC<EnhancedCanvasWorkspaceProps> = ({
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
  const tempWallStart = useRef<Point | null>(null);
  const tempRoomPoints = useRef<Point[]>([]);
  const tempWallSegments = useRef<WallSegment[]>([]);
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height, gridSize, scale);
    }

    // Draw existing walls
    wallSegments.forEach(wall => drawWall(ctx, wall, scale));

    // Draw temporary walls
    tempWallSegments.current.forEach(wall => drawWall(ctx, wall, scale));

    // Draw rooms
    rooms.forEach(room => drawRoom(ctx, room, scale));

    // Draw room points
    if (currentMode === 'room') {
      roomPoints.forEach(point => drawPoint(ctx, point, scale));
    }

    // Draw temporary room points
    tempRoomPoints.current.forEach(point => drawPoint(ctx, point, scale));

    // Draw placed products
    placedProducts.forEach(product => drawProduct(ctx, product, scale));

    // Draw doors
    doors.forEach(door => drawDoor(ctx, door, scale));

    // Draw text annotations
    textAnnotations.forEach(text => drawText(ctx, text, scale));

    // Draw temporary wall in wall mode
    if (currentMode === 'wall' && tempWallStart.current) {
      const { x, y } = tempWallStart.current;
      drawLine(ctx, x, y, 0, 0, 'rgba(0, 0, 0, 0.5)', scale);
    }
  }, [roomPoints, wallSegments, placedProducts, doors, textAnnotations, scale, currentMode, showGrid, gridSize, rooms]);

  // Drawing functions
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, gridSize: number, scale: number) => {
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
  };

  const drawWall = (ctx: CanvasRenderingContext2D, wall: WallSegment, scale: number) => {
    ctx.strokeStyle = wall.color;
    ctx.lineWidth = wall.thickness * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(wall.start.x, wall.start.y);
    ctx.lineTo(wall.end.x, wall.end.y);
    ctx.stroke();

    if (showMeasurements) {
      const lengthMm = Math.sqrt(
        Math.pow(canvasToMm(wall.end.x, scale) - canvasToMm(wall.start.x, scale), 2) +
        Math.pow(canvasToMm(wall.end.y, scale) - canvasToMm(wall.start.y, scale), 2)
      );
      const midX = (wall.start.x + wall.end.x) / 2;
      const midY = (wall.start.y + wall.end.y) / 2;
      drawMeasurementText(ctx, midX, midY, formatMeasurement(lengthMm, { unit: 'mm', precision: 0, showUnit: true }), scale);
    }
  };

  const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, scale: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const drawPoint = (ctx: CanvasRenderingContext2D, point: Point, scale: number) => {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3 * scale, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawRoom = (ctx: CanvasRenderingContext2D, room: Room, scale: number) => {
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
  };

  const drawProduct = (ctx: CanvasRenderingContext2D, product: PlacedProduct, scale: number) => {
    const isSelected = selectedProducts.includes(product.id);
    const selectionOffset = isSelected ? 5 : 0;

    ctx.fillStyle = product.color;
    ctx.translate(product.position.x, product.position.y);
    ctx.rotate(product.rotation);
    ctx.fillRect(
      -product.dimensions.length / 2 * scale - selectionOffset,
      -product.dimensions.width / 2 * scale - selectionOffset,
      product.dimensions.length * scale + 2 * selectionOffset,
      product.dimensions.width * scale + 2 * selectionOffset
    );
    ctx.rotate(-product.rotation);
    ctx.translate(-product.position.x, -product.position.y);

    // Draw product name
    ctx.fillStyle = 'black';
    ctx.font = `${12 * scale}px sans-serif`;
    ctx.fillText(product.name, product.position.x + 10 * scale, product.position.y + 5 * scale);
  };

  const drawDoor = (ctx: CanvasRenderingContext2D, door: Door, scale: number) => {
    ctx.strokeStyle = 'brown';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(door.position.x, door.position.y, door.width / 2 * scale, 0, Math.PI);
    ctx.stroke();
  };

  const drawText = (ctx: CanvasRenderingContext2D, text: TextAnnotation, scale: number) => {
    ctx.fillStyle = text.color;
    ctx.font = `${text.fontSize * scale}px sans-serif`;
    ctx.fillText(text.text, text.position.x, text.position.y);
  };

  const drawMeasurementText = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, scale: number) => {
    ctx.fillStyle = 'black';
    ctx.font = `${10 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  };

  // Event handlers
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentMode === 'wall') {
      if (!tempWallStart.current) {
        tempWallStart.current = { x, y };
      } else {
        const newWall: WallSegment = {
          id: `wall-${Date.now()}`,
          start: tempWallStart.current,
          end: { x, y },
          thickness: 100,
          color: 'black',
          type: WallType.INTERIOR
        };
        setWallSegments(prev => [...prev, newWall]);
        tempWallStart.current = null;
      }
    }

    if (currentMode === 'room') {
      tempRoomPoints.current.push({ x, y });
      setRoomPoints(tempRoomPoints.current);
    }

    if (currentMode === 'door') {
      const newDoor: Door = {
        id: `door-${Date.now()}`,
        position: { x, y },
        width: 60,
        wallId: undefined,
        isEmbedded: false
      };
      setDoors(prev => [...prev, newDoor]);
    }

    if (currentMode === 'text') {
      const newText: TextAnnotation = {
        id: `text-${Date.now()}`,
        position: { x, y },
        text: 'New Text',
        fontSize: 12,
        color: 'black'
      };
      setTextAnnotations(prev => [...prev, newText]);
    }

    if (currentMode === 'select') {
      // Check if a product was clicked
      let clickedProduct = null;
      for (let i = placedProducts.length - 1; i >= 0; i--) {
        const product = placedProducts[i];
        const halfLength = product.dimensions.length / 2 * scale;
        const halfWidth = product.dimensions.width / 2 * scale;

        if (x >= product.position.x - halfLength && x <= product.position.x + halfLength &&
            y >= product.position.y - halfWidth && y <= product.position.y + halfWidth) {
          clickedProduct = product;
          break;
        }
      }

      if (clickedProduct) {
        const multiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
        handleProductSelect(clickedProduct.id, multiSelect);
      } else {
        handleProductSelect('');
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentMode === 'wall' && tempWallStart.current) {
      // Clear temporary walls array
      tempWallSegments.current = [];

      // Create a temporary wall segment
      const newWall: WallSegment = {
        id: 'temp-wall',
        start: tempWallStart.current,
        end: { x, y },
        thickness: 100,
        color: 'rgba(0, 0, 0, 0.5)',
        type: WallType.INTERIOR
      };
      tempWallSegments.current.push(newWall);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

      setPlacedProducts((prev: PlacedProduct[]) => [...prev, newProduct]);
    } catch (error) {
      console.error('Error parsing dropped product:', error);
    }
  };

  const handleWallComplete = (wall: WallSegment) => {
    setWallSegments((prev: WallSegment[]) => [...prev, wall]);
  };

  const handleRoomComplete = (room: Room) => {
    setRooms((prev: Room[]) => [...prev, room]);
  };

  const handleProductSelect = useCallback((productId: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedProducts(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    } else {
      setSelectedProducts([productId]);
    }
  }, []);

  return (
    <div
      className="relative w-full h-full"
      onDrop={handleCanvasDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        className="w-full h-full bg-white cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      />
    </div>
  );
};

export default EnhancedCanvasWorkspace;
