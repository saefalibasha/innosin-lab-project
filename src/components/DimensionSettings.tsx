
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UseDisclosureReturn } from '@/components/ui/use-disclosure';

interface DimensionSettingsProps {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showMeasurements: boolean;
  setShowMeasurements: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  scale: number;
  setScale: (scale: number) => void;
  disclosure: UseDisclosureReturn;
}

const DimensionSettings: React.FC<DimensionSettingsProps> = ({
  showGrid,
  setShowGrid,
  showMeasurements,
  setShowMeasurements,
  gridSize,
  setGridSize,
  scale,
  setScale,
  disclosure
}) => {
  return (
    <Dialog open={disclosure.isOpen} onOpenChange={disclosure.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dimension Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Grid Settings</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-grid"
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
              <Label htmlFor="show-grid">Show Grid</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grid-size">Grid Size: {gridSize}mm</Label>
              <Slider
                id="grid-size"
                min={100}
                max={1000}
                step={50}
                value={[gridSize]}
                onValueChange={(value) => setGridSize(value[0])}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Measurement Settings</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-measurements"
                checked={showMeasurements}
                onCheckedChange={setShowMeasurements}
              />
              <Label htmlFor="show-measurements">Show Measurements</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scale">Scale: {scale}x</Label>
            <Slider
              id="scale"
              min={0.1}
              max={3}
              step={0.1}
              value={[scale]}
              onValueChange={(value) => setScale(value[0])}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DimensionSettings;
