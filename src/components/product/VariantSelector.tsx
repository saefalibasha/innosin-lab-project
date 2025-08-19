
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { 
  getSeriesConfiguration, 
  groupVariantsByConfiguration, 
  formatAttributeValue 
} from '@/utils/seriesConfigurationManager';

interface VariantSelectorProps {
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
  seriesSlug?: string;
  seriesName?: string;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange,
  seriesSlug = "",
  seriesName = ""
}) => {
  if (!variants || variants.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No variants available for this product.
      </div>
    );
  }

  // Get series configuration and group variants
  const configuration = getSeriesConfiguration(seriesSlug, seriesName);
  const groupedVariants = groupVariantsByConfiguration(variants, configuration);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <h4 className="font-medium mb-3">Select {configuration.displayName}</h4>
        
        {/* Grouped Variants */}
        {Object.entries(groupedVariants).map(([groupKey, groupVariants]) => (
          <div key={groupKey} className="mb-4">
            <div className="font-semibold text-muted-foreground mb-2">
              {groupKey}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {groupVariants.map((variant) => {
                const isSelected = selectedVariantId === variant.id;
                return (
                  <Button
                    key={variant.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onVariantChange(variant.id)}
                    className="text-sm"
                  >
                    {variant.product_code || variant.name}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Finish Selection */}
        <div>
          <h4 className="font-medium mb-3">Finish</h4>
          <div className="grid grid-cols-2 gap-2">
            {configuration.finishOptions.map((finish) => (
              <Button
                key={finish.value}
                variant={selectedFinish === finish.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFinishChange(finish.value)}
                className="text-sm"
              >
                {finish.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Selection Summary */}
        {selectedVariant && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Current Selection</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Product Code:</span>
                <Badge variant="outline">{selectedVariant.product_code}</Badge>
              </div>

              {selectedVariant.dimensions && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dimensions:</span>
                  <span className="text-sm font-medium">{selectedVariant.dimensions}</span>
                </div>
              )}

              {configuration.groupingAttributes.map((attr) => {
                const value = selectedVariant[attr as keyof Product];
                if (!value || value === 'None') return null;

                return (
                  <div key={attr} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {attr.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}:
                    </span>
                    <span className="text-sm font-medium">
                      {formatAttributeValue(attr, value)}
                    </span>
                  </div>
                );
              })}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Finish:</span>
                <span className="text-sm font-medium">
                  {configuration.finishOptions.find(f => f.value === selectedFinish)?.label || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantSelector;
