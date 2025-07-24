
import React from 'react';

interface GridSystemProps {
  scale: number;
  zoom: number;
  showMajorLines: boolean;
  showMinorLines: boolean;
  opacity: number;
}

const GridSystem = (props: GridSystemProps) => {
  const renderGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20; // 20mm grid
    const gridSizePx = gridSize * props.scale * props.zoom / 1000;
    
    if (props.showMinorLines) {
      ctx.strokeStyle = `rgba(200, 200, 200, ${props.opacity})`;
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x <= width; x += gridSizePx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += gridSizePx) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    
    if (props.showMajorLines) {
      ctx.strokeStyle = `rgba(150, 150, 150, ${props.opacity + 0.2})`;
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= width; x += gridSizePx * 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += gridSizePx * 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  };

  return { renderGrid };
};

export default GridSystem;
