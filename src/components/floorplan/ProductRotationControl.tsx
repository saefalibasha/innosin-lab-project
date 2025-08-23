import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCw, RotateCcw } from 'lucide-react';

interface ProductRotationControlProps {
  selectedProducts: string[];
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onRotateToAngle: (angle: number) => void;
}

const ProductRotationControl: React.FC<ProductRotationControlProps> = ({
  selectedProducts,
  onRotateClockwise,
  onRotateCounterClockwise,
  onRotateToAngle
}) => {
  if (selectedProducts.length === 0) return null;

  const rotationAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <Card className="absolute top-4 right-4 z-10">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium">Rotate Products</span>
          <span className="text-xs text-muted-foreground">({selectedProducts.length} selected)</span>
        </div>
        
        <div className="flex gap-1 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateCounterClockwise}
            className="p-2"
            title="Rotate 90° Counter-Clockwise"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateClockwise}
            className="p-2"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-4 gap-1">
          {rotationAngles.map(angle => (
            <Button
              key={angle}
              variant="outline"
              size="sm"
              onClick={() => onRotateToAngle((angle * Math.PI) / 180)}
              className="text-xs h-8"
              title={`Rotate to ${angle}°`}
            >
              {angle}°
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductRotationControl;