
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Palette, Ruler, Droplets, Mountain, Wrench } from 'lucide-react';
import { Product } from '@/types/product';

interface SpecificProductSelectorProps {
  products: Product[];
  productSeries: string;
  selectedVariants: {
    finish?: string;
    orientation?: string;
    drawerCount?: string;
    doorType?: string;
    dimensions?: string;
    mounting_type?: string;
    mixing_type?: string;
    handle_type?: string;
    emergency_shower_type?: string;
    cabinet_class?: string;
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
  console.log('SpecificProductSelector - Debug info:', {
    productSeries,
    productsCount: products.length,
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      emergency_shower_type: p.emergency_shower_type,
      mounting_type: p.mounting_type,
      mixing_type: p.mixing_type,
      handle_type: p.handle_type,
      dimensions: p.dimensions,
      finish_type: p.finish_type
    }))
  });

  // Updated series detection logic to match ProductDetail.tsx
  const isEmergencyShowerSeries = 
    productSeries === 'Broen-Lab Emergency Shower Systems' ||
    productSeries === 'Broen-Lab Emergency Shower Systems ' ||
    productSeries.toLowerCase().includes('emergency shower');
  
  const isUniflexSeries = 
    products.some(p => p.name?.toLowerCase().includes('uniflex')) ||
    productSeries.toLowerCase().includes('uniflex');
  
  const isSafeAireSeries = 
    productSeries === 'Safe Aire II Fume Hoods' ||
    productSeries.toLowerCase().includes('safe aire');
  
  const isTangerineSeries = productSeries.toLowerCase().includes('tangerine');
  const isNoceSeries = productSeries.toLowerCase().includes('noce');

  console.log('SpecificProductSelector - Series detection:', {
    isEmergencyShowerSeries,
    isUniflexSeries,
    isSafeAireSeries,
    isTangerineSeries,
    isNoceSeries
  });

  // Extract available variant options from products
  const availableFinishes = Array.from(new Set(
    products.map(p => p.finish_type).filter(Boolean)
  ));
  
  const availableDimensions = Array.from(new Set(
    products.map(p => p.dimensions).filter(Boolean)
  )).sort();

  const availableMountingTypes = Array.from(new Set(
    products.map(p => p.mounting_type).filter(Boolean)
  ));

  const availableMixingTypes = Array.from(new Set(
    products.map(p => p.mixing_type).filter(Boolean)
  ));

  const availableHandleTypes = Array.from(new Set(
    products.map(p => p.handle_type).filter(Boolean)
  ));

  const availableEmergencyShowerTypes = Array.from(new Set(
    products.map(p => p.emergency_shower_type).filter(Boolean)
  ));

  const availableCabinetClasses = Array.from(new Set(
    products.map(p => p.cabinet_class).filter(Boolean)
  ));

  console.log('SpecificProductSelector - Available variants:', {
    availableEmergencyShowerTypes,
    availableMountingTypes,
    availableMixingTypes,
    availableHandleTypes,
    availableFinishes,
    availableDimensions
  });

  const getFinishDisplayName = (finish: string) => {
    const finishMap: Record<string, string> = {
      'PC': 'Powder Coat',
      'SS304': 'Stainless Steel',
      'powder-coat': 'Powder Coat',
      'stainless-steel': 'Stainless Steel'
    };
    return finishMap[finish] || finish;
  };

  return (
    <div className="space-y-4">
      {/* Debug information */}
      <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded">
        <div>Emergency Shower Series: {isEmergencyShowerSeries ? 'Yes' : 'No'}</div>
        <div>UNIFLEX Series: {isUniflexSeries ? 'Yes' : 'No'}</div>
        <div>Safe Aire Series: {isSafeAireSeries ? 'Yes' : 'No'}</div>
        <div>Available Options: Emergency({availableEmergencyShowerTypes.length}), Mounting({availableMountingTypes.length}), Mixing({availableMixingTypes.length}), Handle({availableHandleTypes.length})</div>
      </div>

      {/* Emergency Shower Series - emergency_shower_type and mounting_type */}
      {isEmergencyShowerSeries && (
        <>
          {availableEmergencyShowerTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                Emergency Shower Type:
              </label>
              <Select
                value={selectedVariants.emergency_shower_type || ''}
                onValueChange={(value) => onVariantChange('emergency_shower_type', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select emergency shower type" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmergencyShowerTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableMountingTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Mountain className="h-3 w-3" />
                Mounting Type:
              </label>
              <Select
                value={selectedVariants.mounting_type || ''}
                onValueChange={(value) => onVariantChange('mounting_type', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select mounting type" />
                </SelectTrigger>
                <SelectContent>
                  {availableMountingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* UNIFLEX Series - mixing_type and handle_type */}
      {isUniflexSeries && (
        <>
          {availableMixingTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                Mixing Type:
              </label>
              <Select
                value={selectedVariants.mixing_type || ''}
                onValueChange={(value) => onVariantChange('mixing_type', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select mixing type" />
                </SelectTrigger>
                <SelectContent>
                  {availableMixingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableHandleTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                Handle Type:
              </label>
              <Select
                value={selectedVariants.handle_type || ''}
                onValueChange={(value) => onVariantChange('handle_type', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select handle type" />
                </SelectTrigger>
                <SelectContent>
                  {availableHandleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* Safe Aire II Series - mounting_type and dimensions */}
      {isSafeAireSeries && (
        <>
          {availableMountingTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Mountain className="h-3 w-3" />
                Mounting Type:
              </label>
              <Select
                value={selectedVariants.mounting_type || ''}
                onValueChange={(value) => onVariantChange('mounting_type', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select mounting type" />
                </SelectTrigger>
                <SelectContent>
                  {availableMountingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableDimensions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Ruler className="h-3 w-3" />
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
        </>
      )}

      {/* TANGERINE and NOCE Series - cabinet_class and finish_type */}
      {(isTangerineSeries || isNoceSeries) && (
        <>
          {availableCabinetClasses.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Badge className="h-3 w-3" />
                Cabinet Class:
              </label>
              <Select
                value={selectedVariants.cabinet_class || ''}
                onValueChange={(value) => onVariantChange('cabinet_class', value)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select cabinet class" />
                </SelectTrigger>
                <SelectContent>
                  {availableCabinetClasses.map((cabinetClass) => (
                    <SelectItem key={cabinetClass} value={cabinetClass}>
                      {cabinetClass}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* Common finish selection for all specific series */}
      {availableFinishes.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Palette className="h-3 w-3" />
            Finish Type:
          </label>
          <ToggleGroup
            type="single"
            value={selectedVariants.finish_type || ''}
            onValueChange={(value) => onVariantChange('finish_type', value)}
            className="justify-start"
          >
            {availableFinishes.map((finish) => (
              <ToggleGroupItem
                key={finish}
                value={finish}
                variant="outline"
                className="text-xs h-8 px-3"
              >
                {getFinishDisplayName(finish)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {/* Common dimensions selection for series that need it (not Safe Aire as it's handled above) */}
      {!isSafeAireSeries && availableDimensions.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Ruler className="h-3 w-3" />
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
    </div>
  );
};
