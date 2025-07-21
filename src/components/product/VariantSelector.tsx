
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Ruler, Palette, Settings2 } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  product_code: string;
  category: string;
  dimensions: string;
  description: string;
  full_description: string;
  specifications: any;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
  finish_type: string;
  orientation: string;
  door_type: string;
  variant_type: string;
  drawer_count?: number;
  parent_series_id: string;
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
  groupByDimensions?: boolean;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange,
  groupByDimensions = true
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  // Get unique dimensions
  const uniqueDimensions = [...new Set(variants.map(v => v.dimensions || 'Standard'))];
  
  // Get selected dimension
  const selectedDimension = selectedVariant?.dimensions || uniqueDimensions[0];

  // Handle dimension change
  const handleDimensionChange = (dimensions: string) => {
    const variant = variants.find(v => v.dimensions === dimensions);
    if (variant) {
      onVariantChange(variant.id);
    }
  };

  // Available finish options
  const finishOptions = [
    { value: 'PC', label: 'Powder Coat', description: 'Durable powder coating finish' },
    { value: 'SS', label: 'Stainless Steel', description: 'Premium stainless steel finish' }
  ];

  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Settings2 className="w-5 h-5 text-primary" />
          Product Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dimension Selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-foreground">Dimensions</h4>
          </div>
          <Select value={selectedDimension} onValueChange={handleDimensionChange}>
            <SelectTrigger className="w-full h-11 border-muted">
              <SelectValue placeholder="Select dimensions" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDimensions.map((dimension) => (
                <SelectItem key={dimension} value={dimension} className="py-2">
                  {dimension}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Finish Selection */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold text-foreground">Finish Type</h4>
          </div>
          <RadioGroup value={selectedFinish} onValueChange={onFinishChange} className="space-y-3">
            {finishOptions.map((finish) => (
              <div key={finish.value} className="flex items-start space-x-3 p-3 rounded-lg border border-muted hover:bg-muted/30 transition-colors">
                <RadioGroupItem value={finish.value} id={finish.value} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <Label htmlFor={finish.value} className="cursor-pointer font-medium text-foreground">
                    {finish.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {finish.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Selected Configuration Summary */}
        {selectedVariant && (
          <div className="bg-muted/30 p-4 rounded-lg border">
            <h4 className="font-semibold text-foreground mb-3 text-base">Selected Configuration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-foreground">Product Code:</span>
                <p className="text-muted-foreground">{selectedVariant.product_code}</p>
              </div>
              <div>
                <span className="font-medium text-foreground">Dimensions:</span>
                <p className="text-muted-foreground">{selectedVariant.dimensions}</p>
              </div>
              <div>
                <span className="font-medium text-foreground">Finish:</span>
                <p className="text-muted-foreground">{selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}</p>
              </div>
              {selectedVariant.orientation && selectedVariant.orientation !== 'None' && (
                <div>
                  <span className="font-medium text-foreground">Orientation:</span>
                  <p className="text-muted-foreground">{selectedVariant.orientation}</p>
                </div>
              )}
              {selectedVariant.drawer_count && (
                <div>
                  <span className="font-medium text-foreground">Drawers:</span>
                  <p className="text-muted-foreground">{selectedVariant.drawer_count}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantSelector;
