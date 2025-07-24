
import React from 'react';
import { WallSegment } from '@/types/floorPlanTypes';

interface WallRendererProps {
  walls: WallSegment[];
  scale: number;
  zoom: number;
  selectedWalls: string[];
  onWallSelect: (wallIds: string[]) => void;
  showThickness: boolean;
}

interface WallRendererResult {
  renderWalls: (ctx: CanvasRenderingContext2D) => void;
}

const WallRenderer = (props: WallRendererProps): WallRendererResult => {
  const { walls, scale, zoom, selectedWalls, showThickness } = props;

  const renderWalls = (ctx: CanvasRenderingContext2D) => {
    walls.forEach(wall => {
      const isSelected = selectedWalls.includes(wall.id);
      
      // Set wall appearance based on selection and zoom
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#6b7280';
      ctx.lineWidth = showThickness ? Math.max(2, wall.thickness * scale * zoom / 1000) : 2;
      
      // Draw wall segment
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
      
      // Draw selection indicators
      if (isSelected) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(wall.start.x, wall.start.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(wall.end.x, wall.end.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  return { renderWalls };
};

export default WallRenderer;
