
import React from 'react';
import { GridSettings, ViewportSettings } from '@/types/floorPlanTypes';

interface GridSystemProps {
  canvasWidth: number;
  canvasHeight: number;
  gridSettings: GridSettings;
  viewportSettings: ViewportSettings;
  showRulers: boolean;
}

const GridSystem: React.FC<GridSystemProps> = ({
  canvasWidth,
  canvasHeight,
  gridSettings,
  viewportSettings,
  showRulers
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        width={canvasWidth}
        height={canvasHeight}
        className="absolute inset-0"
        style={{ opacity: gridSettings.opacity }}
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width={gridSettings.size}
            height={gridSettings.size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSettings.size} 0 L 0 0 0 ${gridSettings.size}`}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

export default GridSystem;
