
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface SettingsSidebarProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  scale,
  onScaleChange,
  gridSize,
  onGridSizeChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Scale</Label>
          <Slider
            value={[scale]}
            onValueChange={(value) => onScaleChange(value[0])}
            min={0.05}
            max={0.5}
            step={0.01}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground">
            1:{Math.round(1/scale)}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Grid Size</Label>
          <Input
            type="number"
            value={gridSize}
            onChange={(e) => onGridSizeChange(parseInt(e.target.value) || 20)}
            min="5"
            max="100"
            step="5"
          />
          <div className="text-sm text-muted-foreground">
            {gridSize}mm
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsSidebar;
