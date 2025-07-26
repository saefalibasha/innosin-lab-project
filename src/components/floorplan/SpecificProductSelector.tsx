
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Home, Settings, Hand, Wrench, Building2 } from 'lucide-react';
import { Product } from '@/types/product';

interface SpecificProductSelectorProps {
  products: Product[];
  productSeries: string;
  selectedVariants: {
    mounting_type?: string;
    mixing_type?: string;
    handle_type?: string;
    dimensions?: string;
    finish_type?: string;
  };
  onVariantChange: (variantType: string, value: string) => void;
}

export const SpecificProductSelector: React.FC<SpecificProductSelectorProps> = ({
  products,
  productSeries,
  selectedVariants,
  onVariantChange
}) => {
  // Helper function to extract and sort dimensions numerically
  const sortDimensions = (dimensions: string[]): string[] => {
    return [...dimensions].sort((a, b) => {
      const extractFirstNum = (dim: string): number => {
        const match = dim.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return extractFirstNum(a) - extractFirstNum(b);
    });
  };

  // Safe Aire II Fume Hoods specific selectors
  if (productSeries.toLowerCase().includes('safe aire')) {
    const availableMountingTypes = Array.from(new Set(
      products.map(p => p.mounting_type).filter(Boolean)
    ));
    
    const availableDimensions = sortDimensions(Array.from(new Set(
      products.map(p => p.dimensions).filter(Boolean)
    )));

    const availableFinishes = Array.from(new Set(
      products.map(p => p.finish_type).filter(Boolean)
    ));

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-sm">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Mounting Type Selection */}
        {availableMountingTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Home className="h-3 w-3" />
              Mounting Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.mounting_type || ''}
              onValueChange={(value) => onVariantChange('mounting_type', value)}
              className="justify-start"
            >
              {availableMountingTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  {type === 'bench-mounted' ? 'Bench Mounted' : 'Floor Mounted'}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Dimensions Selection (smallest to largest) */}
        {availableDimensions.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Dimensions (smallest to largest):
            </label>
            <Select
              value={selectedVariants.dimensions || ''}
              onValueChange={(value) => onVariantChange('dimensions', value)}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select dimensions" />
              </SelectTrigger>
              <SelectContent>
                {availableDimensions.map((dimension) => (
                  <SelectItem key={dimension} value={dimension}>
                    {dimension}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Finish Type Selection */}
        {availableFinishes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Finish Type:
            </label>
            <Select
              value={selectedVariants.finish_type || ''}
              onValueChange={(value) => onVariantChange('finish_type', value)}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select finish type" />
              </SelectTrigger>
              <SelectContent>
                {availableFinishes.map((finish) => (
                  <SelectItem key={finish} value={finish}>
                    {finish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  // UNIFLEX Series Taps specific selectors
  if (productSeries.toLowerCase().includes('uniflex')) {
    const availableMixingTypes = Array.from(new Set(
      products.map(p => p.mixing_type).filter(Boolean)
    ));
    
    const availableHandleTypes = Array.from(new Set(
      products.map(p => p.handle_type).filter(Boolean)
    ));

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-sm">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Mixing Type Selection */}
        {availableMixingTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Settings className="h-3 w-3" />
              Mixing Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.mixing_type || ''}
              onValueChange={(value) => onVariantChange('mixing_type', value)}
              className="justify-start"
            >
              {availableMixingTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  {type === 'non-mix' ? 'Non-Mix' : 'Mix'}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Handle Type Selection */}
        {availableHandleTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Hand className="h-3 w-3" />
              Handle Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.handle_type || ''}
              onValueChange={(value) => onVariantChange('handle_type', value)}
              className="justify-start"
            >
              {availableHandleTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  {type === 'polypropylene' ? 'Polypropylene Handle' : 'Wrist Action Lever'}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
      </div>
    );
  }

  // For other product series, show company tags if available
  if (products.length > 0 && products[0].company_tags && products[0].company_tags.length > 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-sm">
            {products[0].company_tags[0]}
          </Badge>
        </div>
      </div>
    );
  }

  return null;
};
