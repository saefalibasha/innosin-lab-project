
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas, GRID_SIZES } from '@/utils/measurements';
import { calculateSnapPosition } from '@/utils/objectSnapping';

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
  scale: number;
  currentTool: string;
  showGrid: boolean;
  showRuler: boolean;
  onClearAll: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
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
  scale,
  currentTool,
  showGrid,
  showRuler,
  onClearAll,
  canvasRef: externalCanvasRef
}) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;

  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState<PlacedProduct | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Enhanced drag and drop
  const handleProductDragStart = useCallback((e: React.DragEvent, product: PlacedProduct) => {
    setIsDragging(true);
    setDraggedProduct(product);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - product.position.x,
      y: e.clientY - rect.top - product.position.y
    });
  }, [canvasRef]);

  const handleProductDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedProduct(null);
  }, []);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleProductDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!draggedProduct) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    const snapResult = calculateSnapPosition(
      draggedProduct,
      placedProducts.filter(p => p.id !== draggedProduct.id),
      { x, y },
      scale
    );

    const snappedPosition = snapResult.snapped ? snapResult.position : { x, y };

    setPlacedProducts((prev: PlacedProduct[]) =>
      prev.map(p =>
        p.id === draggedProduct.id
          ? { ...p, position: snappedPosition }
          : p
      )
    );

    setDraggedProduct(null);
  }, [dragOffset, placedProducts, scale, draggedProduct, canvasRef, setPlacedProducts]);

  // Canvas resize observer
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (!canvasRef.current) return;
      for (let entry of entries) {
        setCanvasSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [canvasRef]);

  const handleDoorPlacement = useCallback((e: MouseEvent) => {
    if (currentTool !== 'door') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newDoor: Door = {
      id: `door-${Date.now()}`,
      position: { x, y },
      width: 0.8,
      rotation: 0,
      swingDirection: 'inward',
      type: 'single'
    };

    setDoors((prev: Door[]) => [...prev, newDoor]);
  }, [currentTool, setDoors, canvasRef]);

  const handleProductPlacement = useCallback((e: MouseEvent) => {
    if (currentTool !== 'product') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newProduct: PlacedProduct = {
      id: `product-${Date.now()}`,
      productId: 'default',
      name: 'New Product',
      category: 'furniture',
      position: { x, y },
      rotation: 0,
      dimensions: { length: 500, width: 300, height: 800 },
      color: '#8B4513',
      scale: 1
    };

    setPlacedProducts((prev: PlacedProduct[]) => [...prev, newProduct]);
  }, [currentTool, setPlacedProducts, canvasRef]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      const gridSizePx = mmToCanvas(20, scale);
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.lineWidth = 0.5;

      for (let x = 0; x < canvas.width; x += gridSizePx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSizePx) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw room points
    ctx.fillStyle = '#3b82f6';
    roomPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw wall segments
    wallSegments.forEach(segment => {
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(segment.start.x, segment.start.y);
      ctx.lineTo(segment.end.x, segment.end.y);
      ctx.stroke();
    });

    // Draw placed products
    placedProducts.forEach(product => {
      const width = mmToCanvas(product.dimensions.length, scale);
      const height = mmToCanvas(product.dimensions.width, scale);

      ctx.fillStyle = product.color || '#8B4513';
      ctx.fillRect(product.position.x - width / 2, product.position.y - height / 2, width, height);

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(product.position.x - width / 2, product.position.y - height / 2, width, height);
    });

    // Draw doors
    doors.forEach(door => {
      const doorWidth = mmToCanvas(door.width * 1000, scale);

      ctx.fillStyle = '#8B4513';
      ctx.fillRect(door.position.x - doorWidth / 2, door.position.y - 5, doorWidth, 10);

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(door.position.x - doorWidth / 2, door.position.y - 5, doorWidth, 10);
    });

    // Draw text annotations
    textAnnotations.forEach(annotation => {
      ctx.fillStyle = annotation.color;
      ctx.font = `${annotation.fontSize}px Arial`;
      ctx.fillText(annotation.text, annotation.position.x, annotation.position.y);
    });
  }, [roomPoints, wallSegments, placedProducts, doors, textAnnotations, scale, showGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="border border-gray-300 bg-white cursor-crosshair"
        style={{ cursor: currentTool === 'select' ? 'default' : 'crosshair' }}
        onDrop={handleProductDrop}
        onDragOver={handleCanvasDragOver}
      />
    </div>
  );
};

export default CanvasWorkspace;
