
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas, GRID_SIZES } from '@/utils/measurements';
import { calculateSnapPosition } from '@/utils/objectSnapping';
import PolylineWallEngine from './PolylineWallEngine';
import WallRenderer from './WallRenderer';
import GridSystem from './GridSystem';
import DrawingEngine from './DrawingEngine';

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
  const [selectedWalls, setSelectedWalls] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      const gridRenderer = GridSystem({ 
        gridSize,
        scale, 
        zoom, 
        showMajorLines: true, 
        showMinorLines: true, 
        opacity: 0.3 
      });
      gridRenderer.renderGrid(ctx, canvas.width, canvas.height);
    }

    // Draw walls using vector-based renderer
    const wallRenderer = WallRenderer({ 
      walls: wallSegments, 
      scale, 
      zoom, 
      selectedWalls, 
      onWallSelect: setSelectedWalls,
      showThickness: zoom > 1.5
    });
    wallRenderer.renderWalls(ctx);

    // Draw rooms
    if (rooms.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      rooms.forEach(room => {
        if (room.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(room.points[0].x, room.points[0].y);
          for (let i = 1; i < room.points.length; i++) {
            ctx.lineTo(room.points[i].x, room.points[i].y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      });

      ctx.setLineDash([]);
    }

    // Draw placed products
    placedProducts.forEach(product => {
      const width = mmToCanvas(product.dimensions.length, scale);
      const height = mmToCanvas(product.dimensions.width, scale);
      
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation);
      
      ctx.fillStyle = product.color || '#8B4513';
      ctx.fillRect(-width / 2, -height / 2, width, height);
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
      
      ctx.restore();
    });

    // Draw doors
    doors.forEach(door => {
      const doorWidth = mmToCanvas(door.width * 1000, scale);
      
      ctx.save();
      ctx.translate(door.position.x, door.position.y);
      ctx.rotate(door.rotation);
      
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-doorWidth / 2, -5, doorWidth, 10);
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(-doorWidth / 2, -5, doorWidth, 10);
      
      ctx.restore();
    });

    // Draw text annotations
    textAnnotations.forEach(annotation => {
      ctx.fillStyle = annotation.color;
      ctx.font = `${annotation.fontSize}px Arial`;
      ctx.fillText(annotation.text, annotation.position.x, annotation.position.y);
    });

  }, [wallSegments, rooms, placedProducts, doors, textAnnotations, scale, zoom, showGrid, gridSize, selectedWalls]);

  const handleCanvasClick = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = { x, y };

    if (currentMode === 'product') {
      const newProduct: PlacedProduct = {
        id: `product-${Date.now()}`,
        productId: 'default',
        name: 'New Product',
        category: 'furniture',
        position: point,
        rotation: 0,
        dimensions: { length: 500, width: 300, height: 800 },
        color: '#8B4513',
        scale: 1
      };
      
      setPlacedProducts((prev: PlacedProduct[]) => [...prev, newProduct]);
    } else if (currentMode === 'door') {
      const newDoor: Door = {
        id: `door-${Date.now()}`,
        position: point,
        width: 0.8,
        rotation: 0,
        swingDirection: 'inward',
        type: 'single'
      };
      
      setDoors((prev: Door[]) => [...prev, newDoor]);
    }
  }, [currentMode, setPlacedProducts, setDoors]);

  const handleWallComplete = useCallback((wall: WallSegment) => {
    setWallSegments((prev: WallSegment[]) => [...prev, wall]);
  }, [setWallSegments]);

  const handleRoomUpdate = useCallback((points: Point[]) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: `Room ${rooms.length + 1}`,
      points: points,
      area: 0,
      perimeter: 0
    };
    
    setRooms((prev: Room[]) => [...prev, newRoom]);
  }, [rooms.length, setRooms]);

  const handleProductDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
      const productData = JSON.parse(e.dataTransfer?.getData('application/json') || '{}');
      const newProduct: PlacedProduct = {
        id: `product-${Date.now()}`,
        productId: productData.id,
        name: productData.name,
        category: productData.category || 'furniture',
        position: { x, y },
        rotation: 0,
        dimensions: productData.dimensions,
        color: productData.color || '#8B4513',
        scale: 1
      };
      
      setPlacedProducts((prev: PlacedProduct[]) => [...prev, newProduct]);
    } catch (error) {
      console.error('Error dropping product:', error);
    }
  }, [setPlacedProducts]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => handleCanvasClick(e);
    const handleDrop = (e: DragEvent) => handleProductDrop(e);
    const handleDragOver = (e: DragEvent) => e.preventDefault();

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('dragover', handleDragOver);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('drop', handleDrop);
      canvas.removeEventListener('dragover', handleDragOver);
    };
  }, [handleCanvasClick, handleProductDrop]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="border border-gray-300 bg-white"
        style={{ cursor: currentMode === 'select' ? 'default' : 'crosshair' }}
      />
      
      {/* Enhanced Drawing Engine for Wall Mode */}
      {currentMode === 'wall' && (
        <PolylineWallEngine
          canvasRef={canvasRef}
          scale={scale}
          gridSize={gridSize}
          showGrid={showGrid}
          showMeasurements={showMeasurements}
          onWallComplete={handleWallComplete}
          wallSegments={wallSegments}
          zoom={zoom}
        />
      )}
      
      {/* Drawing Engine for Room Mode */}
      {currentMode === 'room' && (
        <DrawingEngine
          canvasRef={canvasRef}
          currentMode={currentMode}
          scale={scale}
          gridSize={gridSize}
          showGrid={showGrid}
          showMeasurements={showMeasurements}
          onWallComplete={handleWallComplete}
          onRoomUpdate={handleRoomUpdate}
          roomPoints={roomPoints}
          wallSegments={wallSegments}
          rooms={rooms}
        />
      )}
    </div>
  );
};

export default EnhancedCanvasWorkspace;
