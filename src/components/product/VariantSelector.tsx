import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ruler, Package } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  dimensions: string;
  finish_type: string;
  orientation: string;
  thumbnail_path: string;
  model_path: string;
  variant_type: string;
  drawer_count?: number;
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

    if (dimensionKeys.length === 1) {
      // If there's only one dimension group, show variants directly
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
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Select by Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {dimensionKeys.map((dimensions) => (
            <div key={dimensions}>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Badge variant="outline">{dimensions}</Badge>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {variantsByDimensions[dimensions].map((variant) => (
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
          ))}
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