
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { Product } from '@/types/product';

interface SeriesProductConfiguratorProps {
  series: Product;
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
}

const SeriesProductConfigurator: React.FC<SeriesProductConfiguratorProps> = ({
  series,
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange
}) => {
  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  
  const finishOptions = [
    { value: 'powder_coat', label: 'Powder Coat' },
    { value: 'stainless_steel', label: 'Stainless Steel' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configure Product
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Series Info */}
        <div>
          <h4 className="font-medium mb-2">Product Series</h4>
          <p className="text-sm text-muted-foreground">{series.name}</p>
        </div>

        {/* Variant Selection */}
        {variants.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Select Variant</h4>
            <div className="grid gap-2">
              {variants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariantId === variant.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onVariantChange(variant.id)}
                  className="justify-start text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>{variant.product_code || variant.name}</span>
                    {variant.dimensions && (
                      <Badge variant="secondary" className="text-xs">
                        {variant.dimensions}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Finish Selection */}
        <div>
          <h4 className="font-medium mb-3">Finish</h4>
          <div className="grid grid-cols-2 gap-2">
            {finishOptions.map((finish) => (
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
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">{selectedVariant.product_code}</span>
              </div>
              {selectedVariant.dimensions && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium">{selectedVariant.dimensions}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finish:</span>
                <span className="font-medium">
                  {finishOptions.find(f => f.value === selectedFinish)?.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SeriesProductConfigurator;
