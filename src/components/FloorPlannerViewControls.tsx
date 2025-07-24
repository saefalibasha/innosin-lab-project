
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="absolute bottom-4 right-4 z-20">
      <CardContent className="p-2">
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            disabled={currentZoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            disabled={currentZoom <= 0.1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFitToView}
          >
            <Maximize className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          {Math.round(currentZoom * 100)}%
        </div>
      </CardContent>
    </Card>
  );
};

export default FloorPlannerViewControls;
