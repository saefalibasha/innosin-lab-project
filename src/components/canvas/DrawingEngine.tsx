
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, WallSegment, WallType, Room, DrawingMode } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas, GRID_SIZES } from '@/utils/measurements';

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
  tempRoomPoints: Point[];
  isCreatingRoom: boolean;
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
    tempRoomPoints: [],
    isCreatingRoom: false
  });

  const overlayRef = useRef<HTMLCanvasElement>(null);

  // Enhanced snap to grid with fine precision
  const snapToGrid = useCallback((point: Point): Point => {
    const gridSizePx = mmToCanvas(gridSize, scale);
    return {
      x: Math.round(point.x / gridSizePx) * gridSizePx,
      y: Math.round(point.y / gridSizePx) * gridSizePx
    };
  }, [gridSize, scale]);

  // Find snap points with enhanced detection
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

  // Enhanced overlay drawing
  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw enhanced grid
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

      // Major grid lines (every 10th line)
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= canvas.width; x += gridSizePx * 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSizePx * 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw temp room points during creation
    if (currentMode === 'room' && drawingState.tempRoomPoints.length > 0) {
      ctx.fillStyle = '#3b82f6';
      drawingState.tempRoomPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw temp room lines
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
      ctx.fillStyle = '#3b82f6';
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
  }, [drawingState, showGrid, showMeasurements, gridSize, scale, currentMode]);

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

    if (currentMode === 'wall' && drawingState.isDrawing && drawingState.startPoint) {
      const measurements = calculateMeasurements(drawingState.startPoint, finalPoint);
      setDrawingState(prev => ({
        ...prev,
        currentPoint: finalPoint,
        snapPoint,
        measurements
      }));
    } else if (currentMode === 'room' && drawingState.isCreatingRoom) {
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
  }, [currentMode, drawingState.isDrawing, drawingState.isCreatingRoom, drawingState.startPoint, findSnapPoints, snapToGrid, calculateMeasurements]);

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
      if (!drawingState.isDrawing) {
        // Start drawing wall
        setDrawingState(prev => ({
          ...prev,
          startPoint: finalPoint,
          currentPoint: finalPoint,
          isDrawing: true,
          snapPoint
        }));
      } else {
        // Complete wall
        if (drawingState.startPoint) {
          const newWall: WallSegment = {
            id: `wall-${Date.now()}`,
            start: drawingState.startPoint,
            end: finalPoint,
            type: WallType.INTERIOR,
            thickness: 100, // 100mm default
            color: '#94a3b8' // Added missing color property
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
      // Handle room creation
      if (!drawingState.isCreatingRoom) {
        // Start creating room
        setDrawingState(prev => ({
          ...prev,
          isCreatingRoom: true,
          tempRoomPoints: [finalPoint]
        }));
      } else {
        // Add point to room or close room
        const firstPoint = drawingState.tempRoomPoints[0];
        const distanceToFirst = Math.sqrt(
          Math.pow(finalPoint.x - firstPoint.x, 2) + 
          Math.pow(finalPoint.y - firstPoint.y, 2)
        );
        
        if (distanceToFirst < 20 && drawingState.tempRoomPoints.length > 2) {
          // Close room
          onRoomUpdate([...drawingState.tempRoomPoints]);
          setDrawingState(prev => ({
            ...prev,
            isCreatingRoom: false,
            tempRoomPoints: []
          }));
        } else {
          // Add point
          setDrawingState(prev => ({
            ...prev,
            tempRoomPoints: [...prev.tempRoomPoints, finalPoint]
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
        tempRoomPoints: [],
        isCreatingRoom: false
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
