
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, WallSegment } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas, GRID_SIZES } from '@/utils/measurements';

interface DrawingEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isDrawing: boolean;
  currentTool: string;
  scale: number;
  gridSize: number;
  showGrid: boolean;
  showMeasurements: boolean;
  onWallComplete: (wall: WallSegment) => void;
  onPointAdd: (point: Point) => void;
  roomPoints: Point[];
  wallSegments: WallSegment[];
}

interface DrawingState {
  startPoint: Point | null;
  currentPoint: Point | null;
  isDrawingWall: boolean;
  snapPoint: Point | null;
  measurements: { distance: number; angle: number } | null;
}

const DrawingEngine: React.FC<DrawingEngineProps> = ({
  canvasRef,
  isDrawing,
  currentTool,
  scale,
  gridSize,
  showGrid,
  showMeasurements,
  onWallComplete,
  onPointAdd,
  roomPoints,
  wallSegments
}) => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    startPoint: null,
    currentPoint: null,
    isDrawingWall: false,
    snapPoint: null,
    measurements: null
  });

  const overlayRef = useRef<HTMLCanvasElement>(null);

  // Snap to grid with precision
  const snapToGrid = useCallback((point: Point): Point => {
    const gridSizePx = mmToCanvas(gridSize, scale);
    return {
      x: Math.round(point.x / gridSizePx) * gridSizePx,
      y: Math.round(point.y / gridSizePx) * gridSizePx
    };
  }, [gridSize, scale]);

  // Find snap points (endpoints, intersections)
  const findSnapPoints = useCallback((point: Point): Point | null => {
    const snapThreshold = 10; // pixels
    
    // Check room points
    for (const roomPoint of roomPoints) {
      const distance = Math.sqrt(
        Math.pow(point.x - roomPoint.x, 2) + Math.pow(point.y - roomPoint.y, 2)
      );
      if (distance < snapThreshold) {
        return roomPoint;
      }
    }

    // Check wall endpoints
    for (const wall of wallSegments) {
      for (const endpoint of [wall.start, wall.end]) {
        const distance = Math.sqrt(
          Math.pow(point.x - endpoint.x, 2) + Math.pow(point.y - endpoint.y, 2)
        );
        if (distance < snapThreshold) {
          return endpoint;
        }
      }
    }

    return null;
  }, [roomPoints, wallSegments]);

  // Calculate measurements
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

  // Draw overlay with guides and measurements
  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      
      const gridSizePx = mmToCanvas(gridSize, scale);
      
      for (let x = 0; x <= canvas.width; x += gridSizePx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSizePx) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw current drawing line
    if (drawingState.isDrawingWall && drawingState.startPoint && drawingState.currentPoint) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(drawingState.startPoint.x, drawingState.startPoint.y);
      ctx.lineTo(drawingState.currentPoint.x, drawingState.currentPoint.y);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }

    // Draw snap indicators
    if (drawingState.snapPoint) {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(drawingState.snapPoint.x, drawingState.snapPoint.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw measurements
    if (showMeasurements && drawingState.measurements && drawingState.startPoint && drawingState.currentPoint) {
      const midX = (drawingState.startPoint.x + drawingState.currentPoint.x) / 2;
      const midY = (drawingState.startPoint.y + drawingState.currentPoint.y) / 2;
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      const measurement = formatMeasurement(drawingState.measurements.distance, {
        unit: 'mm',
        precision: 0,
        showUnit: true
      });
      
      ctx.fillText(measurement, midX, midY - 10);
      ctx.fillText(`${drawingState.measurements.angle.toFixed(1)}°`, midX, midY + 15);
    }
  }, [drawingState, showGrid, showMeasurements, gridSize, scale]);

  // Handle mouse events
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const snapPoint = findSnapPoints(rawPoint);
    const finalPoint = snapPoint || snapToGrid(rawPoint);

    if (drawingState.isDrawingWall && drawingState.startPoint) {
      const measurements = calculateMeasurements(drawingState.startPoint, finalPoint);
      setDrawingState(prev => ({
        ...prev,
        currentPoint: finalPoint,
        snapPoint,
        measurements
      }));
    } else {
      setDrawingState(prev => ({
        ...prev,
        snapPoint
      }));
    }
  }, [drawingState.isDrawingWall, drawingState.startPoint, findSnapPoints, snapToGrid, calculateMeasurements]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (currentTool !== 'wall') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const snapPoint = findSnapPoints(rawPoint);
    const finalPoint = snapPoint || snapToGrid(rawPoint);

    if (!drawingState.isDrawingWall) {
      // Start drawing
      setDrawingState(prev => ({
        ...prev,
        startPoint: finalPoint,
        currentPoint: finalPoint,
        isDrawingWall: true,
        snapPoint
      }));
      onPointAdd(finalPoint);
    } else {
      // Complete wall
      if (drawingState.startPoint) {
        const newWall: WallSegment = {
          id: `wall-${Date.now()}`,
          start: drawingState.startPoint,
          end: finalPoint,
          type: 'interior',
          thickness: 100 // 100mm default
        };
        onWallComplete(newWall);
      }
      
      setDrawingState({
        startPoint: null,
        currentPoint: null,
        isDrawingWall: false,
        snapPoint: null,
        measurements: null
      });
    }
  }, [currentTool, drawingState, findSnapPoints, snapToGrid, onWallComplete, onPointAdd]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && drawingState.isDrawingWall) {
      setDrawingState({
        startPoint: null,
        currentPoint: null,
        isDrawingWall: false,
        snapPoint: null,
        measurements: null
      });
    }
  }, [drawingState.isDrawingWall]);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseMove, handleMouseDown, handleKeyDown]);

  // Redraw overlay when state changes
  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  return (
    <canvas
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-10"
      width={canvasRef.current?.width || 1200}
      height={canvasRef.current?.height || 800}
    />
  );
};

export default DrawingEngine;
