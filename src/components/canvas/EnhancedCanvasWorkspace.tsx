
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode, SnapSettings, GridSettings, ViewportSettings } from '@/types/floorPlanTypes';
import { mmToCanvas, canvasToMm, formatMeasurement } from '@/utils/measurements';
import { SnapSystem } from '@/utils/snapSystem';
import DrawingEngine from './DrawingEngine';
import GridSystem from './GridSystem';
import PolylineWallDrawing from './PolylineWallDrawing';
import WallRenderer from './WallRenderer';
import WallThicknessControl from './WallThicknessControl';

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
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedWalls, setSelectedWalls] = useState<string[]>([]);
  const [draggedProduct, setDraggedProduct] = useState<PlacedProduct | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [wallThickness, setWallThickness] = useState(100); // Default 100mm
  
  // Enhanced viewport state
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    showRulers: true,
    showMeasurements: true
  });

  // Enhanced grid settings
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    size: gridSize,
    showMajorLines: true,
    showMinorLines: true,
    opacity: 0.3
  });

  // Enhanced snap settings
  const [snapSettings, setSnapSettings] = useState<SnapSettings>({
    enabled: true,
    strength: 'medium',
    snapToGrid: true,
    snapToObjects: true,
    snapToAlignment: true,
    snapToEndpoints: true
  });

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // Initialize snap system
  const snapSystem = new SnapSystem(snapSettings, gridSettings.size, scale);

  // Initialize wall renderer
  const wallRenderer = WallRenderer({
    walls: wallSegments,
    scale,
    zoom: viewportSettings.zoom,
    selectedWalls,
    onWallSelect: (wallId: string) => {
      setSelectedWalls(prev => 
        prev.includes(wallId) 
          ? prev.filter(id => id !== wallId)
          : [...prev, wallId]
      );
    },
    showThickness: viewportSettings.zoom > 1.5
  });

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
  const drawRooms = useCallback((ctx: CanvasRenderingContext2D) => {
    rooms.forEach(room => {
      if (room.points.length < 3) return;
      
      ctx.strokeStyle = 'hsl(var(--foreground))';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'hsl(var(--primary) / 0.05)';
      
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
          
          ctx.fillStyle = 'hsl(var(--foreground))';
          ctx.font = '12px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(measurement, midX, midY - 5);
        }
      }
    });
  }, [rooms, showMeasurements, scale]);

  const drawProducts = useCallback((ctx: CanvasRenderingContext2D) => {
    placedProducts.forEach(product => {
      const isSelected = selectedProducts.includes(product.id);
      const isValidPlacement = isValidProductPlacement(product, product.position);
      
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation);
      
      const width = mmToCanvas(product.dimensions.length, scale);
      const height = mmToCanvas(product.dimensions.width, scale);
      
      ctx.fillStyle = isValidPlacement 
        ? (isSelected ? 'hsl(var(--primary) / 0.3)' : product.color || 'hsl(var(--muted))')
        : 'hsl(var(--destructive) / 0.3)';
      ctx.strokeStyle = isValidPlacement
        ? (isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))')
        : 'hsl(var(--destructive))';
      ctx.lineWidth = isSelected ? 2 : 1;
      
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      // Product label
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, 0, height/2 + 12);
      
      // Dimensions label
      if (showMeasurements) {
        const dimText = `${product.dimensions.length}×${product.dimensions.width}mm`;
        ctx.fillStyle = 'hsl(var(--muted-foreground))';
        ctx.font = '8px system-ui';
        ctx.fillText(dimText, 0, height/2 + 24);
      }
      
      ctx.restore();
    });
  }, [placedProducts, selectedProducts, showMeasurements, scale, isValidProductPlacement]);

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
      
      // Door swing arc
      ctx.strokeStyle = 'hsl(var(--destructive))';
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
    ctx.scale(viewportSettings.zoom, viewportSettings.zoom);
    ctx.translate(viewportSettings.pan.x / viewportSettings.zoom, viewportSettings.pan.y / viewportSettings.zoom);
    
    drawRooms(ctx);
    wallRenderer.renderWalls(ctx);
    drawProducts(ctx);
    drawDoors(ctx);
    
    ctx.restore();
  }, [viewportSettings, drawRooms, wallRenderer, drawProducts, drawDoors]);

  // Enhanced product drag handling with snap system
  const handleProductDrag = useCallback((product: PlacedProduct, newPosition: Point) => {
    const snapResult = snapSystem.snapPoint(newPosition, placedProducts, wallSegments, rooms);
    const finalPosition = snapResult.point;
    
    if (isValidProductPlacement(product, finalPosition)) {
      setPlacedProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, position: finalPosition } : p
      ));
    }
  }, [placedProducts, wallSegments, rooms, isValidProductPlacement, snapSystem, setPlacedProducts]);

  const handleWallComplete = useCallback((walls: WallSegment[]) => {
    setWallSegments(prev => [...prev, ...walls]);
  }, [setWallSegments]);

  const handleRoomUpdate = useCallback((points: Point[]) => {
    if (points.length >= 3) {
      // Calculate area and perimeter
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
      
      setRooms(prev => [...prev, newRoom]);
    }
    setRoomPoints(points);
  }, [rooms.length, scale, setRooms, setRoomPoints]);

  const handleCanvasDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (!draggedProduct) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    const snapResult = snapSystem.snapPoint(rawPoint, placedProducts, wallSegments, rooms);
    const finalPoint = snapResult.point;
    
    if (isValidProductPlacement(draggedProduct, finalPoint)) {
      const newProduct: PlacedProduct = {
        ...draggedProduct,
        id: `${draggedProduct.id}-${Date.now()}`,
        position: finalPoint,
        rotation: 0,
        scale: 1
      };
      
      setPlacedProducts(prev => [...prev, newProduct]);
    }
  }, [draggedProduct, isValidProductPlacement, placedProducts, wallSegments, rooms, snapSystem, setPlacedProducts]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY > 0 ? viewportSettings.zoom / zoomFactor : viewportSettings.zoom * zoomFactor;
    setViewportSettings(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, newZoom))
    }));
  }, [viewportSettings.zoom]);

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

  // Update grid settings when props change
  useEffect(() => {
    setGridSettings(prev => ({ ...prev, size: gridSize }));
  }, [gridSize]);

  return (
    <div className="relative">
      {/* Wall thickness control */}
      {currentMode === 'wall' && (
        <div className="absolute top-4 left-4 z-30">
          <WallThicknessControl
            thickness={wallThickness}
            onChange={setWallThickness}
          />
        </div>
      )}

      {/* Canvas container */}
      <div className="relative border rounded-lg overflow-hidden bg-background shadow-lg">
        {/* Canvas background */}
        <div className="absolute inset-0 bg-background" />
        
        {/* Grid system */}
        {showGrid && (
          <GridSystem
            canvasWidth={CANVAS_WIDTH}
            canvasHeight={CANVAS_HEIGHT}
            gridSettings={gridSettings}
            viewportSettings={viewportSettings}
            showRulers={viewportSettings.showRulers}
          />
        )}
        
        {/* Main canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block cursor-crosshair relative z-10"
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          style={{ background: 'hsl(var(--background))' }}
        />
        
        {/* Polyline wall drawing */}
        {currentMode === 'wall' && (
          <PolylineWallDrawing
            canvasRef={canvasRef}
            isActive={currentMode === 'wall'}
            scale={scale}
            gridSize={gridSize}
            snapSystem={snapSystem}
            onWallComplete={handleWallComplete}
            existingWalls={wallSegments}
            wallThickness={wallThickness}
            showMeasurements={showMeasurements}
          />
        )}
        
        {/* Drawing engine for other modes */}
        {currentMode !== 'wall' && (
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
    </div>
  );
};

export default EnhancedCanvasWorkspace;
