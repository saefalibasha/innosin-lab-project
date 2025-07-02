import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { ProductFinish } from '@/types/product';

interface ProductFinishToggleProps {
  finishes: ProductFinish[];
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
}

const ProductFinishToggle: React.FC<ProductFinishToggleProps> = ({
  finishes,
  selectedFinish,
  onFinishChange
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Available Finishes</h3>
      <ToggleGroup 
        type="single" 
        value={selectedFinish} 
        onValueChange={onFinishChange}
        className="justify-start"
      >
        {finishes.map((finish) => (
          <ToggleGroupItem
            key={finish.type}
            value={finish.type}
            variant="outline"
            className="flex flex-col items-center gap-2 p-4 h-auto min-w-[120px] data-[state=on]:bg-sea/10 data-[state=on]:border-sea data-[state=on]:text-sea"
          >
            <span className="font-medium">{finish.name}</span>
            {finish.price && (
              <Badge variant="secondary" className="text-xs">
                {finish.price}
              </Badge>
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default ProductFinishToggle;