
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, WallSegment, WallType, WallDrawingState } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas } from '@/utils/measurements';
import { SnapSystem } from '@/utils/snapSystem';

interface PolylineWallDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  scale: number;
  gridSize: number;
  snapSystem: SnapSystem;
  onWallComplete: (walls: WallSegment[]) => void;
  existingWalls: WallSegment[];
  wallThickness: number;
  showMeasurements: boolean;
}

const PolylineWallDrawing: React.FC<PolylineWallDrawingProps> = ({
  canvasRef,
  isActive,
  scale,
  gridSize,
  snapSystem,
  onWallComplete,
  existingWalls,
  wallThickness,
  showMeasurements
}) => {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [drawingState, setDrawingState] = useState<WallDrawingState>({
    isDrawing: false,
    points: [],
    currentPoint: null,
    thickness: wallThickness,
    wallType: WallType.INTERIOR
  });

  // Calculate distance and angle between two points
  const calculateMeasurements = useCallback((start: Point, end: Point) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    return {
      distance: canvasToMm(distance, scale),
      angle: angle
    };
  }, [scale]);

  // Draw the polyline preview
  const drawPolylinePreview = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!drawingState.isDrawing || drawingState.points.length === 0) return;

    // Draw completed segments
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    for (let i = 0; i < drawingState.points.length - 1; i++) {
      const start = drawingState.points[i];
      const end = drawingState.points[i + 1];
      
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Draw measurements
      if (showMeasurements) {
        const measurements = calculateMeasurements(start, end);
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        const measurement = formatMeasurement(measurements.distance, {
          unit: 'mm',
          precision: 0,
          showUnit: true
        });
        
        // Background for measurement text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const textMetrics = ctx.measureText(measurement);
        ctx.fillRect(midX - textMetrics.width / 2 - 4, midY - 15, textMetrics.width + 8, 20);
        
        ctx.fillStyle = 'hsl(var(--foreground))';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(measurement, midX, midY - 5);
      }
    }

    // Draw current segment preview
    if (drawingState.currentPoint && drawingState.points.length > 0) {
      const lastPoint = drawingState.points[drawingState.points.length - 1];
      
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(drawingState.currentPoint.x, drawingState.currentPoint.y);
      ctx.stroke();
      
      ctx.setLineDash([]);

      // Draw current segment measurements
      if (showMeasurements) {
        const measurements = calculateMeasurements(lastPoint, drawingState.currentPoint);
        const midX = (lastPoint.x + drawingState.currentPoint.x) / 2;
        const midY = (lastPoint.y + drawingState.currentPoint.y) / 2;
        
        const measurement = formatMeasurement(measurements.distance, {
          unit: 'mm',
          precision: 0,
          showUnit: true
        });
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const textMetrics = ctx.measureText(measurement);
        ctx.fillRect(midX - textMetrics.width / 2 - 4, midY - 15, textMetrics.width + 8, 20);
        
        ctx.fillStyle = 'hsl(var(--primary))';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(measurement, midX, midY - 5);
        ctx.fillText(`${measurements.angle.toFixed(1)}°`, midX, midY + 10);
      }
    }

    // Draw points
    drawingState.points.forEach((point, index) => {
      ctx.fillStyle = index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary))';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw connection indicator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // Draw snap indicators
    if (drawingState.currentPoint) {
      const snapResult = snapSystem.snapPoint(
        drawingState.currentPoint,
        [],
        existingWalls,
        []
      );
      
      if (snapResult.snapped) {
        ctx.fillStyle = 'hsl(var(--primary))';
        ctx.beginPath();
        ctx.arc(snapResult.point.x, snapResult.point.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw snap cross
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(snapResult.point.x - 6, snapResult.point.y);
        ctx.lineTo(snapResult.point.x + 6, snapResult.point.y);
        ctx.moveTo(snapResult.point.x, snapResult.point.y - 6);
        ctx.lineTo(snapResult.point.x, snapResult.point.y + 6);
        ctx.stroke();
      }
    }
  }, [drawingState, showMeasurements, calculateMeasurements, snapSystem, existingWalls]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isActive || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const snapResult = snapSystem.snapPoint(rawPoint, [], existingWalls, []);
    const finalPoint = snapResult.point;

    setDrawingState(prev => ({
      ...prev,
      currentPoint: finalPoint
    }));
  }, [isActive, canvasRef, snapSystem, existingWalls]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!isActive || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const snapResult = snapSystem.snapPoint(rawPoint, [], existingWalls, []);
    const finalPoint = snapResult.point;

    if (!drawingState.isDrawing) {
      // Start drawing
      setDrawingState(prev => ({
        ...prev,
        isDrawing: true,
        points: [finalPoint],
        currentPoint: finalPoint
      }));
    } else {
      // Add point to polyline
      setDrawingState(prev => ({
        ...prev,
        points: [...prev.points, finalPoint]
      }));
    }
  }, [isActive, canvasRef, snapSystem, existingWalls, drawingState.isDrawing]);

  const handleDoubleClick = useCallback((e: MouseEvent) => {
    if (!isActive || !drawingState.isDrawing) return;
    
    e.preventDefault();
    finishWall();
  }, [isActive, drawingState.isDrawing]);

  const finishWall = useCallback(() => {
    if (drawingState.points.length < 2) return;

    const walls: WallSegment[] = [];
    for (let i = 0; i < drawingState.points.length - 1; i++) {
      const wall: WallSegment = {
        id: `wall-${Date.now()}-${i}`,
        start: drawingState.points[i],
        end: drawingState.points[i + 1],
        type: drawingState.wallType,
        thickness: drawingState.thickness,
        connectedWalls: []
      };
      walls.push(wall);
    }

    onWallComplete(walls);
    
    // Reset drawing state
    setDrawingState({
      isDrawing: false,
      points: [],
      currentPoint: null,
      thickness: wallThickness,
      wallType: WallType.INTERIOR
    });
  }, [drawingState, onWallComplete, wallThickness]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive) return;
    
    if (e.key === 'Escape') {
      if (drawingState.isDrawing) {
        finishWall();
      } else {
        setDrawingState({
          isDrawing: false,
          points: [],
          currentPoint: null,
          thickness: wallThickness,
          wallType: WallType.INTERIOR
        });
      }
    } else if (e.key === 'Enter' && drawingState.isDrawing) {
      finishWall();
    }
  }, [isActive, drawingState.isDrawing, finishWall, wallThickness]);

  // Event listeners
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('dblclick', handleDoubleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleMouseMove, handleMouseDown, handleDoubleClick, handleKeyDown]);

  // Redraw overlay when state changes
  useEffect(() => {
    drawPolylinePreview();
  }, [drawPolylinePreview]);

  // Update thickness when prop changes
  useEffect(() => {
    setDrawingState(prev => ({ ...prev, thickness: wallThickness }));
  }, [wallThickness]);

  return (
    <canvas
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-20"
      width={canvasRef.current?.width || 1200}
      height={canvasRef.current?.height || 800}
    />
  );
};

export default PolylineWallDrawing;
