
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

interface FloorPlannerViewControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  onResetView: () => void;
  currentZoom: number;
}

const FloorPlannerViewControls: React.FC<FloorPlannerViewControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitToView,
  onResetView,
  currentZoom
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomIn}
        className="h-8 w-8 p-0"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomOut}
        className="h-8 w-8 p-0"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onFitToView}
        className="h-8 w-8 p-0"
      >
        <Maximize className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onResetView}
        className="h-8 w-8 p-0"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <div className="text-xs text-muted-foreground text-center">
        {Math.round(currentZoom * 100)}%
      </div>
    </div>
  );
};

export default FloorPlannerViewControls;
