import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface ProductTypeSelectorProps {
  types: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const ProductTypeSelector: React.FC<ProductTypeSelectorProps> = ({
  types,
  selectedType,
  onTypeChange
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Package className="w-5 h-5" />
        Types
      </h3>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(type)}
            className="transition-all duration-200"
          >
            {type}
          </Button>
        ))}
      </div>
      {selectedType && (
        <div className="text-sm text-muted-foreground">
          Current type: <Badge variant="outline">{selectedType}</Badge>
        </div>
      )}
    </div>
  );
};

export default ProductTypeSelector;