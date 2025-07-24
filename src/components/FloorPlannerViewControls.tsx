
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-lg z-30">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={onZoomIn} className="h-8 w-8 p-0">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Zoom In (Ctrl + Plus)</p>
        </TooltipContent>
      </Tooltip>

      <div className="text-xs text-center text-gray-600 px-1">
        {Math.round(currentZoom * 100)}%
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={onZoomOut} className="h-8 w-8 p-0">
            <ZoomOut className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Zoom Out (Ctrl + Minus)</p>
        </TooltipContent>
      </Tooltip>

      <div className="border-t border-gray-200 my-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={onFitToView} className="h-8 w-8 p-0">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Fit to View (F)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={onResetView} className="h-8 w-8 p-0">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Reset View (R)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FloorPlannerViewControls;
