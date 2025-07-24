
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment } from '@/types/floorPlanTypes';
import { mmToCanvas, canvasToMm, formatMeasurement } from '@/utils/measurements';
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
  scale: number;
  currentTool: string;
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
  scale,
  currentTool,
  showGrid,
  showMeasurements,
  gridSize,
  onClearAll
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [draggedProduct, setDraggedProduct] = useState<any>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // Drawing functions with mm precision
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 0.5;
    
    const gridSizePx = mmToCanvas(gridSize, scale);
    
    // Major grid lines (every 10th line)
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSizePx * 10) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSizePx * 10) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    
    // Minor grid lines
    ctx.strokeStyle = '#f9fafb';
    ctx.lineWidth = 0.5;
    
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

  const drawRoom = useCallback((ctx: CanvasRenderingContext2D) => {
    if (roomPoints.length < 2) return;
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
    
    ctx.beginPath();
    ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
    
    for (let i = 1; i < roomPoints.length; i++) {
      ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
    }
    
    if (roomPoints.length > 2) {
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.stroke();

    // Draw room dimension labels
    if (showMeasurements) {
      for (let i = 0; i < roomPoints.length; i++) {
        const current = roomPoints[i];
        const next = roomPoints[(i + 1) % roomPoints.length];
        
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
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(measurement, midX, midY - 5);
      }
    }
  }, [roomPoints, showMeasurements, scale]);

  const drawWalls = useCallback((ctx: CanvasRenderingContext2D) => {
    wallSegments.forEach(wall => {
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = mmToCanvas(wall.thickness || 100, scale);
      
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });
  }, [wallSegments, scale]);

  const drawProducts = useCallback((ctx: CanvasRenderingContext2D) => {
    placedProducts.forEach(product => {
      const isSelected = selectedProducts.includes(product.id);
      
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation);
      
      // Convert dimensions from mm to canvas pixels
      const width = mmToCanvas(product.dimensions.length, scale);
      const height = mmToCanvas(product.dimensions.width, scale);
      
      ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.3)' : product.color || '#6b7280';
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#374151';
      ctx.lineWidth = isSelected ? 2 : 1;
      
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      // Product label
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 0, height/2 + 12);
      
      // Dimensions label
      if (showMeasurements) {
        const dimText = `${product.dimensions.length}×${product.dimensions.width}mm`;
        ctx.fillStyle = '#666';
        ctx.font = '8px Arial';
        ctx.fillText(dimText, 0, height/2 + 24);
      }
      
      ctx.restore();
    });
  }, [placedProducts, selectedProducts, showMeasurements, scale]);

  const drawDoors = useCallback((ctx: CanvasRenderingContext2D) => {
    doors.forEach(door => {
      ctx.save();
      ctx.translate(door.position.x, door.position.y);
      ctx.rotate(door.rotation);
      
      const width = mmToCanvas(door.width * 1000, scale); // Convert m to mm
      
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-width/2, 0);
      ctx.lineTo(width/2, 0);
      ctx.stroke();
      
      // Door swing arc
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(door.swingDirection === 'inward' ? -width/2 : width/2, 0, width/2, 0, Math.PI/2);
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
    
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(offset.x / zoom, offset.y / zoom);
    
    drawGrid(ctx);
    drawRoom(ctx);
    drawWalls(ctx);
    drawProducts(ctx);
    drawDoors(ctx);
    
    ctx.restore();
  }, [zoom, offset, drawGrid, drawRoom, drawWalls, drawProducts, drawDoors]);

  const handleWallComplete = useCallback((wall: WallSegment) => {
    setWallSegments(prev => [...prev, wall]);
  }, [setWallSegments]);

  const handlePointAdd = useCallback((point: Point) => {
    if (currentTool === 'wall') {
      setRoomPoints(prev => [...prev, point]);
    }
  }, [currentTool, setRoomPoints]);

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
      scale: 1
    };
    
    setPlacedProducts(prev => [...prev, newProduct]);
    setDraggedProduct(null);
  }, [draggedProduct, setPlacedProducts]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY > 0 ? zoom / zoomFactor : zoom * zoomFactor;
    setZoom(Math.max(0.1, Math.min(3, newZoom)));
  }, [zoom]);

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

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
        isDrawing={isDrawing}
        currentTool={currentTool}
        scale={scale}
        gridSize={gridSize}
        showGrid={showGrid}
        showMeasurements={showMeasurements}
        onWallComplete={handleWallComplete}
        onPointAdd={handlePointAdd}
        roomPoints={roomPoints}
        wallSegments={wallSegments}
      />
      
      <IntelligentMeasurementOverlay
        roomPoints={roomPoints}
        wallSegments={wallSegments}
        scale={scale}
        showMeasurements={showMeasurements}
        canvas={canvasRef.current}
        units="mm"
      />
    </div>
  );
};

export default EnhancedCanvasWorkspace;
