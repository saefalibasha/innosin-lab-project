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

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateCounterClockwise}
            className="h-8 w-8 p-0"
            title="Rotate 90° Counter-Clockwise"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateClockwise}
            className="h-8 w-8 p-0"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {selectedProducts.length} selected
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductRotationControl;