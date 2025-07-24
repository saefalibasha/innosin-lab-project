
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

const WallRenderer = (props: WallRendererProps) => {
  const renderWalls = (ctx: CanvasRenderingContext2D) => {
    props.walls.forEach(wall => {
      const isSelected = props.selectedWalls.includes(wall.id);
      
      ctx.strokeStyle = isSelected ? '#3b82f6' : '#6b7280';
      ctx.lineWidth = props.showThickness ? 5 : 3;
      
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
      
      // Draw wall thickness if enabled
      if (props.showThickness) {
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;
        const perpX = -unitY;
        const perpY = unitX;
        const thickness = wall.thickness || 100;
        const thicknessPx = thickness * props.scale * props.zoom / 1000;
        
        ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(107, 114, 128, 0.3)';
        ctx.beginPath();
        ctx.moveTo(wall.start.x + perpX * thicknessPx / 2, wall.start.y + perpY * thicknessPx / 2);
        ctx.lineTo(wall.end.x + perpX * thicknessPx / 2, wall.end.y + perpY * thicknessPx / 2);
        ctx.lineTo(wall.end.x - perpX * thicknessPx / 2, wall.end.y - perpY * thicknessPx / 2);
        ctx.lineTo(wall.start.x - perpX * thicknessPx / 2, wall.start.y - perpY * thicknessPx / 2);
        ctx.closePath();
        ctx.fill();
      }
    });
  };

  return { renderWalls };
};

export default WallRenderer;
