
import React, { useCallback } from 'react';
import { Point } from '@/types/floorPlanTypes';
import { mmToCanvas } from '@/utils/measurements';

interface GridSystemProps {
  canvas: HTMLCanvasElement;
  scale: number;
  gridSize: number;
  showGrid: boolean;
  zoom: number;
  pan: Point;
}

export const GRID_SIZES = [1, 5, 10, 25, 50, 100, 250, 500]; // mm

export const useGridSystem = (props: GridSystemProps) => {
  const { canvas, scale, gridSize, showGrid, zoom, pan } = props;

  const snapToGrid = useCallback((point: Point): Point => {
    const gridSizePx = mmToCanvas(gridSize, scale * zoom);
    const adjustedPoint = {
      x: point.x - pan.x,
      y: point.y - pan.y
    };
    
    const snappedPoint = {
      x: Math.round(adjustedPoint.x / gridSizePx) * gridSizePx,
      y: Math.round(adjustedPoint.y / gridSizePx) * gridSizePx
    };
    
    return {
      x: snappedPoint.x + pan.x,
      y: snappedPoint.y + pan.y
    };
  }, [gridSize, scale, zoom, pan]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;

    const gridSizePx = mmToCanvas(gridSize, scale * zoom);
    
    // Don't draw grid if it's too small or too large
    if (gridSizePx < 2 || gridSizePx > 200) return;

    ctx.save();
    ctx.translate(pan.x, pan.y);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate grid bounds
    const startX = Math.floor(-pan.x / gridSizePx) * gridSizePx;
    const startY = Math.floor(-pan.y / gridSizePx) * gridSizePx;
    const endX = startX + Math.ceil((canvasWidth + Math.abs(pan.x)) / gridSizePx) * gridSizePx;
    const endY = startY + Math.ceil((canvasHeight + Math.abs(pan.y)) / gridSizePx) * gridSizePx;

    // Minor grid lines
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = startX; x <= endX; x += gridSizePx) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSizePx) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Major grid lines (every 10th line)
    const majorGridSize = gridSizePx * 10;
    if (majorGridSize <= 200) {
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
      ctx.lineWidth = 1;
      
      const majorStartX = Math.floor(startX / majorGridSize) * majorGridSize;
      const majorStartY = Math.floor(startY / majorGridSize) * majorGridSize;
      
      for (let x = majorStartX; x <= endX; x += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      
      for (let y = majorStartY; y <= endY; y += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [showGrid, gridSize, scale, zoom, pan, canvas]);

  const getOptimalGridSize = useCallback((currentZoom: number): number => {
    const effectiveScale = scale * currentZoom;
    const baseGridSizes = GRID_SIZES;
    
    // Find the best grid size based on zoom level
    for (const size of baseGridSizes) {
      const pixelSize = mmToCanvas(size, effectiveScale);
      if (pixelSize >= 10 && pixelSize <= 100) {
        return size;
      }
    }
    
    // Fallback
    return gridSize;
  }, [scale, gridSize]);

  return {
    snapToGrid,
    drawGrid,
    getOptimalGridSize
  };
};
