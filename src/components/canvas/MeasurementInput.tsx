
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Ruler, Grid, Target } from 'lucide-react';
import { MeasurementConfig, formatMeasurement, convertToMm, GRID_SIZES } from '@/utils/measurements';

interface MeasurementInputProps {
  scale: number;
  gridSize: number;
  onScaleChange: (scale: number) => void;
  onGridSizeChange: (size: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showMeasurements: boolean;
  onToggleMeasurements: () => void;
}

const MeasurementInput: React.FC<MeasurementInputProps> = ({
  scale,
  gridSize,
  onScaleChange,
  onGridSizeChange,
  showGrid,
  onToggleGrid,
  showMeasurements,
  onToggleMeasurements
}) => {
  const [customDimension, setCustomDimension] = useState({ width: '', height: '' });

  const handleGridSizeChange = useCallback((size: keyof typeof GRID_SIZES) => {
    onGridSizeChange(GRID_SIZES[size]);
  }, [onGridSizeChange]);

  const handleCustomDimension = useCallback(() => {
    const width = parseFloat(customDimension.width);
    const height = parseFloat(customDimension.height);
    
    if (width && height) {
      // Calculate scale based on canvas size and desired room size
      const canvasWidth = 1200;
      const canvasHeight = 800;
      const scaleX = canvasWidth / convertToMm(width, 'mm');
      const scaleY = canvasHeight / convertToMm(height, 'mm');
      const newScale = Math.min(scaleX, scaleY) * 0.8; // 80% to leave margins
      
      onScaleChange(newScale);
      setCustomDimension({ width: '', height: '' });
    }
  }, [customDimension, onScaleChange]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Measurement Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid Controls */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Grid Settings</Label>
          <div className="flex items-center gap-2">
            <Button
              variant={showGrid ? "default" : "outline"}
              size="sm"
              onClick={onToggleGrid}
              className="flex-1"
            >
              <Grid className="h-3 w-3 mr-1" />
              {showGrid ? 'Hide' : 'Show'} Grid
            </Button>
            <Button
              variant={showMeasurements ? "default" : "outline"}
              size="sm"
              onClick={onToggleMeasurements}
              className="flex-1"
            >
              <Target className="h-3 w-3 mr-1" />
              Measurements
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(GRID_SIZES).map(([key, size]) => (
              <Button
                key={key}
                variant={gridSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => handleGridSizeChange(key as keyof typeof GRID_SIZES)}
                className="text-xs"
              >
                {size}mm
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Custom Room Dimensions */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Room Dimensions (mm)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                placeholder="5000"
                value={customDimension.width}
                onChange={(e) => setCustomDimension(prev => ({ ...prev, width: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                placeholder="4000"
                value={customDimension.height}
                onChange={(e) => setCustomDimension(prev => ({ ...prev, height: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleCustomDimension}
            disabled={!customDimension.width || !customDimension.height}
            className="w-full"
          >
            Set Room Size
          </Button>
        </div>

        <Separator />

        {/* Scale Info */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Scale Info</Label>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Current Scale: {scale.toFixed(4)} px/mm</div>
            <div>Grid Size: {gridSize}mm</div>
            <div>1 pixel = {formatMeasurement(1/scale, { unit: 'mm', precision: 2, showUnit: true })}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeasurementInput;
