
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { Settings, Package } from 'lucide-react';
import { getSeriesConfiguration } from '@/utils/seriesConfigurationManager';

interface EnhancedVariantSelectorProps {
  series: Product;
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
}

const EnhancedVariantSelector: React.FC<EnhancedVariantSelectorProps> = ({
  series,
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange
}) => {
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string>>({});
  
  const seriesSlug = series.product_series?.toLowerCase().replace(/\s+/g, '-') || '';
  const seriesName = series.product_series || series.name || '';
  const configuration = getSeriesConfiguration(seriesSlug, seriesName);

  // Get unique values for each attribute
  const attributeOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    
    configuration.groupingAttributes.forEach(attr => {
      const uniqueValues = [...new Set(
        variants
          .map(v => v[attr as keyof Product])
          .filter(Boolean)
          .filter(val => val !== 'None')
      )].sort();
      
      if (uniqueValues.length > 0) {
        options[attr] = uniqueValues as string[];
      }
    });
    
    return options;
  }, [variants, configuration.groupingAttributes]);

  // Filter variants based on selected attributes
  const filteredVariants = useMemo(() => {
    return variants.filter(variant => {
      return Object.entries(attributeFilters).every(([attr, value]) => {
        if (!value || value === 'all') return true;
        return variant[attr as keyof Product] === value;
      });
    });
  }, [variants, attributeFilters]);

  const handleAttributeChange = useCallback((attribute: string, value: string) => {
    setAttributeFilters(prev => ({
      ...prev,
      [attribute]: value
    }));
  }, []);

  const getAttributeDisplayName = (attr: string): string => {
    const displayNames: Record<string, string> = {
      dimensions: 'Size',
      drawer_count: 'Drawer Count',
      orientation: 'Orientation',
      door_type: 'Door Type',
      mounting_type: 'Mounting Type',
      cabinet_class: 'Cabinet Class',
      mixing_type: 'Mixing Type',
      handle_type: 'Handle Type',
      emergency_shower_type: 'Emergency Shower Type'
    };
    return displayNames[attr] || attr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAttributeValue = (attr: string, value: string): string => {
    if (attr === 'orientation') {
      if (value === 'LH') return 'Left Hand';
      if (value === 'RH') return 'Right Hand';
    }
    if (attr === 'drawer_count') {
      return `${value} ${value === '1' ? 'Drawer' : 'Drawers'}`;
    }
    if (attr === 'door_type') {
      return `${value} Door`;
    }
    return value;
  };

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {configuration.displayName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attribute Filters */}
        {Object.entries(attributeOptions).map(([attr, options]) => (
          <div key={attr} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {getAttributeDisplayName(attr)}
            </label>
            <Select
              value={attributeFilters[attr] || 'all'}
              onValueChange={(value) => handleAttributeChange(attr, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${getAttributeDisplayName(attr).toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {getAttributeDisplayName(attr)}s</SelectItem>
                {options.map(option => (
                  <SelectItem key={option} value={option}>
                    {formatAttributeValue(attr, option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {/* Available Products Counter */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="w-4 h-4" />
          Available Products ({filteredVariants.length})
        </div>

        {/* Variant Cards */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {filteredVariants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              return (
                <Button
                  key={variant.id}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => onVariantChange(variant.id)}
                  className="h-auto p-3 text-left justify-start"
                >
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium text-sm">
                      {variant.product_code || variant.name}
                    </span>
                    {variant.dimensions && (
                      <span className="text-xs text-muted-foreground">
                        {variant.dimensions}
                      </span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Finish Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Finish</label>
          <div className="grid grid-cols-2 gap-2">
            {configuration.finishOptions.map((finish) => (
              <Button
                key={finish.value}
                variant={selectedFinish === finish.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFinishChange(finish.value)}
                className="text-sm"
              >
                {finish.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Selection Summary */}
        {selectedVariant && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium text-sm">Current Selection</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Product Code:</span>
                <Badge variant="outline" className="text-xs">{selectedVariant.product_code}</Badge>
              </div>
              
              {selectedVariant.dimensions && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium">{selectedVariant.dimensions}</span>
                </div>
              )}

              {Object.entries(attributeFilters).map(([attr, value]) => {
                if (!value || value === 'all') return null;
                return (
                  <div key={attr} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{getAttributeDisplayName(attr)}:</span>
                    <span className="font-medium">{formatAttributeValue(attr, value)}</span>
                  </div>
                );
              })}

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Finish:</span>
                <span className="font-medium">
                  {configuration.finishOptions.find(f => f.value === selectedFinish)?.label || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedVariantSelector;
