
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

  // Group variants by relevant attributes based on product type
  const getGroupingAttributes = () => {
    const sampleVariant = variants[0];
    const attributes = [];

    // Check which attributes are available and relevant
    if (sampleVariant.dimensions) attributes.push('dimensions');
    if (sampleVariant.door_type && sampleVariant.door_type !== 'None') attributes.push('door_type');
    if (sampleVariant.orientation && sampleVariant.orientation !== 'None') attributes.push('orientation');
    if (sampleVariant.drawer_count && sampleVariant.drawer_count > 0) attributes.push('drawer_count');
    if (sampleVariant.mounting_type) attributes.push('mounting_type');
    if (sampleVariant.mixing_type) attributes.push('mixing_type');
    if (sampleVariant.handle_type) attributes.push('handle_type');
    if (sampleVariant.emergency_shower_type) attributes.push('emergency_shower_type');

    return attributes;
  };

  const groupingAttributes = getGroupingAttributes();
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  // Create configuration groups
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
      drawer_count: 'Drawer Count',
      mounting_type: 'Mounting Type',
      mixing_type: 'Mixing Type',
      handle_type: 'Handle Type',
      emergency_shower_type: 'Emergency Shower Type'
    };
    return labels[attr] || attr.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFinishOptions = () => {
    if (productType === 'open_rack') {
      return [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS304', label: 'SS304' }
      ];
    }
    return [
      { value: 'PC', label: 'Powder Coat' },
      { value: 'SS', label: 'Stainless Steel' }
    ];
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
                onValueChange={(value) => {
                  const matchingVariant = variants.find(v => 
                    v[attr]?.toString() === value
                  );
                  if (matchingVariant) {
                    onVariantChange(matchingVariant.id);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${getAttributeLabel(attr).toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {configGroups[attr]?.map(group => (
                    <SelectItem key={group.value} value={group.value.toString()}>
                      {group.value}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UniversalProductConfigurator;
