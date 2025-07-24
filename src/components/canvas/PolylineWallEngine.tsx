
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, WallSegment, WallType } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas } from '@/utils/measurements';

interface PolylineWallEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scale: number;
  gridSize: number;
  showGrid: boolean;
  showMeasurements: boolean;
  onWallComplete: (wall: WallSegment) => void;
  wallSegments: WallSegment[];
  zoom: number;
}

interface WallDrawingState {
  isDrawing: boolean;
  currentPolyline: Point[];
  previewPoint: Point | null;
  snapPoint: Point | null;
  measurements: Array<{ distance: number; angle: number }>;
}

const PolylineWallEngine: React.FC<PolylineWallEngineProps> = ({
  canvasRef,
  scale,
  gridSize,
  showGrid,
  showMeasurements,
  onWallComplete,
  wallSegments,
  zoom
}) => {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [drawingState, setDrawingState] = useState<WallDrawingState>({
    isDrawing: false,
    currentPolyline: [],
    previewPoint: null,
    snapPoint: null,
    measurements: []
  });

  // Enhanced snap to grid with magnetic attraction
  const snapToGrid = useCallback((point: Point): Point => {
    const gridSizePx = mmToCanvas(gridSize, scale);
    const snappedX = Math.round(point.x / gridSizePx) * gridSizePx;
    const snappedY = Math.round(point.y / gridSizePx) * gridSizePx;
    return { x: snappedX, y: snappedY };
  }, [gridSize, scale]);

  // Find snap points from existing walls
  const findSnapPoints = useCallback((point: Point): Point | null => {
    const snapThreshold = 20; // pixels
    
    for (const wall of wallSegments) {
      // Check endpoints
      for (const endpoint of [wall.start, wall.end]) {
        const distance = Math.sqrt(
          Math.pow(point.x - endpoint.x, 2) + Math.pow(point.y - endpoint.y, 2)
        );
        if (distance < snapThreshold) {
          return endpoint;
        }
      }
      
      // Check midpoints
      const midpoint = {
        x: (wall.start.x + wall.end.x) / 2,
        y: (wall.start.y + wall.end.y) / 2
      };
      const midDistance = Math.sqrt(
        Math.pow(point.x - midpoint.x, 2) + Math.pow(point.y - midpoint.y, 2)
      );
      if (midDistance < snapThreshold) {
        return midpoint;
      }
    }
    
    return null;
  }, [wallSegments]);

  // Calculate measurements for current segment
  const calculateMeasurements = useCallback((points: Point[]): Array<{ distance: number; angle: number }> => {
    const measurements: Array<{ distance: number; angle: number }> = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      measurements.push({
        distance: canvasToMm(distance, scale),
        angle: angle
      });
    }
    
    return measurements;
  }, [scale]);

  // Draw the overlay with preview and measurements
  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      const gridSizePx = mmToCanvas(gridSize, scale);
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
    }

    // Draw current polyline
    if (drawingState.currentPolyline.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      
      ctx.beginPath();
      ctx.moveTo(drawingState.currentPolyline[0].x, drawingState.currentPolyline[0].y);
      
      for (let i = 1; i < drawingState.currentPolyline.length; i++) {
        ctx.lineTo(drawingState.currentPolyline[i].x, drawingState.currentPolyline[i].y);
      }
      
      // Draw preview line to current mouse position
      if (drawingState.previewPoint) {
        ctx.lineTo(drawingState.previewPoint.x, drawingState.previewPoint.y);
      }
      
      ctx.stroke();
      
      // Draw points
      ctx.fillStyle = '#3b82f6';
      drawingState.currentPolyline.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // Draw snap indicator
    if (drawingState.snapPoint) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(drawingState.snapPoint.x, drawingState.snapPoint.y, 6, 0, 2 * Math.PI);
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

    // Draw measurements
    if (showMeasurements && drawingState.measurements.length > 0) {
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      drawingState.measurements.forEach((measurement, index) => {
        if (index < drawingState.currentPolyline.length - 1) {
          const start = drawingState.currentPolyline[index];
          const end = drawingState.currentPolyline[index + 1];
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          
          const measurementText = formatMeasurement(measurement.distance, {
            unit: 'mm',
            precision: 0,
            showUnit: true
          });
          
          // Background for measurement text
          const textMetrics = ctx.measureText(measurementText);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(midX - textMetrics.width / 2 - 4, midY - 15, textMetrics.width + 8, 20);
          
          ctx.fillStyle = '#1f2937';
          ctx.fillText(measurementText, midX, midY - 5);
          ctx.fillText(`${measurement.angle.toFixed(1)}°`, midX, midY + 10);
        }
      });
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

    if (drawingState.isDrawing) {
      const previewPolyline = [...drawingState.currentPolyline, finalPoint];
      const measurements = calculateMeasurements(previewPolyline);
      
      setDrawingState(prev => ({
        ...prev,
        previewPoint: finalPoint,
        snapPoint,
        measurements
      }));
    } else {
      setDrawingState(prev => ({
        ...prev,
        previewPoint: finalPoint,
        snapPoint
      }));
    }
  }, [drawingState.isDrawing, drawingState.currentPolyline, findSnapPoints, snapToGrid, calculateMeasurements]);

  const handleMouseClick = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const rawPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const snapPoint = findSnapPoints(rawPoint);
    const finalPoint = snapPoint || snapToGrid(rawPoint);

    if (!drawingState.isDrawing) {
      // Start new polyline
      setDrawingState(prev => ({
        ...prev,
        isDrawing: true,
        currentPolyline: [finalPoint],
        measurements: []
      }));
    } else {
      // Add point to current polyline
      const newPolyline = [...drawingState.currentPolyline, finalPoint];
      const measurements = calculateMeasurements(newPolyline);
      
      setDrawingState(prev => ({
        ...prev,
        currentPolyline: newPolyline,
        measurements
      }));
    }
  }, [drawingState.isDrawing, drawingState.currentPolyline, findSnapPoints, snapToGrid, calculateMeasurements]);

  const handleDoubleClick = useCallback(() => {
    if (drawingState.isDrawing && drawingState.currentPolyline.length > 1) {
      // Complete the polyline by creating wall segments
      for (let i = 0; i < drawingState.currentPolyline.length - 1; i++) {
        const start = drawingState.currentPolyline[i];
        const end = drawingState.currentPolyline[i + 1];
        
        const wall: WallSegment = {
          id: `wall-${Date.now()}-${i}`,
          start,
          end,
          type: WallType.INTERIOR,
          thickness: 100 // 100mm default
        };
        
        onWallComplete(wall);
      }
      
      // Reset drawing state
      setDrawingState({
        isDrawing: false,
        currentPolyline: [],
        previewPoint: null,
        snapPoint: null,
        measurements: []
      });
    }
  }, [drawingState.isDrawing, drawingState.currentPolyline, onWallComplete]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDrawingState({
        isDrawing: false,
        currentPolyline: [],
        previewPoint: null,
        snapPoint: null,
        measurements: []
      });
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('dblclick', handleDoubleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleMouseClick);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseMove, handleMouseClick, handleDoubleClick, handleKeyDown]);

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

export default PolylineWallEngine;
