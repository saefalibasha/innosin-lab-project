
import React, { useCallback, useMemo } from 'react';
import { Point, GridSettings, ViewportSettings } from '@/types/floorPlanTypes';
import { mmToCanvas } from '@/utils/measurements';

interface GridSystemProps {
  canvasWidth: number;
  canvasHeight: number;
  gridSettings: GridSettings;
  viewportSettings: ViewportSettings;
  showRulers?: boolean;
}

const GridSystem: React.FC<GridSystemProps> = ({
  canvasWidth,
  canvasHeight,
  gridSettings,
  viewportSettings,
  showRulers = true
}) => {
  const { size: gridSize, showMajorLines, showMinorLines, opacity } = gridSettings;
  const { zoom, pan } = viewportSettings;

  // Calculate grid spacing in pixels
  const gridSpacing = useMemo(() => {
    return mmToCanvas(gridSize, zoom);
  }, [gridSize, zoom]);

  // Calculate major grid spacing (every 10th line)
  const majorGridSpacing = gridSpacing * 10;

  // Generate grid lines
  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = [];
    
    // Calculate visible grid bounds
    const startX = Math.floor(-pan.x / gridSpacing) * gridSpacing + pan.x;
    const startY = Math.floor(-pan.y / gridSpacing) * gridSpacing + pan.y;
    
    // Vertical lines
    for (let x = startX; x <= canvasWidth + gridSpacing; x += gridSpacing) {
      if (x < 0 || x > canvasWidth) continue;
      
      const isMajor = Math.abs((x - pan.x) % majorGridSpacing) < 1;
      const lineOpacity = isMajor ? opacity : opacity * 0.3;
      const lineWidth = isMajor ? 1 : 0.5;
      
      if ((isMajor && showMajorLines) || (!isMajor && showMinorLines)) {
        lines.push(
          <line
            key={`v-${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={canvasHeight}
            stroke={`hsl(var(--muted-foreground))`}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
        );
      }
    }
    
    // Horizontal lines
    for (let y = startY; y <= canvasHeight + gridSpacing; y += gridSpacing) {
      if (y < 0 || y > canvasHeight) continue;
      
      const isMajor = Math.abs((y - pan.y) % majorGridSpacing) < 1;
      const lineOpacity = isMajor ? opacity : opacity * 0.3;
      const lineWidth = isMajor ? 1 : 0.5;
      
      if ((isMajor && showMajorLines) || (!isMajor && showMinorLines)) {
        lines.push(
          <line
            key={`h-${y}`}
            x1={0}
            y1={y}
            x2={canvasWidth}
            y2={y}
            stroke={`hsl(var(--muted-foreground))`}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
        );
      }
    }
    
    return lines;
  }, [canvasWidth, canvasHeight, gridSpacing, majorGridSpacing, pan, opacity, showMajorLines, showMinorLines]);

  // Generate ruler marks
  const rulerMarks = useMemo(() => {
    if (!showRulers) return null;
    
    const marks: JSX.Element[] = [];
    const rulerStep = majorGridSpacing;
    
    // Top ruler
    for (let x = pan.x % rulerStep; x <= canvasWidth; x += rulerStep) {
      const value = Math.round((x - pan.x) / zoom);
      marks.push(
        <g key={`ruler-x-${x}`}>
          <line
            x1={x}
            y1={0}
            x2={x}
            y2={20}
            stroke={`hsl(var(--foreground))`}
            strokeWidth={1}
          />
          <text
            x={x}
            y={15}
            textAnchor="middle"
            fontSize="10"
            fill={`hsl(var(--foreground))`}
          >
            {value}
          </text>
        </g>
      );
    }
    
    // Left ruler
    for (let y = pan.y % rulerStep; y <= canvasHeight; y += rulerStep) {
      const value = Math.round((y - pan.y) / zoom);
      marks.push(
        <g key={`ruler-y-${y}`}>
          <line
            x1={0}
            y1={y}
            x2={20}
            y2={y}
            stroke={`hsl(var(--foreground))`}
            strokeWidth={1}
          />
          <text
            x={15}
            y={y}
            textAnchor="middle"
            fontSize="10"
            fill={`hsl(var(--foreground))`}
            transform={`rotate(-90, 15, ${y})`}
          >
            {value}
          </text>
        </g>
      );
    }
    
    return marks;
  }, [canvasWidth, canvasHeight, pan, zoom, showRulers, majorGridSpacing]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={canvasWidth}
      height={canvasHeight}
      style={{ zIndex: 1 }}
    >
      {/* Grid lines */}
      <g>{gridLines}</g>
      
      {/* Rulers */}
      {showRulers && (
        <g>
          {/* Ruler backgrounds */}
          <rect
            x={0}
            y={0}
            width={canvasWidth}
            height={25}
            fill={`hsl(var(--background))`}
            stroke={`hsl(var(--border))`}
            strokeWidth={1}
          />
          <rect
            x={0}
            y={0}
            width={25}
            height={canvasHeight}
            fill={`hsl(var(--background))`}
            stroke={`hsl(var(--border))`}
            strokeWidth={1}
          />
          
          {/* Ruler marks */}
          {rulerMarks}
          
          {/* Corner square */}
          <rect
            x={0}
            y={0}
            width={25}
            height={25}
            fill={`hsl(var(--muted))`}
            stroke={`hsl(var(--border))`}
            strokeWidth={1}
          />
        </g>
      )}
    </svg>
  );
};

export default GridSystem;
