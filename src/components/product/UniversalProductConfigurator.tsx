
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

  // Enhanced product type detection with fallback handling
  const getProductTypeConfig = () => {
    const lowerType = productType.toLowerCase();
    const category = variants[0]?.category?.toLowerCase() || '';
    const seriesName = variants[0]?.product_series?.toLowerCase() || '';
    
    // Broen-Lab series
    if (lowerType.includes('emergency_shower') || seriesName.includes('emergency')) {
      return {
        primaryAttributes: ['emergency_shower_type', 'dimensions'],
        secondaryAttributes: ['mounting_type', 'finish_type'],
        finishOptions: [
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'PC', label: 'Powder Coat' },
          { value: 'Chrome', label: 'Chrome Finish' }
        ]
      };
    }
    
    if (lowerType.includes('uniflex') || lowerType.includes('tap') || seriesName.includes('uniflex')) {
      return {
        primaryAttributes: ['mixing_type', 'handle_type', 'dimensions'],
        secondaryAttributes: ['mounting_type', 'finish_type'],
        finishOptions: [
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'Chrome', label: 'Chrome Finish' },
          { value: 'PC', label: 'Powder Coat' }
        ]
      };
    }
    
    // Safe Aire II Fume Hoods
    if (lowerType.includes('fume_hood') || category.includes('fume') || seriesName.includes('safe aire')) {
      return {
        primaryAttributes: ['dimensions', 'mounting_type'],
        secondaryAttributes: ['door_type', 'finish_type'],
        finishOptions: [
          { value: 'Epoxy', label: 'Epoxy Resin' },
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'PC', label: 'Powder Coat' }
        ]
      };
    }
    
    // Oriental Giken series - enhanced detection
    if (category.includes('oriental') || seriesName.includes('oriental') || 
        lowerType.includes('modular_cabinet') || lowerType.includes('mobile_cabinet')) {
      return {
        primaryAttributes: ['dimensions', 'drawer_count', 'number_of_drawers'],
        secondaryAttributes: ['orientation', 'door_type', 'mounting_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'Epoxy', label: 'Epoxy Resin' }
        ]
      };
    }
    
    if (lowerType.includes('wall_cabinet') || seriesName.includes('wall')) {
      return {
        primaryAttributes: ['dimensions', 'door_type'],
        secondaryAttributes: ['mounting_type', 'finish_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    if (lowerType.includes('tall_cabinet') || seriesName.includes('tall')) {
      return {
        primaryAttributes: ['dimensions', 'door_type'],
        secondaryAttributes: ['drawer_count', 'number_of_drawers', 'finish_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    if (lowerType.includes('open_rack') || seriesName.includes('open rack')) {
      return {
        primaryAttributes: ['dimensions'],
        secondaryAttributes: ['mounting_type', 'finish_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS304', label: 'SS304' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    if (lowerType.includes('sink_cabinet') || seriesName.includes('sink')) {
      return {
        primaryAttributes: ['dimensions', 'orientation'],
        secondaryAttributes: ['door_type', 'finish_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    // Innosin Lab series - enhanced detection with both field names
    if (category.includes('innosin') || seriesName.includes('innosin') || 
        variants.some(v => v.company_tags?.includes('Innosin'))) {
      return {
        primaryAttributes: ['dimensions', 'drawer_count', 'number_of_drawers'],
        secondaryAttributes: ['orientation', 'door_type', 'finish_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ]
      };
    }
    
    // Default configuration with intelligent fallbacks
    return {
      primaryAttributes: ['dimensions'],
      secondaryAttributes: ['orientation', 'door_type', 'drawer_count', 'number_of_drawers', 'finish_type'],
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' },
        { value: 'Epoxy', label: 'Epoxy Resin' },
        { value: 'Chrome', label: 'Chrome Finish' }
      ]
    };
  };

  const config = getProductTypeConfig();
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  // Enhanced attribute value retrieval with fallbacks
  const getAttributeValue = (variant: any, attr: string) => {
    // Handle drawer count with both field names
    if (attr === 'drawer_count' || attr === 'number_of_drawers') {
      return variant.drawer_count || variant.number_of_drawers || 0;
    }
    return variant[attr];
  };

  // Get available values for each attribute with better filtering
  const getAttributeOptions = (attr: string) => {
    const values = variants
      .map(v => getAttributeValue(v, attr))
      .filter(value => value !== undefined && value !== null && value !== '')
      .filter((value, index, arr) => arr.indexOf(value) === index); // Remove duplicates
    
    return values.map(value => ({
      value: value.toString(),
      label: formatAttributeValue(attr, value)
    }));
  };

  const formatAttributeValue = (attr: string, value: any) => {
    if (attr === 'drawer_count' || attr === 'number_of_drawers') {
      const num = parseInt(value.toString()) || 0;
      if (num === 0) return 'No Drawers';
      return `${num} Drawer${num !== 1 ? 's' : ''}`;
    }
    if (attr === 'emergency_shower_type') {
      return value.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    if (attr === 'mixing_type') {
      return value.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    if (attr === 'mounting_type') {
      return value.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    if (attr === 'door_type') {
      return value.toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return value.toString();
  };

  const getAttributeLabel = (attr: string) => {
    const labels = {
      dimensions: 'Dimensions',
      door_type: 'Door Type',
      orientation: 'Orientation',
      drawer_count: 'Drawer Configuration',
      number_of_drawers: 'Drawer Configuration',
      mounting_type: 'Mounting Type',
      mixing_type: 'Mixing Type',
      handle_type: 'Handle Type',
      emergency_shower_type: 'Shower Type',
      finish_type: 'Finish Type'
    };
    return labels[attr] || attr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get all relevant attributes that have variations
  const allAttributes = [...config.primaryAttributes, ...config.secondaryAttributes];
  const availableAttributes = allAttributes.filter(attr => {
    const options = getAttributeOptions(attr);
    return options.length > 1; // Only show attributes with multiple options
  });

  // Find matching variant based on attribute value
  const findMatchingVariant = (attr: string, value: string) => {
    return variants.find(v => {
      const attrValue = getAttributeValue(v, attr);
      return attrValue?.toString() === value;
    });
  };

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
                  value={getAttributeValue(selectedVariant, attr)?.toString() || ''}
                  onValueChange={(value) => {
                    const matchingVariant = findMatchingVariant(attr, value);
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

            {/* Show key attributes */}
            {availableAttributes.slice(0, 3).map(attr => {
              const value = getAttributeValue(selectedVariant, attr);
              if (!value) return null;
              
              return (
                <div key={attr} className="text-sm text-muted-foreground">
                  <strong>{getAttributeLabel(attr)}:</strong> {formatAttributeValue(attr, value)}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UniversalProductConfigurator;
