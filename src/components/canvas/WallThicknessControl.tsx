
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface WallThicknessControlProps {
  thickness: number;
  onChange: (thickness: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const WallThicknessControl: React.FC<WallThicknessControlProps> = ({
  thickness,
  onChange,
  min = 50,
  max = 500,
  step = 5
}) => {
  const handleSliderChange = (value: number[]) => {
    onChange(value[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min;
    onChange(Math.max(min, Math.min(max, value)));
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-background border rounded-lg">
      <Label htmlFor="wall-thickness" className="text-sm font-medium whitespace-nowrap">
        Wall Thickness
      </Label>
      
      <div className="flex items-center gap-2 flex-1">
        <Slider
          id="wall-thickness"
          value={[thickness]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={thickness}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="w-20 text-center"
          />
          <span className="text-xs text-muted-foreground">mm</span>
        </div>
      </div>
    </div>
  );
};

export default WallThicknessControl;
