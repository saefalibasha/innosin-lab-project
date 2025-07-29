
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Home, Settings, Hand, Wrench, Building2, Layers, Shield, Droplets, Eye } from 'lucide-react';
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
    emergency_shower_type?: string;
    cabinet_class?: string;
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

  // Emergency Shower Series
  if (productSeries.toLowerCase().includes('emergency shower')) {
    const availableShowerTypes = Array.from(new Set(
      products.map(p => p.emergency_shower_type).filter(Boolean)
    ));
    
    const availableMountingTypes = Array.from(new Set(
      products.map(p => p.mounting_type).filter(Boolean)
    ));

    const availableFinishes = Array.from(new Set(
      products.map(p => p.finish_type).filter(Boolean)
    ));

    const availableDimensions = sortDimensions(Array.from(new Set(
      products.map(p => p.dimensions).filter(Boolean)
    )));

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Emergency Shower Type Selection */}
        {availableShowerTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Emergency Shower Type:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.emergency_shower_type || ''}
              onValueChange={(value) => onVariantChange('emergency_shower_type', value)}
              className="justify-start"
            >
              {availableShowerTypes.map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  {type === 'eye-wash' ? 'Eye Wash' : 
                   type === 'body-shower' ? 'Body Shower' : 
                   type === 'combination' ? 'Combination' : type}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
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
                  {type === 'wall-mounted' ? 'Wall Mounted' : 
                   type === 'deck-mounted' ? 'Deck Mounted' : 
                   type === 'ceiling-mounted' ? 'Ceiling Mounted' : 
                   type === 'floor-mounted' ? 'Floor Mounted' : type}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Dimensions Selection */}
        {availableDimensions.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Dimensions:
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
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Wrench className="h-3 w-3" />
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
                    {finish === 'powder-coat' ? 'Powder Coat' : 
                     finish === 'stainless-steel' ? 'Stainless Steel' : finish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  // TANGERINE Series Bio Safety Cabinet
  if (productSeries.toLowerCase().includes('tangerine')) {
    const availableCabinetClasses = Array.from(new Set(
      products.map(p => p.cabinet_class).filter(Boolean)
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
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Cabinet Class Selection */}
        {availableCabinetClasses.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Cabinet Class:
            </label>
            <ToggleGroup
              type="single"
              value={selectedVariants.cabinet_class || ''}
              onValueChange={(value) => onVariantChange('cabinet_class', value)}
              className="justify-start"
            >
              {availableCabinetClasses.map((cabinetClass) => (
                <ToggleGroupItem
                  key={cabinetClass}
                  value={cabinetClass}
                  variant="outline"
                  className="text-xs h-8 px-3"
                >
                  Class {cabinetClass}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Dimensions Selection */}
        {availableDimensions.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Dimensions:
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
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Wrench className="h-3 w-3" />
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
                    {finish === 'powder-coat' ? 'Powder Coat' : 
                     finish === 'stainless-steel' ? 'Stainless Steel' : finish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  // NOCE Series Fume Hood
  if (productSeries.toLowerCase().includes('noce')) {
    const availableDimensions = sortDimensions(Array.from(new Set(
      products.map(p => p.dimensions).filter(Boolean)
    )));

    const availableFinishes = Array.from(new Set(
      products.map(p => p.finish_type).filter(Boolean)
    ));

    const availableMountingTypes = Array.from(new Set(
      products.map(p => p.mounting_type).filter(Boolean)
    ));

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Dimensions Selection */}
        {availableDimensions.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Dimensions:
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

        {/* Finish Type Selection */}
        {availableFinishes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Wrench className="h-3 w-3" />
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
                    {finish === 'powder-coat' ? 'Powder Coat' : 
                     finish === 'stainless-steel' ? 'Stainless Steel' : finish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  // Safe Aire II and other fume hood series
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
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
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

        {/* Dimensions Selection */}
        {availableDimensions.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Dimensions:
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
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Wrench className="h-3 w-3" />
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
                    {finish === 'powder-coat' ? 'Powder Coat' : 
                     finish === 'stainless-steel' ? 'Stainless Steel' : finish}
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

    const availableFinishes = Array.from(new Set(
      products.map(p => p.finish_type).filter(Boolean)
    ));

    return (
      <div className="space-y-4">
        {/* Company Tag Display */}
        {products.length > 0 && products[0].company_tags && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
              {products[0].company_tags[0]}
            </Badge>
          </div>
        )}

        {/* Mixing Type Selection */}
        {availableMixingTypes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              Water Mixing:
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

        {/* Finish Type Selection */}
        {availableFinishes.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Wrench className="h-3 w-3" />
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
                    {finish === 'powder-coat' ? 'Powder Coat' : 
                     finish === 'stainless-steel' ? 'Stainless Steel' : finish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }

  // For other product series, show company tags if available
  if (products.length > 0 && products[0].company_tags && products[0].company_tags.length > 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Badge variant="default" className="text-sm bg-blue-500 hover:bg-blue-600">
            {products[0].company_tags[0]}
          </Badge>
        </div>
      </div>
    );
  }

  return null;
};
