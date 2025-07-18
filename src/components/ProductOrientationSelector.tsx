import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

interface ProductOrientationSelectorProps {
  orientations: ('LH' | 'RH')[];
  selectedOrientation: 'LH' | 'RH' | 'None';
  onOrientationChange: (orientation: 'LH' | 'RH') => void;
}

const ProductOrientationSelector: React.FC<ProductOrientationSelectorProps> = ({
  orientations,
  selectedOrientation,
  onOrientationChange
}) => {
  if (orientations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <RotateCcw className="w-5 h-5" />
        Orientation
      </h3>
      <div className="flex gap-2">
        {orientations.map((orientation) => (
          <Button
            key={orientation}
            variant={selectedOrientation === orientation ? "default" : "outline"}
            size="sm"
            onClick={() => onOrientationChange(orientation)}
            className="transition-all duration-200 min-w-16"
          >
            {orientation}
          </Button>
        ))}
      </div>
      {selectedOrientation !== 'None' && (
        <div className="text-sm text-muted-foreground">
          Current orientation: <Badge variant="outline">{selectedOrientation}</Badge>
        </div>
      )}
    </div>
  );
};

export default ProductOrientationSelector;