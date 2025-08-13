
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Package, Palette, Settings, Dimensions, DoorOpen, RotateCw, Wrench, Droplets, Hand, Shield, Hash } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  dimensions?: string;
  finish_type?: string;
  orientation?: string;
  door_type?: string;
  product_code?: string;
  mounting_type?: string;
  mixing_type?: string;
  handle_type?: string;
  emergency_shower_type?: string;
  drawer_count?: number;
  thumbnail_path?: string;
  model_path?: string;
  additional_images?: string[];
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
  groupByDimensions?: boolean;
  seriesSlug?: string;
  showAllFields?: boolean;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange,
  groupByDimensions = false,
  seriesSlug = '',
  showAllFields = false
}) => {
  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  // Group variants by dimensions if requested
  const groupedVariants = groupByDimensions ? 
    variants.reduce((groups, variant) => {
      const dimension = variant.dimensions || 'Standard';
      if (!groups[dimension]) {
        groups[dimension] = [];
      }
      groups[dimension].push(variant);
      return groups;
    }, {} as Record<string, Variant[]>) :
    { 'All Variants': variants };

  // Determine available finishes based on series
  const getAvailableFinishes = () => {
    const isOpenRack = seriesSlug.includes('open rack');
    return isOpenRack ? 
      [{ value: 'PC', label: 'Powder Coat' }, { value: 'SS304', label: 'SS304' }] :
      [{ value: 'PC', label: 'Powder Coat' }, { value: 'SS', label: 'Stainless Steel' }];
  };

  const availableFinishes = getAvailableFinishes();

  // Check what fields are relevant for this series
  const hasRelevantField = (field: keyof Variant) => {
    return variants.some(v => v[field] && v[field] !== 'None' && v[field] !== '');
  };

  const showDimensions = hasRelevantField('dimensions');
  const showDoorType = hasRelevantField('door_type') || showAllFields;
  const showOrientation = hasRelevantField('orientation') || showAllFields;
  const showMountingType = hasRelevantField('mounting_type') || showAllFields;
  const showMixingType = hasRelevantField('mixing_type') || showAllFields;
  const showHandleType = hasRelevantField('handle_type') || showAllFields;
  const showEmergencyShowerType = hasRelevantField('emergency_shower_type') || showAllFields;
  const showDrawerCount = hasRelevantField('drawer_count') || showAllFields;

  return (
    <div className="space-y-6">
      {/* Finish Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Finish Type
        </Label>
        <RadioGroup value={selectedFinish} onValueChange={onFinishChange}>
          <div className="grid grid-cols-2 gap-4">
            {availableFinishes.map((finish) => (
              <div key={finish.value} className="flex items-center space-x-2">
                <RadioGroupItem value={finish.value} id={`finish-${finish.value}`} />
                <Label htmlFor={`finish-${finish.value}`} className="cursor-pointer">
                  {finish.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Variant Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Package className="w-4 h-4" />
          Select Variant
        </Label>
        
        <RadioGroup value={selectedVariantId} onValueChange={onVariantChange}>
          {Object.entries(groupedVariants).map(([groupName, groupVariants]) => (
            <div key={groupName} className="space-y-3">
              {groupByDimensions && Object.keys(groupedVariants).length > 1 && (
                <h4 className="font-medium text-foreground">{groupName}</h4>
              )}
              <div className="grid gap-3">
                {groupVariants.map((variant) => (
                  <div key={variant.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={variant.id} id={`variant-${variant.id}`} />
                    <Label htmlFor={`variant-${variant.id}`} className="flex-1 cursor-pointer">
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">{variant.name}</div>
                              {variant.product_code && (
                                <div className="text-sm text-muted-foreground">
                                  Code: {variant.product_code}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {showDimensions && variant.dimensions && (
                                  <Badge variant="outline" className="text-xs">
                                    <Dimensions className="w-3 h-3 mr-1" />
                                    {variant.dimensions}
                                  </Badge>
                                )}
                                {showDoorType && variant.door_type && (
                                  <Badge variant="outline" className="text-xs">
                                    <DoorOpen className="w-3 h-3 mr-1" />
                                    {variant.door_type}
                                  </Badge>
                                )}
                                {showOrientation && variant.orientation && variant.orientation !== 'None' && (
                                  <Badge variant="outline" className="text-xs">
                                    <RotateCw className="w-3 h-3 mr-1" />
                                    {variant.orientation}
                                  </Badge>
                                )}
                                {showMountingType && variant.mounting_type && (
                                  <Badge variant="outline" className="text-xs">
                                    <Wrench className="w-3 h-3 mr-1" />
                                    {variant.mounting_type}
                                  </Badge>
                                )}
                                {showMixingType && variant.mixing_type && (
                                  <Badge variant="outline" className="text-xs">
                                    <Droplets className="w-3 h-3 mr-1" />
                                    {variant.mixing_type}
                                  </Badge>
                                )}
                                {showHandleType && variant.handle_type && (
                                  <Badge variant="outline" className="text-xs">
                                    <Hand className="w-3 h-3 mr-1" />
                                    {variant.handle_type}
                                  </Badge>
                                )}
                                {showEmergencyShowerType && variant.emergency_shower_type && (
                                  <Badge variant="outline" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    {variant.emergency_shower_type}
                                  </Badge>
                                )}
                                {showDrawerCount && variant.drawer_count && variant.drawer_count > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Hash className="w-3 h-3 mr-1" />
                                    {variant.drawer_count} Drawers
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Selected Variant Details */}
      {selectedVariant && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Current Selection Details
            </Label>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Product:</span>
                    <p className="text-muted-foreground">{selectedVariant.name}</p>
                  </div>
                  {selectedVariant.product_code && (
                    <div>
                      <span className="font-medium">Code:</span>
                      <p className="text-muted-foreground">{selectedVariant.product_code}</p>
                    </div>
                  )}
                  {showDimensions && selectedVariant.dimensions && (
                    <div>
                      <span className="font-medium">Dimensions:</span>
                      <p className="text-muted-foreground">{selectedVariant.dimensions}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Finish:</span>
                    <p className="text-muted-foreground">
                      {availableFinishes.find(f => f.value === selectedFinish)?.label}
                    </p>
                  </div>
                  {showDoorType && selectedVariant.door_type && (
                    <div>
                      <span className="font-medium">Door Type:</span>
                      <p className="text-muted-foreground">{selectedVariant.door_type}</p>
                    </div>
                  )}
                  {showOrientation && selectedVariant.orientation && selectedVariant.orientation !== 'None' && (
                    <div>
                      <span className="font-medium">Orientation:</span>
                      <p className="text-muted-foreground">{selectedVariant.orientation}</p>
                    </div>
                  )}
                  {showMountingType && selectedVariant.mounting_type && (
                    <div>
                      <span className="font-medium">Mounting Type:</span>
                      <p className="text-muted-foreground">{selectedVariant.mounting_type}</p>
                    </div>
                  )}
                  {showMixingType && selectedVariant.mixing_type && (
                    <div>
                      <span className="font-medium">Mixing Type:</span>
                      <p className="text-muted-foreground">{selectedVariant.mixing_type}</p>
                    </div>
                  )}
                  {showHandleType && selectedVariant.handle_type && (
                    <div>
                      <span className="font-medium">Handle Type:</span>
                      <p className="text-muted-foreground">{selectedVariant.handle_type}</p>
                    </div>
                  )}
                  {showEmergencyShowerType && selectedVariant.emergency_shower_type && (
                    <div>
                      <span className="font-medium">Emergency Shower Type:</span>
                      <p className="text-muted-foreground">{selectedVariant.emergency_shower_type}</p>
                    </div>
                  )}
                  {showDrawerCount && selectedVariant.drawer_count && selectedVariant.drawer_count > 0 && (
                    <div>
                      <span className="font-medium">Number of Drawers:</span>
                      <p className="text-muted-foreground">{selectedVariant.drawer_count}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default VariantSelector;
