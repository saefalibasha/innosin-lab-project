
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import { mmToCanvas, canvasToMm, formatMeasurement } from '@/utils/measurements';
import { calculateSnapPosition, SnapResult } from '@/utils/objectSnapping';
import DrawingEngine from './DrawingEngine';
import IntelligentMeasurementOverlay from '../IntelligentMeasurementOverlay';

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
  setScale: (scale: number) => void;
  currentMode: DrawingMode;
  showGrid: boolean;
  showMeasurements: boolean;
  gridSize: number;
  setGridSize: (size: number) => void;
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
  setScale,
  currentMode,
  showGrid,
  showMeasurements,
  gridSize,
  setGridSize,
  onClearAll
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [draggedProduct, setDraggedProduct] = useState<PlacedProduct | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // Check if point is inside room boundary
  const isPointInRoom = useCallback((point: Point, room: Room): boolean => {
    if (room.points.length < 3) return false;
    
    let inside = false;
    for (let i = 0, j = room.points.length - 1; i < room.points.length; j = i++) {
      const xi = room.points[i].x;
      const yi = room.points[i].y;
      const xj = room.points[j].x;
      const yj = room.points[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) && 
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }, []);

  // Check if product placement is valid
  const isValidProductPlacement = useCallback((product: PlacedProduct, position: Point): boolean => {
    // Check if product is within any room boundary
    const productInRoom = rooms.some(room => isPointInRoom(position, room));
    if (!productInRoom && rooms.length > 0) return false;

    // Check collision with other products
    const productWidth = mmToCanvas(product.dimensions.length, scale);
    const productHeight = mmToCanvas(product.dimensions.width, scale);
    
    for (const existingProduct of placedProducts) {
      if (existingProduct.id === product.id) continue;
      
      const existingWidth = mmToCanvas(existingProduct.dimensions.length, scale);
      const existingHeight = mmToCanvas(existingProduct.dimensions.width, scale);
      
      const distance = Math.sqrt(
        Math.pow(position.x - existingProduct.position.x, 2) +
        Math.pow(position.y - existingProduct.position.y, 2)
      );
      
      const minDistance = Math.sqrt(
        Math.pow((productWidth + existingWidth) / 2, 2) +
        Math.pow((productHeight + existingHeight) / 2, 2)
      );
      
      if (distance < minDistance) return false;
    }

    return true;
  }, [rooms, placedProducts, scale, isPointInRoom]);

  // Enhanced drawing functions
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    const gridSizePx = mmToCanvas(gridSize, scale * zoom);
    
    // Don't draw grid if it's too small or too large
    if (gridSizePx < 2 || gridSizePx > 200) return;

    ctx.save();
    ctx.translate(pan.x, pan.y);
    
    // Minor grid lines
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 0.5;
    
    const startX = Math.floor(-pan.x / gridSizePx) * gridSizePx;
    const startY = Math.floor(-pan.y / gridSizePx) * gridSizePx;
    const endX = startX + Math.ceil((CANVAS_WIDTH + Math.abs(pan.x)) / gridSizePx) * gridSizePx;
    const endY = startY + Math.ceil((CANVAS_HEIGHT + Math.abs(pan.y)) / gridSizePx) * gridSizePx;
    
    for (let x = startX; x <= endX; x += gridSizePx) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    for (let y = startY; y <= endY; y += gridSizePx) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    ctx.restore();
  }, [showGrid, gridSize, scale, zoom, pan]);

  const drawRooms = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x / zoom, pan.y / zoom);

    rooms.forEach(room => {
      if (room.points.length < 3) return;
      
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 3 / zoom;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      
      ctx.beginPath();
      ctx.moveTo(room.points[0].x, room.points[0].y);
      
      for (let i = 1; i < room.points.length; i++) {
        ctx.lineTo(room.points[i].x, room.points[i].y);
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw room measurements
      if (showMeasurements) {
        for (let i = 0; i < room.points.length; i++) {
          const current = room.points[i];
          const next = room.points[(i + 1) % room.points.length];
          
          const distance = Math.sqrt(
            Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)
          );
          
          const midX = (current.x + next.x) / 2;
          const midY = (current.y + next.y) / 2;
          
          const measurement = formatMeasurement(canvasToMm(distance, scale), {
            unit: 'mm',
            precision: 0,
            showUnit: true
          });
          
          ctx.fillStyle = '#1f2937';
          ctx.font = `${12 / zoom}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(measurement, midX, midY - 5);
        }
      }
    });

    ctx.restore();
  }, [rooms, showMeasurements, scale, zoom, pan]);

  const drawWalls = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x / zoom, pan.y / zoom);

    wallSegments.forEach(wall => {
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = mmToCanvas(wall.thickness || 100, scale) / zoom;
      
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });

    ctx.restore();
  }, [wallSegments, scale, zoom, pan]);

  const drawProducts = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x / zoom, pan.y / zoom);

    placedProducts.forEach(product => {
      const isSelected = selectedProducts.includes(product.id);
      const isValidPlacement = isValidProductPlacement(product, product.position);
      
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation);
      
      const width = mmToCanvas(product.dimensions.length, scale);
      const height = mmToCanvas(product.dimensions.width, scale);
      
      ctx.fillStyle = isValidPlacement 
        ? (isSelected ? 'rgba(59, 130, 246, 0.3)' : product.color || '#6b7280')
        : 'rgba(239, 68, 68, 0.3)';
      ctx.strokeStyle = isValidPlacement
        ? (isSelected ? '#3b82f6' : '#374151')
        : '#ef4444';
      ctx.lineWidth = (isSelected ? 2 : 1) / zoom;
      
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      // Product label
      ctx.fillStyle = '#000';
      ctx.font = `${10 / zoom}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 0, height/2 + 12 / zoom);
      
      // Dimensions label
      if (showMeasurements) {
        const dimText = `${product.dimensions.length}×${product.dimensions.width}mm`;
        ctx.fillStyle = '#666';
        ctx.font = `${8 / zoom}px Arial`;
        ctx.fillText(dimText, 0, height/2 + 24 / zoom);
      }
      
      ctx.restore();
    });

    ctx.restore();
  }, [placedProducts, selectedProducts, showMeasurements, scale, isValidProductPlacement, zoom, pan]);

  const drawDoors = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x / zoom, pan.y / zoom);

    doors.forEach(door => {
      ctx.save();
      ctx.translate(door.position.x, door.position.y);
      ctx.rotate(door.rotation);
      
      const width = mmToCanvas(door.width * 1000, scale);
      
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(-width/2, 0);
      ctx.lineTo(width/2, 0);
      ctx.stroke();
      
      // Door swing arc
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      ctx.arc(door.swingDirection === 'inward' ? -width/2 : width/2, 0, width/2, 0, Math.PI/2);
      ctx.stroke();
      
      ctx.restore();
    });

    ctx.restore();
  }, [doors, scale, zoom, pan]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawGrid(ctx);
    drawRooms(ctx);
    drawWalls(ctx);
    drawProducts(ctx);
    drawDoors(ctx);
  }, [drawGrid, drawRooms, drawWalls, drawProducts, drawDoors]);

  const handleProductDrag = useCallback((product: PlacedProduct, newPosition: Point) => {
    const snapResult = calculateSnapPosition(product, placedProducts, newPosition, scale, gridSize);
    const finalPosition = snapResult.position;
    
    if (isValidProductPlacement(product, finalPosition)) {
      setPlacedProducts((prev: PlacedProduct[]) => prev.map(p => 
        p.id === product.id ? { ...p, position: finalPosition } : p
      ));
    }
  }, [placedProducts, scale, gridSize, isValidProductPlacement, setPlacedProducts]);

  const handleWallComplete = useCallback((wall: WallSegment) => {
    setWallSegments((prev: WallSegment[]) => [...prev, wall]);
  }, [setWallSegments]);

  const handleRoomUpdate = useCallback((points: Point[]) => {
    if (points.length >= 3) {
      let area = 0;
      let perimeter = 0;
      
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
        
        const distance = Math.sqrt(
          Math.pow(points[j].x - points[i].x, 2) + 
          Math.pow(points[j].y - points[i].y, 2)
        );
        perimeter += canvasToMm(distance, scale);
      }
      area = Math.abs(area) / 2;
      const realArea = canvasToMm(area, scale);
      
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: `Room ${rooms.length + 1}`,
        points,
        area: realArea,
        perimeter
      };
      
      setRooms((prev: Room[]) => [...prev, newRoom]);
    }
    setRoomPoints(points);
  }, [rooms.length, scale, setRooms, setRoomPoints]);

  const handleCanvasDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (!draggedProduct) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const point = {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
    
    if (isValidProductPlacement(draggedProduct, point)) {
      const newProduct: PlacedProduct = {
        ...draggedProduct,
        id: `${draggedProduct.id}-${Date.now()}`,
        position: point,
        rotation: 0,
        scale: 1
      };
      
      setPlacedProducts((prev: PlacedProduct[]) => [...prev, newProduct]);
    }
  }, [draggedProduct, isValidProductPlacement, setPlacedProducts, pan, zoom]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY > 0 ? zoom / zoomFactor : zoom * zoomFactor;
    setZoom(Math.max(0.1, Math.min(3, newZoom)));
  }, [zoom]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+click
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="relative border rounded-lg overflow-hidden bg-white shadow-lg">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block cursor-crosshair"
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
      />
      
      <DrawingEngine
        canvasRef={canvasRef}
        currentMode={currentMode}
        scale={scale}
        gridSize={gridSize}
        showGrid={showGrid}
        showMeasurements={showMeasurements}
        zoom={zoom}
        pan={pan}
        onWallComplete={handleWallComplete}
        onRoomUpdate={handleRoomUpdate}
        roomPoints={roomPoints}
        wallSegments={wallSegments}
        rooms={rooms}
      />
      
      <IntelligentMeasurementOverlay
        roomPoints={roomPoints}
        wallSegments={wallSegments}
        scale={scale}
        showMeasurements={showMeasurements}
        canvas={canvasRef.current}
        units="mm"
      />

      {/* Scale and Grid Controls */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm">Scale:</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm">{scale.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Grid:</label>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              className="text-sm border rounded px-1"
            >
              <option value={1}>1mm</option>
              <option value={5}>5mm</option>
              <option value={10}>10mm</option>
              <option value={25}>25mm</option>
              <option value={50}>50mm</option>
              <option value={100}>100mm</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Zoom:</label>
            <span className="text-sm">{zoom.toFixed(1)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCanvasWorkspace;
