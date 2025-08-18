
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

  // Enhanced product type detection for all series
  const getProductTypeConfig = () => {
    const lowerType = productType.toLowerCase();
    
    // Broen-Lab series
    if (lowerType.includes('emergency_shower')) {
      return {
        primaryAttributes: ['emergency_shower_type'],
        secondaryAttributes: ['mounting_type'],
        finishOptions: [
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'PC', label: 'Powder Coat' }
        ]
      };
    }
    
    if (lowerType.includes('uniflex') || lowerType.includes('tap')) {
      return {
        primaryAttributes: ['mixing_type', 'handle_type'],
        secondaryAttributes: ['mounting_type'],
        finishOptions: [
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'Chrome', label: 'Chrome Finish' }
        ]
      };
    }
    
    // Safe Aire II Fume Hoods
    if (lowerType.includes('fume_hood')) {
      return {
        primaryAttributes: ['dimensions'],
        secondaryAttributes: ['door_type'],
        finishOptions: [
          { value: 'Epoxy', label: 'Epoxy Resin' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    // Oriental Giken series
    if (lowerType.includes('modular_cabinet') || lowerType.includes('mobile_cabinet')) {
      return {
        primaryAttributes: ['dimensions', 'drawer_count'],
        secondaryAttributes: ['orientation', 'door_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    if (lowerType.includes('wall_cabinet')) {
      return {
        primaryAttributes: ['dimensions'],
        secondaryAttributes: ['door_type', 'mounting_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    if (lowerType.includes('tall_cabinet')) {
      return {
        primaryAttributes: ['dimensions'],
        secondaryAttributes: ['door_type', 'drawer_count'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    if (lowerType.includes('open_rack')) {
      return {
        primaryAttributes: ['dimensions'],
        secondaryAttributes: [],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS304', label: 'SS304' }
        ]
      };
    }
    
    if (lowerType.includes('sink_cabinet')) {
      return {
        primaryAttributes: ['dimensions'],
        secondaryAttributes: ['door_type', 'orientation'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    // Innosin Lab series
    if (lowerType.includes('innosin') || variants.some(v => v.company_tags?.includes('Innosin'))) {
      return {
        primaryAttributes: ['dimensions', 'drawer_count'],
        secondaryAttributes: ['orientation', 'door_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    // Default configuration
    return {
      primaryAttributes: ['dimensions'],
      secondaryAttributes: ['orientation', 'door_type', 'drawer_count'],
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' }
      ]
    };
  };

  const config = getProductTypeConfig();
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  // Get available values for each attribute
  const getAttributeOptions = (attr: string) => {
    const values = [...new Set(variants.map(v => v[attr]).filter(Boolean))];
    return values.map(value => ({
      value: value.toString(),
      label: formatAttributeValue(attr, value)
    }));
  };

  const formatAttributeValue = (attr: string, value: any) => {
    if (attr === 'drawer_count') {
      return `${value} Drawer${value !== 1 ? 's' : ''}`;
    }
    if (attr === 'emergency_shower_type') {
      return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    if (attr === 'mixing_type') {
      return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return value.toString();
  };

  const getAttributeLabel = (attr: string) => {
    const labels = {
      dimensions: 'Dimensions',
      door_type: 'Door Type',
      orientation: 'Orientation',
      drawer_count: 'Drawer Configuration',
      mounting_type: 'Mounting Type',
      mixing_type: 'Mixing Type',
      handle_type: 'Handle Type',
      emergency_shower_type: 'Shower Type'
    };
    return labels[attr] || attr.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get all relevant attributes that have variations
  const allAttributes = [...config.primaryAttributes, ...config.secondaryAttributes];
  const availableAttributes = allAttributes.filter(attr => 
    variants.some(v => v[attr] !== undefined && v[attr] !== null && v[attr] !== '')
  );

  return (
    <div className="space-y-6">
      {/* Configuration Options */}
      {availableAttributes.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Configuration Options</h4>
          
          {availableAttributes.map(attr => {
            const options = getAttributeOptions(attr);
            if (options.length <= 1) return null;
            
            return (
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
                    {options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      )}

      <Separator />

      {/* Finish Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Finish</label>
        <div className="flex flex-wrap gap-2">
          {config.finishOptions.map(finish => (
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

      {/* Variant Information */}
      {selectedVariant && (
        <Card className="bg-muted/30">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Selected Configuration</span>
              <Badge variant="secondary">
                {variants.length} option{variants.length !== 1 ? 's' : ''} available
              </Badge>
            </div>
            
            {selectedVariant.product_code && (
              <div className="text-sm text-muted-foreground">
                <strong>Product Code:</strong> {selectedVariant.product_code}
              </div>
            )}
            
            {selectedVariant.dimensions && (
              <div className="text-sm text-muted-foreground">
                <strong>Dimensions:</strong> {selectedVariant.dimensions}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UniversalProductConfigurator;
