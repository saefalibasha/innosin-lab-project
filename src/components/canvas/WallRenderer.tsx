
import React, { useCallback } from 'react';
import { WallSegment, Point } from '@/types/floorPlanTypes';
import { mmToCanvas } from '@/utils/measurements';

interface WallRendererProps {
  walls: WallSegment[];
  scale: number;
  zoom: number;
  selectedWalls: string[];
  onWallSelect?: (wallId: string) => void;
  showThickness?: boolean;
}

interface WallRendererReturn {
  renderWalls: (ctx: CanvasRenderingContext2D) => void;
}

export const useWallRenderer = ({
  walls,
  scale,
  zoom,
  selectedWalls,
  onWallSelect,
  showThickness = false
}: WallRendererProps): WallRendererReturn => {
  const THICKNESS_ZOOM_THRESHOLD = 1.5;

  const drawWall = useCallback((
    ctx: CanvasRenderingContext2D,
    wall: WallSegment,
    showThick: boolean
  ) => {
    const isSelected = selectedWalls.includes(wall.id);
    
    if (showThick && showThickness) {
      // Draw thick wall representation
      const thickness = mmToCanvas(wall.thickness, scale);
      
      // Calculate perpendicular vector for wall thickness
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length === 0) return;
      
      const perpX = -dy / length * thickness / 2;
      const perpY = dx / length * thickness / 2;
      
      // Draw wall as filled rectangle
      ctx.fillStyle = isSelected 
        ? 'hsl(var(--primary) / 0.8)' 
        : 'hsl(var(--muted-foreground) / 0.6)';
      
      ctx.beginPath();
      ctx.moveTo(wall.start.x + perpX, wall.start.y + perpY);
      ctx.lineTo(wall.end.x + perpX, wall.end.y + perpY);
      ctx.lineTo(wall.end.x - perpX, wall.end.y - perpY);
      ctx.lineTo(wall.start.x - perpX, wall.start.y - perpY);
      ctx.closePath();
      ctx.fill();
      
      // Draw wall outline
      ctx.strokeStyle = isSelected 
        ? 'hsl(var(--primary))' 
        : 'hsl(var(--muted-foreground))';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      // Draw thin line representation
      ctx.strokeStyle = isSelected 
        ? 'hsl(var(--primary))' 
        : 'hsl(var(--muted-foreground))';
      ctx.lineWidth = isSelected ? 3 : 2;
      
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    }
    
    // Draw connection points
    const connectionRadius = 4;
    ctx.fillStyle = isSelected 
      ? 'hsl(var(--primary))' 
      : 'hsl(var(--muted-foreground))';
    
    [wall.start, wall.end].forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, connectionRadius, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [scale, selectedWalls, showThickness]);

  const renderWalls = useCallback((ctx: CanvasRenderingContext2D) => {
    const showThick = zoom > THICKNESS_ZOOM_THRESHOLD;
    
    walls.forEach(wall => {
      drawWall(ctx, wall, showThick);
    });
  }, [walls, zoom, drawWall]);

  return { renderWalls };
};

const WallRenderer: React.FC<WallRendererProps> = (props) => {
  return null; // This component doesn't render anything directly
};

export default WallRenderer;
