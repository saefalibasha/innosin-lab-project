import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductVariant } from '@/types/product';
import { Ruler } from 'lucide-react';

interface ProductSizeSelectorProps {
  variants: ProductVariant[];
  selectedVariant: string;
  onVariantChange: (variantId: string) => void;
}

const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange
}) => {
  const selectedVariantData = variants.find(v => v.id === selectedVariant);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Ruler className="w-5 h-5" />
        Available Sizes
      </h3>
      <Select value={selectedVariant} onValueChange={onVariantChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {variants.map((variant) => (
            <SelectItem key={variant.id} value={variant.id}>
              <div className="flex items-center gap-3">
                <span className="font-medium">{variant.size}</span>
                <Badge variant="outline" className="text-xs">
                  {variant.dimensions}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedVariantData && (
        <div className="text-sm text-muted-foreground">
          Current selection: <span className="font-medium">{selectedVariantData.size}</span> 
          <span className="mx-2">•</span>
          <span>{selectedVariantData.dimensions}</span>
        </div>
      )}
    </div>
  );
};

export default ProductSizeSelector;