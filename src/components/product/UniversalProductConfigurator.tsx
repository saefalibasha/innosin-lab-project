import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface UniversalProductConfiguratorProps {
  variants: any[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
  productType: string;
}

const UniversalProductConfigurator = ({
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange,
  productType
}: UniversalProductConfiguratorProps) => {
  if (!variants || variants.length === 0) return null;

  // Enhanced grouping attributes for Innosin Lab products
  const getGroupingAttributes = () => {
    const sampleVariant = variants[0];
    const attributes = [];

    // Always check dimensions first for Innosin Lab products
    if (sampleVariant.dimensions) attributes.push('dimensions');
    
    // Check drawer-related attributes (Innosin uses number_of_drawers, others use drawer_count)
    if (sampleVariant.number_of_drawers && sampleVariant.number_of_drawers > 0) {
      attributes.push('number_of_drawers');
    } else if (sampleVariant.drawer_count && sampleVariant.drawer_count > 0) {
      attributes.push('drawer_count');
    }
    
    // Door and orientation attributes
    if (sampleVariant.door_type && sampleVariant.door_type !== 'None') attributes.push('door_type');
    if (sampleVariant.orientation && sampleVariant.orientation !== 'None') attributes.push('orientation');
    
    // Other technical attributes
    if (sampleVariant.mounting_type) attributes.push('mounting_type');
    if (sampleVariant.mixing_type) attributes.push('mixing_type');
    if (sampleVariant.handle_type) attributes.push('handle_type');
    if (sampleVariant.emergency_shower_type) attributes.push('emergency_shower_type');

    return attributes;
  };

  const groupingAttributes = getGroupingAttributes();
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  // Create configuration groups with enhanced logic
  const createConfigurationGroups = () => {
    const groups: { [key: string]: any[] } = {};
    
    groupingAttributes.forEach(attr => {
      const uniqueValues = [...new Set(variants.map(v => v[attr]).filter(Boolean))];
      groups[attr] = uniqueValues.map(value => ({
        value,
        variants: variants.filter(v => v[attr] === value)
      }));
    });

    return groups;
  };

  const configGroups = createConfigurationGroups();

  const getAttributeLabel = (attr: string) => {
    const labels = {
      dimensions: 'Dimensions',
      door_type: 'Door Type',
      orientation: 'Orientation',
      drawer_count: 'Number of Drawers',
      number_of_drawers: 'Number of Drawers',
      mounting_type: 'Mounting Type',
      mixing_type: 'Mixing Type',
      handle_type: 'Handle Type',
      emergency_shower_type: 'Emergency Shower Type'
    };
    return labels[attr] || attr.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Enhanced finish options based on product type
  const getFinishOptions = () => {
    // For Innosin Lab products, check what finishes are actually available
    const availableFinishes = new Set();
    variants.forEach(variant => {
      if (variant.finish_type) {
        availableFinishes.add(variant.finish_type);
      }
    });

    // Default finish options based on product type
    if (productType === 'open_rack') {
      return [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS304', label: 'SS304' }
      ];
    }

    // Standard options for most Innosin Lab products
    const standardOptions = [
      { value: 'PC', label: 'Powder Coat' },
      { value: 'SS', label: 'Stainless Steel' }
    ];

    // If we have specific finishes from variants, use those
    if (availableFinishes.size > 0) {
      return Array.from(availableFinishes).map(finish => ({
        value: finish,
        label: finish === 'PC' ? 'Powder Coat' : 
               finish === 'SS' ? 'Stainless Steel' :
               finish === 'SS304' ? 'SS304' : finish
      }));
    }

    return standardOptions;
  };

  // Enhanced variant selection logic
  const handleAttributeChange = (attr: string, value: string) => {
    // Find the best matching variant based on current selections and new attribute
    let bestMatch = null;
    let bestScore = -1;

    variants.forEach(variant => {
      if (variant[attr]?.toString() !== value) return;

      let score = 0;
      // Score based on how many current attributes match
      groupingAttributes.forEach(checkAttr => {
        if (checkAttr === attr) return; // Skip the attribute we're changing
        if (selectedVariant[checkAttr] && variant[checkAttr] === selectedVariant[checkAttr]) {
          score++;
        }
      });

      // Also consider finish match
      if (variant.finish_type === selectedFinish) {
        score++;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = variant;
      }
    });

    if (bestMatch) {
      onVariantChange(bestMatch.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      {groupingAttributes.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Configuration Options</h4>
          
          {groupingAttributes.map(attr => (
            <div key={attr} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {getAttributeLabel(attr)}
              </label>
              <Select
                value={selectedVariant[attr]?.toString() || ''}
                onValueChange={(value) => handleAttributeChange(attr, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${getAttributeLabel(attr).toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {configGroups[attr]?.map(group => (
                    <SelectItem key={group.value} value={group.value.toString()}>
                      {/* Enhanced display for different attribute types */}
                      {attr === 'dimensions' ? group.value :
                       attr === 'number_of_drawers' || attr === 'drawer_count' ? `${group.value} Drawers` :
                       group.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Finish Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Finish</label>
        <div className="flex flex-wrap gap-2">
          {getFinishOptions().map(finish => (
            <Button
              key={finish.value}
              variant={selectedFinish === finish.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFinishChange(finish.value)}
              className="min-w-0"
            >
              {finish.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Available Variants Summary */}
      {variants.length > 1 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Available Configurations
              </span>
              <Badge variant="secondary">
                {variants.length} option{variants.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {/* Show current selection details */}
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                {selectedVariant.dimensions && (
                  <span className="bg-background px-2 py-1 rounded">
                    {selectedVariant.dimensions}
                  </span>
                )}
                {(selectedVariant.number_of_drawers || selectedVariant.drawer_count) && (
                  <span className="bg-background px-2 py-1 rounded">
                    {selectedVariant.number_of_drawers || selectedVariant.drawer_count} Drawers
                  </span>
                )}
                {selectedVariant.door_type && (
                  <span className="bg-background px-2 py-1 rounded">
                    {selectedVariant.door_type}
                  </span>
                )}
                {selectedVariant.orientation && (
                  <span className="bg-background px-2 py-1 rounded">
                    {selectedVariant.orientation}
                  </span>
                )}
                <span className="bg-background px-2 py-1 rounded">
                  {selectedFinish === 'PC' ? 'Powder Coat' : 
                   selectedFinish === 'SS' ? 'Stainless Steel' :
                   selectedFinish === 'SS304' ? 'SS304' : selectedFinish}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UniversalProductConfigurator;
