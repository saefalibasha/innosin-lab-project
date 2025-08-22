
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { getAttributeLabel, formatAttributeValue, formatFinishType, getOrientationDisplayName } from '@/utils/productTerminology';

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
    const productName = sampleVariant.name?.toLowerCase() || '';
    const productCode = sampleVariant.product_code?.toLowerCase() || '';

    // Check if this is a knee space or open rack product (should not have drawer options)
    const isKneeSpace = productName.includes('knee space') || productCode.includes('ks');
    const isOpenRack = productName.includes('open rack') || productCode.includes('or-');

    // Always check dimensions first for Innosin Lab products
    if (sampleVariant.dimensions) attributes.push('dimensions');
    
    // Check drawer-related attributes only for products that actually have drawers
    if (!isKneeSpace && !isOpenRack) {
      if (sampleVariant.number_of_drawers && sampleVariant.number_of_drawers > 0) {
        attributes.push('number_of_drawers');
      } else if (sampleVariant.drawer_count && sampleVariant.drawer_count > 0) {
        attributes.push('drawer_count');
      }
    }
    
    // Door and orientation attributes (only if they have meaningful values)
    if (sampleVariant.door_type && sampleVariant.door_type !== 'None' && sampleVariant.door_type !== '') {
      attributes.push('door_type');
    }
    if (sampleVariant.orientation && sampleVariant.orientation !== 'None' && sampleVariant.orientation !== '') {
      attributes.push('orientation');
    }
    
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

  // Use the utility function for attribute labels

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
        value: String(finish),
        label: finish === 'PC' ? 'Powder Coat' : 
               finish === 'SS' ? 'Stainless Steel' :
               finish === 'SS304' ? 'SS304' : String(finish)
      }));
    }

    return standardOptions;
  };

  // Enhanced variant selection logic with cascading filtering
  const getAvailableValues = (attr: string) => {
    // Filter variants based on all currently selected attributes except the one being changed
    const currentSelections = { ...selectedVariant };
    delete currentSelections[attr];
    
    const compatibleVariants = variants.filter(variant => {
      return groupingAttributes.every(checkAttr => {
        if (checkAttr === attr) return true; // Don't filter by the attribute being changed
        return !currentSelections[checkAttr] || variant[checkAttr] === currentSelections[checkAttr];
      });
    });
    
    return [...new Set(compatibleVariants.map(v => v[attr]).filter(Boolean))];
  };

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
                  {getAvailableValues(attr).map(value => (
                    <SelectItem key={String(value)} value={String(value)}>
                      {formatAttributeValue(attr, value)}
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
              {formatFinishType(finish.value)}
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
                {groupingAttributes.map(attr => {
                  const value = selectedVariant[attr];
                  if (!value) return null;
                  
                  return (
                    <span key={attr} className="bg-background px-2 py-1 rounded">
                      {formatAttributeValue(attr, value)}
                    </span>
                  );
                })}
                <span className="bg-background px-2 py-1 rounded">
                  {formatFinishType(selectedFinish)}
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
