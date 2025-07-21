
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ruler, Package, Settings } from 'lucide-react';

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
  groupByDimensions?: boolean;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  groupByDimensions = true
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  if (groupByDimensions) {
    // Group variants by dimensions
    const variantsByDimensions = variants.reduce((acc, variant) => {
      const dimensions = variant.dimensions || 'Default';
      if (!acc[dimensions]) {
        acc[dimensions] = [];
      }
      acc[dimensions].push(variant);
      return acc;
    }, {} as Record<string, ProductVariant[]>);

    const dimensionKeys = Object.keys(variantsByDimensions);

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
              Available Dimensions
            </h4>
            <Select 
              value={selectedVariant?.dimensions || ''} 
              onValueChange={(dimensions) => {
                const variant = variants.find(v => v.dimensions === dimensions);
                if (variant) {
                  onVariantChange(variant.id);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select dimensions" />
              </SelectTrigger>
              <SelectContent>
                {dimensionKeys.map((dimensions) => (
                  <SelectItem key={dimensions} value={dimensions}>
                    {dimensions}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Configuration Options for Selected Dimension */}
          {selectedVariant && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Configuration Options
              </h4>
              <div className="space-y-3">
                {variantsByDimensions[selectedVariant.dimensions]?.map((variant) => (
                  <VariantOption
                    key={variant.id}
                    variant={variant}
                    isSelected={selectedVariantId === variant.id}
                    onSelect={() => onVariantChange(variant.id)}
                    showDimensions={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Selected Variant Summary */}
          {selectedVariant && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Selected Configuration</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Dimensions:</span> {selectedVariant.dimensions}
                </div>
                {selectedVariant.finish_type && (
                  <div>
                    <span className="font-medium">Finish:</span> {selectedVariant.finish_type === 'PC' ? 'Powder Coat' : selectedVariant.finish_type === 'SS' ? 'Stainless Steel' : selectedVariant.finish_type}
                  </div>
                )}
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
  }

  // Simple list without grouping
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Available Variants
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {variants.map((variant) => (
            <VariantOption
              key={variant.id}
              variant={variant}
              isSelected={selectedVariantId === variant.id}
              onSelect={() => onVariantChange(variant.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface VariantOptionProps {
  variant: ProductVariant;
  isSelected: boolean;
  onSelect: () => void;
  showDimensions?: boolean;
}

const VariantOption: React.FC<VariantOptionProps> = ({
  variant,
  isSelected,
  onSelect,
  showDimensions = true
}) => {
  const getVariantDisplayName = () => {
    const parts = [];
    
    if (showDimensions && variant.dimensions) {
      parts.push(variant.dimensions);
    }
    
    if (variant.finish_type && variant.finish_type !== 'PC') {
      parts.push(variant.finish_type === 'SS' ? 'Stainless Steel' : variant.finish_type);
    }
    
    if (variant.orientation && variant.orientation !== 'None') {
      parts.push(variant.orientation);
    }
    
    if (variant.drawer_count) {
      parts.push(`${variant.drawer_count} Drawer${variant.drawer_count > 1 ? 's' : ''}`);
    }
    
    if (variant.variant_type && variant.variant_type !== 'standard') {
      parts.push(variant.variant_type);
    }
    
    return parts.length > 0 ? parts.join(' - ') : variant.name;
  };

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      onClick={onSelect}
      className={`w-full justify-start text-left h-auto p-3 ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-center gap-3 w-full">
        {variant.thumbnail_path && (
          <img
            src={variant.thumbnail_path}
            alt={variant.name}
            className="w-12 h-12 object-cover rounded"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {getVariantDisplayName()}
          </div>
          {showDimensions && variant.dimensions && (
            <div className="text-xs text-muted-foreground">
              {variant.dimensions}
            </div>
          )}
        </div>
      </div>
    </Button>
  );
};

export default VariantSelector;
