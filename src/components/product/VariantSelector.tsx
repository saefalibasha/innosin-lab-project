
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Ruler, Settings, Palette } from 'lucide-react';

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
    { value: 'PC', label: 'Powder Coat' },
    { value: 'SS', label: 'Stainless Steel' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Product Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dimension Selection */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Dimensions
          </h4>
          <Select value={selectedDimension} onValueChange={handleDimensionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select dimensions" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDimensions.map((dimension) => (
                <SelectItem key={dimension} value={dimension}>
                  {dimension}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Finish Selection */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Finish Type
          </h4>
          <RadioGroup value={selectedFinish} onValueChange={onFinishChange}>
            <div className="grid grid-cols-2 gap-4">
              {finishOptions.map((finish) => (
                <div key={finish.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={finish.value} id={finish.value} />
                  <Label htmlFor={finish.value} className="cursor-pointer">
                    {finish.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Selected Configuration Summary */}
        {selectedVariant && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Selected Configuration</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Product Code:</span> {selectedVariant.product_code}
              </div>
              <div>
                <span className="font-medium">Dimensions:</span> {selectedVariant.dimensions}
              </div>
              <div>
                <span className="font-medium">Finish:</span> {selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}
              </div>
              {selectedVariant.orientation && selectedVariant.orientation !== 'None' && (
                <div>
                  <span className="font-medium">Orientation:</span> {selectedVariant.orientation}
                </div>
              )}
              {selectedVariant.drawer_count && (
                <div>
                  <span className="font-medium">Drawers:</span> {selectedVariant.drawer_count}
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
