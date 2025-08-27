import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import { useSmoothDragging } from '@/hooks/useSmoothDragging';
import { useCollisionDetection } from '@/hooks/useCollisionDetection';
import { mmToCanvas, canvasToMm, formatMeasurement, MeasurementUnit } from '@/utils/measurements';
import { calculateSnapPosition, SnapResult } from '@/utils/objectSnapping';
import { toast } from 'sonner';

interface EnhancedCanvasWorkspaceProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  wallSegments: WallSegment[];
  setWallSegments: (segments: WallSegment[]) => void;
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  doors: Door[];
  setDoors: (doors: Door[]) => void;
  textAnnotations: TextAnnotation[];
  setTextAnnotations: (annotations: TextAnnotation[]) => void;
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  scale: number;
  currentMode: DrawingMode;
  showGrid: boolean;
  showMeasurements: boolean;
  gridSize: number;
  measurementUnit: MeasurementUnit;
  canvasWidth: number;
  canvasHeight: number;
  onClearAll: () => void;
  selectedProducts: string[];
  onProductSelect: (ids: string[]) => void;
  onWallUpdate: (wall: WallSegment) => void;
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
  measurementUnit,
  canvasWidth,
  canvasHeight,
  onClearAll,
  selectedProducts,
  onProductSelect,
  onWallUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [draggedExternalProduct, setDraggedExternalProduct] = useState<any>(null);

  // Enhanced dragging with collision detection
  const {
    dragState,
    startDrag,
    updateDrag,
    endDrag
  } = useSmoothDragging(wallSegments, placedProducts, canvasWidth, canvasHeight, scale);

  const {
    collisionState,
    updateCollisionState,
    clearCollision
  } = useCollisionDetection(wallSegments, placedProducts, canvasWidth, canvasHeight, scale);

  const handleRoomPointAdd = (point: Point) => {
    setRoomPoints(prev => [...prev, point]);
  };

  const handleWallSegmentAdd = (start: Point, end: Point) => {
    const newWall: WallSegment = {
      id: `wall-${Date.now()}`,
      start,
      end,
      thickness: 200,
      color: '#9ca3af',
      type: 'interior'
    };
    setWallSegments(prev => [...prev, newWall]);
  };

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;

    const gridSizePx = mmToCanvas(gridSize, scale);
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < canvasWidth; i += gridSizePx) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasHeight);
      ctx.stroke();
    }

    for (let j = 0; j < canvasHeight; j += gridSizePx) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvasWidth, j);
      ctx.stroke();
    }
  }, [showGrid, gridSize, scale, canvasWidth, canvasHeight]);

  const drawMeasurements = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showMeasurements || roomPoints.length < 2) return;

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#6b7280';

    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      const start = roomPoints[i];
      const end = roomPoints[nextIndex];

      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;

      const distanceMm = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / scale;
      const distanceStr = formatMeasurement(distanceMm, measurementUnit, measurementUnit === 'mm' ? 0 : 2);

      ctx.fillText(distanceStr, midX, midY - 5);
    }
  }, [showMeasurements, roomPoints, scale, measurementUnit]);

  const drawWalls = useCallback((ctx: CanvasRenderingContext2D) => {
    wallSegments.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.strokeStyle = wall.color;
      ctx.lineWidth = mmToCanvas(wall.thickness, scale);
      ctx.lineCap = 'round';
      ctx.stroke();
    });
  }, [wallSegments, scale]);

  const drawRooms = useCallback((ctx: CanvasRenderingContext2D) => {
    rooms.forEach(room => {
      if (room.points.length < 3) return;

      ctx.beginPath();
      ctx.moveTo(room.points[0].x, room.points[0].y);
      room.points.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();

      ctx.fillStyle = room.color || 'rgba(147, 197, 114, 0.2)';
      ctx.fill();

      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [rooms]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Check if clicking on a product for dragging
    const clickedProduct = placedProducts.find(product => {
      const productWidth = mmToCanvas(product.dimensions.length, scale);
      const productHeight = mmToCanvas(product.dimensions.width, scale);
      
      return point.x >= product.position.x - productWidth/2 &&
             point.x <= product.position.x + productWidth/2 &&
             point.y >= product.position.y - productHeight/2 &&
             point.y <= product.position.y + productHeight/2;
    });

    if (clickedProduct && currentMode === 'select') {
      // Start smooth dragging
      startDrag(clickedProduct, point);
      
      // Update selection
      if (!selectedProducts.includes(clickedProduct.id)) {
        onProductSelect([clickedProduct.id]);
      }
    } else {
      setIsDrawing(true);

      switch (currentMode) {
        case 'room':
          handleRoomPointAdd(point);
          break;
        case 'wall':
        case 'interior-wall':
          break;
        default:
          break;
      }
    }
  }, [placedProducts, scale, currentMode, selectedProducts, onProductSelect, startDrag, handleRoomPointAdd]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Handle smooth dragging
    if (dragState.isDragging) {
      updateDrag(point);
    }

    if (isDrawing) {
      switch (currentMode) {
        case 'wall':
        case 'interior-wall':
          // Draw temporary wall segment
          break;
        default:
          break;
      }
    }
  }, [dragState, updateDrag, isDrawing, currentMode]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      const finalPosition = endDrag();
      
      if (finalPosition && dragState.draggedProduct) {
        // Update product position only if valid
        setPlacedProducts(prev => prev.map(product => 
          product.id === dragState.draggedProduct?.id 
            ? { ...product, position: finalPosition }
            : product
        ));

        if (dragState.isValid) {
          toast.success('Product moved successfully');
        } else {
          toast.error('Invalid position - product returned to original location');
        }
      }
      
      clearCollision();
    }
    
    setIsDrawing(false);
  }, [dragState, endDrag, setPlacedProducts, clearCollision]);

  // Enhanced drag and drop from external source
  const handleDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dropPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (draggedExternalProduct) {
      // Check collision before placing
      const tempProduct: PlacedProduct = {
        id: `temp-${Date.now()}`,
        productId: draggedExternalProduct.productId,
        name: draggedExternalProduct.name,
        category: draggedExternalProduct.category,
        position: dropPoint,
        rotation: 0,
        dimensions: draggedExternalProduct.dimensions,
        color: draggedExternalProduct.color || '#3B82F6'
      };

      const { checkProductCollision } = useCollisionDetection(
        wallSegments, 
        placedProducts, 
        canvasWidth, 
        canvasHeight, 
        scale
      );

      const collision = checkProductCollision(tempProduct, dropPoint);

      if (!collision.hasCollision) {
        const newProduct: PlacedProduct = {
          ...tempProduct,
          id: `product-${Date.now()}`
        };

        setPlacedProducts(prev => [...prev, newProduct]);
        toast.success(`${newProduct.name} placed successfully`);
      } else {
        toast.error(`Cannot place product here - ${collision.type} collision detected`);
      }
      
      setDraggedExternalProduct(null);
    }
  }, [draggedExternalProduct, wallSegments, placedProducts, canvasWidth, canvasHeight, scale, setPlacedProducts]);

  const drawDoors = useCallback((ctx: CanvasRenderingContext2D) => {
    doors.forEach(door => {
      const doorWidth = mmToCanvas(door.width, scale);

      ctx.save();
      ctx.translate(door.position.x, door.position.y);
      ctx.rotate(door.rotation || 0);

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;

      // Draw door arc
      ctx.beginPath();
      ctx.arc(0, 0, doorWidth, 0, Math.PI / 2);
      ctx.stroke();

      // Draw door itself
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(doorWidth, 0);
      ctx.stroke();

      ctx.restore();
    });
  }, [doors, scale]);

  const drawTextAnnotations = useCallback((ctx: CanvasRenderingContext2D) => {
    textAnnotations.forEach(annotation => {
      ctx.font = `${annotation.fontSize}px sans-serif`;
      ctx.fillStyle = annotation.color;
      ctx.fillText(annotation.text, annotation.position.x, annotation.position.y);
    });
  }, [textAnnotations]);

  const drawProducts = useCallback((ctx: CanvasRenderingContext2D) => {
    placedProducts.forEach(product => {
      const productWidth = mmToCanvas(product.dimensions.length, scale);
      const productHeight = mmToCanvas(product.dimensions.width, scale);
      
      ctx.save();
      
      // Apply rotation
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation || 0);
      
      // Collision highlighting for dragged product
      if (dragState.isDragging && dragState.draggedProduct?.id === product.id) {
        if (!dragState.isValid) {
          // Red shadow for invalid position
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          // Green shadow for valid position
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        
        // Use dragged position
        ctx.translate(
          dragState.currentPosition.x - product.position.x,
          dragState.currentPosition.y - product.position.y
        );
      }
      
      // Selection highlighting
      if (selectedProducts.includes(product.id)) {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-productWidth/2 - 2, -productHeight/2 - 2, productWidth + 4, productHeight + 4);
        ctx.setLineDash([]);
      }
      
      // Draw product
      ctx.fillStyle = product.color;
      ctx.fillRect(-productWidth/2, -productHeight/2, productWidth, productHeight);
      
      // Product border
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(-productWidth/2, -productHeight/2, productWidth, productHeight);
      
      ctx.restore();
    });
  }, [placedProducts, scale, selectedProducts, dragState]);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Set canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    drawGrid(ctx);
    drawMeasurements(ctx);
    drawWalls(ctx);
    drawRooms(ctx);
    
    // Draw products with collision detection
    drawProducts(ctx);
    
    drawDoors(ctx);
    drawTextAnnotations(ctx);
  }, [canvasWidth, canvasHeight, showGrid, gridSize, scale, roomPoints, wallSegments, placedProducts, doors, textAnnotations, rooms, selectedProducts, drawProducts, dragState, drawGrid, drawMeasurements, drawWalls, drawRooms, drawDoors, drawTextAnnotations]);

  return (
    <div className="relative w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-white">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      />
      
      {/* Collision feedback overlay */}
      {collisionState.hasCollision && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm">
          {collisionState.type === 'boundary' && 'Outside canvas boundaries'}
          {collisionState.type === 'wall' && 'Collision with wall'}
          {collisionState.type === 'furniture' && 'Collision with furniture'}
        </div>
      )}
    </div>
  );
};

export default EnhancedCanvasWorkspace;
