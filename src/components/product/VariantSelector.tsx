
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DoorTypeSelector from './DoorTypeSelector';

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
  // Additional fields for special series
  emergency_shower_type?: string;
  mounting_type?: string;
  mixing_type?: string;
  handle_type?: string;
  cabinet_class?: string;
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

  if (!variants || variants.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No variants available for this product.
      </div>
    );
  }

  // Helper function to extract length from dimensions string
  const extractLength = (dimensions: string): number => {
    const match = dimensions?.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Get unique values for each selector type
  const emergencyShowerTypes = [...new Set(variants.map(v => v.emergency_shower_type).filter(Boolean))].sort();
  const mountingTypes = [...new Set(variants.map(v => v.mounting_type).filter(Boolean))].sort();
  const mixingTypes = [...new Set(variants.map(v => v.mixing_type).filter(Boolean))].sort();
  const handleTypes = [...new Set(variants.map(v => v.handle_type).filter(Boolean))].sort();
  const cabinetClasses = [...new Set(variants.map(v => v.cabinet_class).filter(Boolean))].sort();
  const dimensions = [...new Set(variants.map(v => v.dimensions).filter(Boolean))].sort((a, b) => extractLength(a) - extractLength(b));
  const doorTypes = [...new Set(variants.map(v => v.door_type).filter(Boolean))].sort();
  const orientations = [...new Set(variants.map(v => v.orientation).filter(o => o && o !== 'None'))].sort();
  const drawerCounts = [...new Set(variants.map(v => v.drawer_count).filter(Boolean))].sort((a, b) => a - b);
  const variantTypes = [...new Set(variants.map(v => v.variant_type).filter(Boolean))];

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

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

  // Helper function to find the best matching variant when switching between options
  const findBestMatchingVariant = (targetCriteria: Partial<Variant>) => {
    const currentVariant = selectedVariant;
    if (!currentVariant) return variants[0];

    // Try to find exact match first
    let bestMatch = variants.find(v => 
      (!targetCriteria.dimensions || v.dimensions === targetCriteria.dimensions) &&
      (!targetCriteria.drawer_count || v.drawer_count === targetCriteria.drawer_count) &&
      (!targetCriteria.orientation || v.orientation === targetCriteria.orientation) &&
      (!targetCriteria.variant_type || v.variant_type === targetCriteria.variant_type) &&
      (!targetCriteria.door_type || v.door_type === targetCriteria.door_type) &&
      (!targetCriteria.emergency_shower_type || v.emergency_shower_type === targetCriteria.emergency_shower_type) &&
      (!targetCriteria.mounting_type || v.mounting_type === targetCriteria.mounting_type) &&
      (!targetCriteria.mixing_type || v.mixing_type === targetCriteria.mixing_type) &&
      (!targetCriteria.handle_type || v.handle_type === targetCriteria.handle_type) &&
      (!targetCriteria.cabinet_class || v.cabinet_class === targetCriteria.cabinet_class)
    );

    // If no exact match, try to preserve as many current attributes as possible
    if (!bestMatch) {
      bestMatch = variants.find(v => 
        (!targetCriteria.dimensions || v.dimensions === targetCriteria.dimensions) &&
        (!targetCriteria.emergency_shower_type || v.emergency_shower_type === targetCriteria.emergency_shower_type) &&
        (!targetCriteria.mounting_type || v.mounting_type === targetCriteria.mounting_type) &&
        (!targetCriteria.mixing_type || v.mixing_type === targetCriteria.mixing_type) &&
        (!targetCriteria.handle_type || v.handle_type === targetCriteria.handle_type)
      );
    }

    return bestMatch || variants[0];
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        {/* Emergency Shower Type Selection */}
        {emergencyShowerTypes.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Emergency Shower Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {emergencyShowerTypes.map((type) => {
                const isSelected = selectedVariant?.emergency_shower_type === type;
                return (
                  <Button
                    key={type}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const bestMatch = findBestMatchingVariant({ emergency_shower_type: type });
                      if (bestMatch) {
                        onVariantChange(bestMatch.id);
                      }
                    }}
                    className="text-sm"
                  >
                    {type}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mounting Type Selection */}
        {mountingTypes.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Mounting Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {mountingTypes.map((type) => {
                const isSelected = selectedVariant?.mounting_type === type;
                return (
                  <Button
                    key={type}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const bestMatch = findBestMatchingVariant({ mounting_type: type });
                      if (bestMatch) {
                        onVariantChange(bestMatch.id);
                      }
                    }}
                    className="text-sm"
                  >
                    {type}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mixing Type Selection */}
        {mixingTypes.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Mixing Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {mixingTypes.map((type) => {
                const isSelected = selectedVariant?.mixing_type === type;
                return (
                  <Button
                    key={type}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const bestMatch = findBestMatchingVariant({ mixing_type: type });
                      if (bestMatch) {
                        onVariantChange(bestMatch.id);
                      }
                    }}
                    className="text-sm"
                  >
                    {type}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Handle Type Selection */}
        {handleTypes.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Handle Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {handleTypes.map((type) => {
                const isSelected = selectedVariant?.handle_type === type;
                return (
                  <Button
                    key={type}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const bestMatch = findBestMatchingVariant({ handle_type: type });
                      if (bestMatch) {
                        onVariantChange(bestMatch.id);
                      }
                    }}
                    className="text-sm"
                  >
                    {type}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cabinet Class Selection */}
        {cabinetClasses.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Cabinet Class</h4>
            <div className="grid grid-cols-2 gap-2">
              {cabinetClasses.map((classType) => {
                const isSelected = selectedVariant?.cabinet_class === classType;
                return (
                  <Button
                    key={classType}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const bestMatch = findBestMatchingVariant({ cabinet_class: classType });
                      if (bestMatch) {
                        onVariantChange(bestMatch.id);
                      }
                    }}
                    className="text-sm"
                  >
                    {classType}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dimension Selection */}
        {dimensions.length > 1 && (
          <div>
            <h4 className="font-medium mb-3">Dimensions</h4>
            {dimensions.length > 4 ? (
              <Select 
                value={selectedVariant?.dimensions || ''} 
                onValueChange={(dimension) => {
                  const bestMatch = findBestMatchingVariant({ dimensions: dimension });
                  if (bestMatch) {
                    onVariantChange(bestMatch.id);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select dimensions" />
                </SelectTrigger>
                <SelectContent>
                  {dimensions.map((dimension) => (
                    <SelectItem key={dimension} value={dimension}>
                      {dimension}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {dimensions.map((dimension) => {
                  const isSelected = selectedVariant?.dimensions === dimension;
                  return (
                    <Button
                      key={dimension}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const bestMatch = findBestMatchingVariant({ dimensions: dimension });
                        if (bestMatch) {
                          onVariantChange(bestMatch.id);
                        }
                      }}
                      className="text-sm"
                    >
                      {dimension}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Door Type Selection */}
        <DoorTypeSelector
          doorTypes={doorTypes}
          selectedDoorType={selectedVariant?.door_type || ''}
          onDoorTypeChange={(doorType) => {
            const bestMatch = findBestMatchingVariant({ door_type: doorType });
            if (bestMatch) {
              onVariantChange(bestMatch.id);
            }
          }}
        />

        {/* Variant Type Selection */}
        {variantTypes.length > 1 && (
          <div>
            <h4 className="font-medium mb-3">Configuration Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {variantTypes.map((type) => {
                const isSelected = selectedVariant?.variant_type === type;
                
                return (
                  <Button
                    key={type}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const bestMatch = findBestMatchingVariant({ variant_type: type });
                      if (bestMatch) {
                        onVariantChange(bestMatch.id);
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
            <div className="grid grid-cols-4 gap-2">
              {drawerCounts.map((count) => {
                const isSelected = selectedVariant?.drawer_count === count;
                
                return (
                  <Button
                    key={count}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const bestMatch = findBestMatchingVariant({ drawer_count: count });
                      if (bestMatch) {
                        onVariantChange(bestMatch.id);
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
        {orientations.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Orientation</h4>
            <div className="grid grid-cols-2 gap-2">
              {orientations.map((orientation) => {
                const isSelected = selectedVariant?.orientation === orientation;
                
                return (
                  <Button
                    key={orientation}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const bestMatch = findBestMatchingVariant({ orientation });
                      if (bestMatch) {
                        onVariantChange(bestMatch.id);
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
              {selectedVariant.dimensions && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dimensions:</span>
                  <span className="text-sm font-medium">{selectedVariant.dimensions}</span>
                </div>
              )}
              {selectedVariant.emergency_shower_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Emergency Shower Type:</span>
                  <span className="text-sm font-medium">{selectedVariant.emergency_shower_type}</span>
                </div>
              )}
              {selectedVariant.mounting_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mounting Type:</span>
                  <span className="text-sm font-medium">{selectedVariant.mounting_type}</span>
                </div>
              )}
              {selectedVariant.mixing_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mixing Type:</span>
                  <span className="text-sm font-medium">{selectedVariant.mixing_type}</span>
                </div>
              )}
              {selectedVariant.handle_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Handle Type:</span>
                  <span className="text-sm font-medium">{selectedVariant.handle_type}</span>
                </div>
              )}
              {selectedVariant.cabinet_class && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cabinet Class:</span>
                  <span className="text-sm font-medium">{selectedVariant.cabinet_class}</span>
                </div>
              )}
              {selectedVariant.door_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Door Type:</span>
                  <span className="text-sm font-medium">{selectedVariant.door_type}</span>
                </div>
              )}
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
