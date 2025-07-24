
import React from 'react';

interface GridSystemProps {
  showMajorLines: boolean;
  showMinorLines: boolean;
  opacity: number;
}

interface GridSystemResult {
  renderGrid: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

const GridSystem = (props: GridSystemProps & { 
  gridSize: number; 
  scale: number; 
  zoom: number; 
}): GridSystemResult => {
  const { gridSize, scale, zoom, showMajorLines, showMinorLines, opacity } = props;

  const renderGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showMajorLines && !showMinorLines) return;

    const gridSpacing = (gridSize * scale * zoom) / 1000;
    
    ctx.strokeStyle = `rgba(200, 200, 200, ${opacity})`;
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  return { renderGrid };
};

export default GridSystem;
