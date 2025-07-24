
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface SettingsSidebarProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  showMeasurements: boolean;
  setShowMeasurements: React.Dispatch<React.SetStateAction<boolean>>;
  gridSize: number;
  setGridSize: React.Dispatch<React.SetStateAction<number>>;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  scale,
  setScale,
  showGrid,
  setShowGrid,
  showMeasurements,
  setShowMeasurements,
  gridSize,
  setGridSize
}) => {
  return (
    <div className="w-64 bg-white border-l p-4">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scale">Scale: {scale.toFixed(2)}</Label>
          <Slider
            id="scale"
            value={[scale]}
            onValueChange={(value) => setScale(value[0])}
            min={0.1}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-grid"
            checked={showGrid}
            onCheckedChange={setShowGrid}
          />
          <Label htmlFor="show-grid">Show Grid</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-measurements"
            checked={showMeasurements}
            onCheckedChange={setShowMeasurements}
          />
          <Label htmlFor="show-measurements">Show Measurements</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="grid-size">Grid Size: {gridSize}mm</Label>
          <Slider
            id="grid-size"
            value={[gridSize]}
            onValueChange={(value) => setGridSize(value[0])}
            min={10}
            max={500}
            step={10}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
