
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, WallSegment, WallType, Room, DrawingMode } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas } from '@/utils/measurements';

interface DrawingEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentMode: DrawingMode;
  scale: number;
  gridSize: number;
  showGrid: boolean;
  showMeasurements: boolean;
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
  tempWallPoints: Point[];
  isCreatingWalls: boolean;
  selectedWall: WallSegment | null;
  isDraggingWall: boolean;
}

const DrawingEngine: React.FC<DrawingEngineProps> = ({
  canvasRef,
  currentMode,
  scale,
  gridSize,
  showGrid,
  showMeasurements,
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
    tempWallPoints: [],
    isCreatingWalls: false,
    selectedWall: null,
    isDraggingWall: false
  });

  const overlayRef = useRef<HTMLCanvasElement>(null);

  // Enhanced snap to grid with precise corner snapping
  const snapToGrid = useCallback((point: Point): Point => {
    const gridSizePx = mmToCanvas(gridSize, scale);
    return {
      x: Math.round(point.x / gridSizePx) * gridSizePx,
      y: Math.round(point.y / gridSizePx) * gridSizePx
    };
  }, [gridSize, scale]);

  // Find snap points with enhanced detection
  const findSnapPoints = useCallback((point: Point): Point | null => {
    const snapThreshold = 20; // pixels
    
    // Check existing wall endpoints
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

    // Check temp wall points during creation
    for (const wallPoint of drawingState.tempWallPoints) {
      const distance = Math.sqrt(
        Math.pow(point.x - wallPoint.x, 2) + Math.pow(point.y - wallPoint.y, 2)
      );
      if (distance < snapThreshold) {
        return wallPoint;
      }
    }

    return null;
  }, [wallSegments, drawingState.tempWallPoints]);

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

  // Enhanced overlay drawing with grid snapping visualization
  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw enhanced grid with corner emphasis
    if (showGrid) {
      const gridSizePx = mmToCanvas(gridSize, scale);
      
      // Minor grid lines
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.lineWidth = 0.5;
      
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

      // Draw grid corners as small squares
      ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
      for (let x = 0; x <= canvas.width; x += gridSizePx) {
        for (let y = 0; y <= canvas.height; y += gridSizePx) {
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }
    }

    // Draw temp wall points during creation
    if (currentMode === 'wall' && drawingState.tempWallPoints.length > 0) {
      ctx.fillStyle = '#3b82f6';
      drawingState.tempWallPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw temp wall lines
      if (drawingState.tempWallPoints.length > 1) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        
        for (let i = 0; i < drawingState.tempWallPoints.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(drawingState.tempWallPoints[i].x, drawingState.tempWallPoints[i].y);
          ctx.lineTo(drawingState.tempWallPoints[i + 1].x, drawingState.tempWallPoints[i + 1].y);
          ctx.stroke();
        }
        
        // Draw line to current mouse position
        if (drawingState.currentPoint) {
          ctx.beginPath();
          ctx.moveTo(
            drawingState.tempWallPoints[drawingState.tempWallPoints.length - 1].x,
            drawingState.tempWallPoints[drawingState.tempWallPoints.length - 1].y
          );
          ctx.lineTo(drawingState.currentPoint.x, drawingState.currentPoint.y);
          ctx.stroke();
        }
        
        ctx.setLineDash([]);
      }
    }

    // Draw snap indicators
    if (drawingState.snapPoint) {
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(drawingState.snapPoint.x, drawingState.snapPoint.y, 10, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw snap cross
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drawingState.snapPoint.x - 8, drawingState.snapPoint.y);
      ctx.lineTo(drawingState.snapPoint.x + 8, drawingState.snapPoint.y);
      ctx.moveTo(drawingState.snapPoint.x, drawingState.snapPoint.y - 8);
      ctx.lineTo(drawingState.snapPoint.x, drawingState.snapPoint.y + 8);
      ctx.stroke();
    }

    // Draw measurements for temp walls
    if (showMeasurements && drawingState.tempWallPoints.length > 0 && drawingState.currentPoint) {
      const lastPoint = drawingState.tempWallPoints[drawingState.tempWallPoints.length - 1];
      const measurements = calculateMeasurements(lastPoint, drawingState.currentPoint);
      
      const midX = (lastPoint.x + drawingState.currentPoint.x) / 2;
      const midY = (lastPoint.y + drawingState.currentPoint.y) / 2;
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      const measurement = formatMeasurement(measurements.distance, {
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
    }

    // Draw measurements for existing walls
    if (showMeasurements) {
      wallSegments.forEach(wall => {
        const measurements = calculateMeasurements(wall.start, wall.end);
        const midX = (wall.start.x + wall.end.x) / 2;
        const midY = (wall.start.y + wall.end.y) / 2;
        
        ctx.fillStyle = '#1f2937';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        
        const measurement = formatMeasurement(measurements.distance, {
          unit: 'mm',
          precision: 0,
          showUnit: true
        });
        
        // Background for measurement text
        const textMetrics = ctx.measureText(measurement);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(midX - textMetrics.width / 2 - 2, midY - 12, textMetrics.width + 4, 16);
        
        ctx.fillStyle = '#1f2937';
        ctx.fillText(measurement, midX, midY - 4);
      });
    }
  }, [drawingState, showGrid, showMeasurements, gridSize, scale, currentMode, wallSegments, calculateMeasurements]);

  // Enhanced mouse event handling
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const snapPoint = findSnapPoints(rawPoint);
    const finalPoint = snapPoint || snapToGrid(rawPoint);

    if (currentMode === 'wall' && drawingState.isCreatingWalls) {
      setDrawingState(prev => ({
        ...prev,
        currentPoint: finalPoint,
        snapPoint
      }));
    } else {
      setDrawingState(prev => ({
        ...prev,
        currentPoint: finalPoint,
        snapPoint
      }));
    }
  }, [currentMode, drawingState.isCreatingWalls, findSnapPoints, snapToGrid]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const snapPoint = findSnapPoints(rawPoint);
    const finalPoint = snapPoint || snapToGrid(rawPoint);

    if (currentMode === 'wall') {
      if (!drawingState.isCreatingWalls) {
        // Start creating walls
        setDrawingState(prev => ({
          ...prev,
          isCreatingWalls: true,
          tempWallPoints: [finalPoint]
        }));
      } else {
        // Add point to wall sequence or close the room
        const firstPoint = drawingState.tempWallPoints[0];
        const distanceToFirst = Math.sqrt(
          Math.pow(finalPoint.x - firstPoint.x, 2) + 
          Math.pow(finalPoint.y - firstPoint.y, 2)
        );
        
        if (distanceToFirst < 30 && drawingState.tempWallPoints.length > 2) {
          // Close the room and create all walls
          const allPoints = [...drawingState.tempWallPoints, firstPoint];
          
          // Create wall segments
          for (let i = 0; i < allPoints.length - 1; i++) {
            const wall: WallSegment = {
              id: `wall-${Date.now()}-${i}`,
              start: allPoints[i],
              end: allPoints[i + 1],
              type: WallType.INTERIOR,
              thickness: 100
            };
            onWallComplete(wall);
          }
          
          // Create room
          onRoomUpdate(drawingState.tempWallPoints);
          
          setDrawingState(prev => ({
            ...prev,
            isCreatingWalls: false,
            tempWallPoints: []
          }));
        } else {
          // Add point to sequence
          setDrawingState(prev => ({
            ...prev,
            tempWallPoints: [...prev.tempWallPoints, finalPoint]
          }));
        }
      }
    }
  }, [currentMode, drawingState, findSnapPoints, snapToGrid, onWallComplete, onRoomUpdate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDrawingState({
        startPoint: null,
        currentPoint: null,
        isDrawing: false,
        snapPoint: null,
        measurements: null,
        tempWallPoints: [],
        isCreatingWalls: false,
        selectedWall: null,
        isDraggingWall: false
      });
    }
  }, []);

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
