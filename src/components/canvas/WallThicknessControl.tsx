
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface WallThicknessControlProps {
  thickness: number;
  onChange: (thickness: number) => void;
  onThicknessChange?: (thickness: number) => void; // Legacy prop support
}

const WallThicknessControl: React.FC<WallThicknessControlProps> = ({
  thickness,
  onChange,
  onThicknessChange
}) => {
  const handleChange = (value: number) => {
    onChange(value);
    onThicknessChange?.(value);
  };

  return (
    <div className="bg-background border rounded-lg p-4 shadow-sm">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Wall Thickness</Label>
        
        <div className="flex items-center space-x-3">
          <Input
            type="number"
            value={thickness}
            onChange={(e) => handleChange(parseInt(e.target.value) || 100)}
            min="50"
            max="500"
            step="10"
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">mm</span>
        </div>
        
        <Slider
          value={[thickness]}
          onValueChange={(value) => handleChange(value[0])}
          min={50}
          max={500}
          step={10}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>50mm</span>
          <span>500mm</span>
        </div>
      </div>
    </div>
  );
};

export default WallThicknessControl;
