
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  product_code: string;
  dimensions: string;
  orientation: string;
  door_type?: string;
  variant_type: string;
  drawer_count?: number;
  finish_type: string;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
  groupByDimensions?: boolean;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange,
  groupByDimensions = false
}) => {
  console.log('🔍 VariantSelector rendering with variants:', variants);
  console.log('🔍 Selected variant ID:', selectedVariantId);
  console.log('🔍 Selected finish:', selectedFinish);

  if (!variants || variants.length === 0) {
    return null;
  }

  // Group variants by dimensions if requested
  const groupedVariants = groupByDimensions ? 
    variants.reduce((acc, variant) => {
      const key = variant.dimensions || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(variant);
      return acc;
    }, {} as Record<string, Variant[]>) :
    { 'All': variants };

  // Get unique dimension groups
  const dimensionGroups = Object.keys(groupedVariants).sort();

  // Get unique orientations from all variants
  const orientations = [...new Set(variants.map(v => v.orientation).filter(Boolean))].sort();

  // Get unique drawer counts from all variants
  const drawerCounts = [...new Set(variants.map(v => v.drawer_count).filter(Boolean))].sort((a, b) => a - b);

  // Get unique variant types
  const variantTypes = [...new Set(variants.map(v => v.variant_type).filter(Boolean))];

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  console.log('🔍 Dimension groups:', dimensionGroups);
  console.log('🔍 Available orientations:', orientations);
  console.log('🔍 Available drawer counts:', drawerCounts);
  console.log('🔍 Selected variant:', selectedVariant);

  const formatOrientation = (orientation: string) => {
    switch (orientation) {
      case 'LH': return 'Left Hand';
      case 'RH': return 'Right Hand';
      default: return orientation;
    }
  };

  const formatVariantType = (type: string) => {
    switch (type) {
      case 'standard': return 'Standard';
      case 'combination': return 'Combination';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

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
        {groupByDimensions && dimensionGroups.length > 1 && (
          <div>
            <h4 className="font-medium mb-3">Dimensions</h4>
            <div className="grid grid-cols-2 gap-2">
              {dimensionGroups.map((dimension) => {
                const isSelected = groupedVariants[dimension].some(v => v.id === selectedVariantId);
                return (
                  <Button
                    key={dimension}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const firstVariant = groupedVariants[dimension][0];
                      if (firstVariant) {
                        onVariantChange(firstVariant.id);
                      }
                    }}
                    className="text-sm"
                  >
                    {dimension}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Variant Type Selection */}
        {variantTypes.length > 1 && (
          <div>
            <h4 className="font-medium mb-3">Configuration Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {variantTypes.map((type) => {
                const typeVariants = variants.filter(v => v.variant_type === type);
                const isSelected = selectedVariant?.variant_type === type;
                
                return (
                  <Button
                    key={type}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const firstOfType = typeVariants[0];
                      if (firstOfType) {
                        onVariantChange(firstOfType.id);
                      }
                    }}
                    className="text-sm"
                  >
                    {formatVariantType(type)}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Drawer Count Selection */}
        {drawerCounts.length > 1 && (
          <div>
            <h4 className="font-medium mb-3">Drawer Configuration</h4>
            <div className="grid grid-cols-3 gap-2">
              {drawerCounts.map((count) => {
                const drawerVariants = variants.filter(v => v.drawer_count === count);
                const isSelected = selectedVariant?.drawer_count === count;
                
                return (
                  <Button
                    key={count}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const matchingVariant = drawerVariants.find(v => 
                        v.orientation === selectedVariant?.orientation || 
                        (!selectedVariant?.orientation && v.orientation === 'None')
                      ) || drawerVariants[0];
                      
                      if (matchingVariant) {
                        onVariantChange(matchingVariant.id);
                      }
                    }}
                    className="text-sm"
                  >
                    {count} {count === 1 ? 'Drawer' : 'Drawers'}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Orientation Selection */}
        {orientations.length > 1 && orientations.some(o => o !== 'None') && (
          <div>
            <h4 className="font-medium mb-3">Orientation</h4>
            <div className="grid grid-cols-2 gap-2">
              {orientations.filter(o => o !== 'None').map((orientation) => {
                const orientationVariants = variants.filter(v => v.orientation === orientation);
                const isSelected = selectedVariant?.orientation === orientation;
                
                return (
                  <Button
                    key={orientation}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const matchingVariant = orientationVariants.find(v => 
                        v.drawer_count === selectedVariant?.drawer_count ||
                        v.variant_type === selectedVariant?.variant_type
                      ) || orientationVariants[0];
                      
                      if (matchingVariant) {
                        onVariantChange(matchingVariant.id);
                      }
                    }}
                    className="text-sm"
                  >
                    {formatOrientation(orientation)}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Finish Selection */}
        <div>
          <h4 className="font-medium mb-3">Finish</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedFinish === 'PC' ? "default" : "outline"}
              size="sm"
              onClick={() => onFinishChange('PC')}
              className="text-sm"
            >
              Powder Coat
            </Button>
            <Button
              variant={selectedFinish === 'SS' ? "default" : "outline"}
              size="sm"
              onClick={() => onFinishChange('SS')}
              className="text-sm"
            >
              Stainless Steel
            </Button>
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dimensions:</span>
                <span className="text-sm font-medium">{selectedVariant.dimensions}</span>
              </div>
              {selectedVariant.drawer_count && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Drawers:</span>
                  <span className="text-sm font-medium">{selectedVariant.drawer_count}</span>
                </div>
              )}
              {selectedVariant.orientation && selectedVariant.orientation !== 'None' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Orientation:</span>
                  <span className="text-sm font-medium">{formatOrientation(selectedVariant.orientation)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Finish:</span>
                <span className="text-sm font-medium">
                  {selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}
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
