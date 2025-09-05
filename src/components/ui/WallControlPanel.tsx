import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WallSegment } from '@/types/floorPlanTypes';
import { X, Ruler, Eye, EyeOff } from 'lucide-react';

interface WallControlPanelProps {
  selectedWall: WallSegment | null;
  onWallUpdate: (wallId: string, updates: Partial<WallSegment>) => void;
  onClose: () => void;
  onVisibilityToggle: (wallId: string) => void;
}

export const WallControlPanel: React.FC<WallControlPanelProps> = ({
  selectedWall,
  onWallUpdate,
  onClose,
  onVisibilityToggle
}) => {
  const [height, setHeight] = useState(selectedWall?.height || 2400);
  const [thickness, setThickness] = useState(selectedWall?.thickness || 100);

  if (!selectedWall) return null;

  const handleHeightChange = (value: number[]) => {
    const newHeight = value[0];
    setHeight(newHeight);
    onWallUpdate(selectedWall.id, { height: newHeight });
  };

  const handleThicknessChange = (value: number[]) => {
    const newThickness = value[0];
    setThickness(newThickness);
    onWallUpdate(selectedWall.id, { thickness: newThickness });
  };

  const handleHeightInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value) || 2400;
    setHeight(newHeight);
    onWallUpdate(selectedWall.id, { height: newHeight });
  };

  const handleThicknessInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newThickness = parseInt(e.target.value) || 100;
    setThickness(newThickness);
    onWallUpdate(selectedWall.id, { thickness: newThickness });
  };

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Wall Properties
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Wall ID */}
        <div className="text-xs text-muted-foreground">
          Wall ID: {selectedWall.id.slice(0, 8)}...
        </div>

        {/* Height Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Height (mm)</Label>
          <div className="flex items-center space-x-2">
            <Slider
              value={[height]}
              onValueChange={handleHeightChange}
              min={1000}
              max={4000}
              step={50}
              className="flex-1"
            />
            <Input
              type="number"
              value={height}
              onChange={handleHeightInput}
              className="w-20 h-8 text-xs"
              min={1000}
              max={4000}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Range: 1000mm - 4000mm
          </div>
        </div>

        {/* Thickness Control */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Thickness (mm)</Label>
          <div className="flex items-center space-x-2">
            <Slider
              value={[thickness]}
              onValueChange={handleThicknessChange}
              min={50}
              max={300}
              step={10}
              className="flex-1"
            />
            <Input
              type="number"
              value={thickness}
              onChange={handleThicknessInput}
              className="w-20 h-8 text-xs"
              min={50}
              max={300}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Range: 50mm - 300mm
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleHeightChange([2400])}
              className="text-xs"
            >
              Standard (2400mm)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleHeightChange([3000])}
              className="text-xs"
            >
              High (3000mm)
            </Button>
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Label className="text-sm font-medium">Visibility</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVisibilityToggle(selectedWall.id)}
            className="flex items-center gap-2"
          >
            {selectedWall.visible !== false ? (
              <>
                <Eye className="w-4 h-4" />
                Visible
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Hidden
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};