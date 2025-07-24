
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, WallSegment, WallType, Room, DrawingMode } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas } from '@/utils/measurements';
import { useGridSystem } from './GridSystem';

interface DrawingEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentMode: DrawingMode;
  scale: number;
  gridSize: number;
  showGrid: boolean;
  showMeasurements: boolean;
  zoom: number;
  pan: Point;
  onWallComplete: (wall: WallSegment) => void;
  onRoomUpdate: (points: Point[]) => void;
  roomPoints: Point[];
  wallSegments: WallSegment[];
  rooms: Room[];
}

interface DrawingState {
  startPoint: Point | null;
  currentPoint: Point | null;
  isDrawing: boolean;
  snapPoint: Point | null;
  measurements: { distance: number; angle: number } | null;
  tempRoomPoints: Point[];
  isCreatingRoom: boolean;
  hoveredPoint: Point | null;
}

const DrawingEngine: React.FC<DrawingEngineProps> = ({
  canvasRef,
  currentMode,
  scale,
  gridSize,
  showGrid,
  showMeasurements,
  zoom,
  pan,
  onWallComplete,
  onRoomUpdate,
  roomPoints,
  wallSegments,
  rooms
}) => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    startPoint: null,
    currentPoint: null,
    isDrawing: false,
    snapPoint: null,
    measurements: null,
    tempRoomPoints: [],
    isCreatingRoom: false,
    hoveredPoint: null
  });

  const overlayRef = useRef<HTMLCanvasElement>(null);
  const gridSystem = useGridSystem({
    canvas: canvasRef.current!,
    scale,
    gridSize,
    showGrid,
    zoom,
    pan
  });

  // Enhanced snap detection with multiple snap targets
  const findSnapPoints = useCallback((point: Point): Point | null => {
    const snapThreshold = 15; // pixels
    
    // Check existing room points
    for (const room of rooms) {
      for (const roomPoint of room.points) {
        const distance = Math.sqrt(
          Math.pow(point.x - roomPoint.x, 2) + Math.pow(point.y - roomPoint.y, 2)
        );
        if (distance < snapThreshold) {
          return roomPoint;
        }
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

    // Check temp room points during creation
    for (const roomPoint of drawingState.tempRoomPoints) {
      const distance = Math.sqrt(
        Math.pow(point.x - roomPoint.x, 2) + Math.pow(point.y - roomPoint.y, 2)
      );
      if (distance < snapThreshold) {
        return roomPoint;
      }
    }

    return null;
  }, [rooms, wallSegments, drawingState.tempRoomPoints]);

  const calculateMeasurements = useCallback((start: Point, end: Point) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    return {
      distance: canvasToMm(distance, scale * zoom),
      angle: angle
    };
  }, [scale, zoom]);

  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    gridSystem.drawGrid(ctx);

    // Draw temp room points during creation
    if (currentMode === 'room' && drawingState.tempRoomPoints.length > 0) {
      // Draw points
      ctx.fillStyle = '#3b82f6';
      drawingState.tempRoomPoints.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw point number
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((index + 1).toString(), point.x, point.y + 3);
        ctx.fillStyle = '#3b82f6';
      });

      // Draw connecting lines
      if (drawingState.tempRoomPoints.length > 1) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(drawingState.tempRoomPoints[0].x, drawingState.tempRoomPoints[0].y);
        
        for (let i = 1; i < drawingState.tempRoomPoints.length; i++) {
          ctx.lineTo(drawingState.tempRoomPoints[i].x, drawingState.tempRoomPoints[i].y);
        }
        
        // Draw line to current mouse position
        if (drawingState.currentPoint) {
          ctx.lineTo(drawingState.currentPoint.x, drawingState.currentPoint.y);
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw close room indicator
      if (drawingState.tempRoomPoints.length > 2 && drawingState.currentPoint) {
        const firstPoint = drawingState.tempRoomPoints[0];
        const distance = Math.sqrt(
          Math.pow(drawingState.currentPoint.x - firstPoint.x, 2) + 
          Math.pow(drawingState.currentPoint.y - firstPoint.y, 2)
        );
        
        if (distance < 20) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(firstPoint.x, firstPoint.y, 12, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    }

    // Draw current drawing line (for walls)
    if (currentMode === 'wall' && drawingState.isDrawing && drawingState.startPoint && drawingState.currentPoint) {
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
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(drawingState.snapPoint.x, drawingState.snapPoint.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw snap cross
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drawingState.snapPoint.x - 6, drawingState.snapPoint.y);
      ctx.lineTo(drawingState.snapPoint.x + 6, drawingState.snapPoint.y);
      ctx.moveTo(drawingState.snapPoint.x, drawingState.snapPoint.y - 6);
      ctx.lineTo(drawingState.snapPoint.x, drawingState.snapPoint.y + 6);
      ctx.stroke();
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
      
      // Background for measurement text
      const textMetrics = ctx.measureText(measurement);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(midX - textMetrics.width / 2 - 4, midY - 15, textMetrics.width + 8, 20);
      
      ctx.fillStyle = '#1f2937';
      ctx.fillText(measurement, midX, midY - 5);
      ctx.fillText(`${drawingState.measurements.angle.toFixed(1)}°`, midX, midY + 10);
    }

    // Draw grid snap indicator
    if (drawingState.hoveredPoint && showGrid) {
      const snappedPoint = gridSystem.snapToGrid(drawingState.hoveredPoint);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.beginPath();
      ctx.arc(snappedPoint.x, snappedPoint.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [drawingState, showGrid, showMeasurements, gridSystem, currentMode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const snapPoint = findSnapPoints(rawPoint);
    const finalPoint = snapPoint || gridSystem.snapToGrid(rawPoint);

    if (currentMode === 'wall' && drawingState.isDrawing && drawingState.startPoint) {
      const measurements = calculateMeasurements(drawingState.startPoint, finalPoint);
      setDrawingState(prev => ({
        ...prev,
        currentPoint: finalPoint,
        snapPoint,
        measurements,
        hoveredPoint: rawPoint
      }));
    } else if (currentMode === 'room' && drawingState.isCreatingRoom) {
      setDrawingState(prev => ({
        ...prev,
        currentPoint: finalPoint,
        snapPoint,
        hoveredPoint: rawPoint
      }));
    } else {
      setDrawingState(prev => ({
        ...prev,
        currentPoint: finalPoint,
        snapPoint,
        hoveredPoint: rawPoint
      }));
    }
  }, [currentMode, drawingState.isDrawing, drawingState.isCreatingRoom, drawingState.startPoint, findSnapPoints, gridSystem, calculateMeasurements]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const snapPoint = findSnapPoints(rawPoint);
    const finalPoint = snapPoint || gridSystem.snapToGrid(rawPoint);

    if (currentMode === 'wall') {
      if (!drawingState.isDrawing) {
        setDrawingState(prev => ({
          ...prev,
          startPoint: finalPoint,
          currentPoint: finalPoint,
          isDrawing: true,
          snapPoint
        }));
      } else {
        if (drawingState.startPoint) {
          const newWall: WallSegment = {
            id: `wall-${Date.now()}`,
            start: drawingState.startPoint,
            end: finalPoint,
            type: WallType.INTERIOR,
            thickness: 100
          };
          onWallComplete(newWall);
        }
        
        setDrawingState(prev => ({
          ...prev,
          startPoint: null,
          currentPoint: null,
          isDrawing: false,
          snapPoint: null,
          measurements: null
        }));
      }
    } else if (currentMode === 'room') {
      if (!drawingState.isCreatingRoom) {
        setDrawingState(prev => ({
          ...prev,
          isCreatingRoom: true,
          tempRoomPoints: [finalPoint]
        }));
      } else {
        const firstPoint = drawingState.tempRoomPoints[0];
        const distanceToFirst = Math.sqrt(
          Math.pow(finalPoint.x - firstPoint.x, 2) + 
          Math.pow(finalPoint.y - firstPoint.y, 2)
        );
        
        if (distanceToFirst < 20 && drawingState.tempRoomPoints.length > 2) {
          onRoomUpdate([...drawingState.tempRoomPoints]);
          setDrawingState(prev => ({
            ...prev,
            isCreatingRoom: false,
            tempRoomPoints: []
          }));
        } else {
          setDrawingState(prev => ({
            ...prev,
            tempRoomPoints: [...prev.tempRoomPoints, finalPoint]
          }));
        }
      }
    }
  }, [currentMode, drawingState, findSnapPoints, gridSystem, onWallComplete, onRoomUpdate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDrawingState({
        startPoint: null,
        currentPoint: null,
        isDrawing: false,
        snapPoint: null,
        measurements: null,
        tempRoomPoints: [],
        isCreatingRoom: false,
        hoveredPoint: null
      });
    }
  }, []);

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
