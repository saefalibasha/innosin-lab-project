import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Package, Info } from 'lucide-react';
import { Product } from '@/types/product';
import { detectSeriesType, getSeriesConfigurationAttributes, getSeriesFinishOptions, formatAttributeDisplay } from '@/utils/seriesUtils';

interface EnhancedSeriesConfiguratorProps {
  series: Product;
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
}

interface GroupedVariants {
  [key: string]: Product[];
}

interface AttributeOptions {
  [attribute: string]: string[];
}

const EnhancedSeriesConfigurator: React.FC<EnhancedSeriesConfiguratorProps> = ({
  series,
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange
}) => {
  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  
  // Detect series type and get configuration attributes
  const seriesType = detectSeriesType(series, variants);
  const configurationAttributes = getSeriesConfigurationAttributes(seriesType, variants);
  const finishOptions = getSeriesFinishOptions(seriesType);

  // Group variants by attributes for intelligent selection
  const { attributeOptions, availableCombinations } = useMemo(() => {
    const options: AttributeOptions = {};
    const combinations = new Set<string>();

    // Extract unique values for each attribute
    configurationAttributes.forEach(attr => {
      options[attr] = [];
    });

    variants.forEach(variant => {
      const combinationKey: string[] = [];
      
      configurationAttributes.forEach(attr => {
        let value: string;
        
        switch (attr) {
          case 'drawer_count':
            value = String(variant.number_of_drawers || variant.drawer_count || 0);
            break;
          case 'door_type':
            value = variant.door_type || 'None';
            break;
          case 'orientation':
            value = variant.orientation || 'None';
            break;
          case 'dimensions':
            value = variant.dimensions || '';
            break;
          case 'mounting_type':
            value = variant.mounting_type || '';
            break;
          case 'mixing_type':
            value = variant.mixing_type || '';
            break;
          case 'handle_type':
            value = variant.handle_type || '';
            break;
          case 'emergency_shower_type':
            value = variant.emergency_shower_type || '';
            break;
          case 'cabinet_class':
            value = variant.cabinet_class || '';
            break;
          default:
            value = '';
        }

        if (value && value !== 'None' && !options[attr].includes(value)) {
          options[attr].push(value);
        }
        combinationKey.push(`${attr}:${value}`);
      });

      combinations.add(combinationKey.join('|'));
    });

    // Sort options for better UX
    Object.keys(options).forEach(attr => {
      if (attr === 'drawer_count') {
        options[attr].sort((a, b) => parseInt(a) - parseInt(b));
      } else if (attr === 'dimensions') {
        options[attr].sort();
      } else {
        options[attr].sort();
      }
    });

    return { attributeOptions: options, availableCombinations: combinations };
  }, [variants, configurationAttributes]);

  // State for attribute selections
  const [attributeSelections, setAttributeSelections] = useState<Record<string, string>>(() => {
    if (selectedVariant) {
      const selections: Record<string, string> = {};
      configurationAttributes.forEach(attr => {
        switch (attr) {
          case 'drawer_count':
            selections[attr] = String(selectedVariant.number_of_drawers || selectedVariant.drawer_count || 0);
            break;
          case 'door_type':
            selections[attr] = selectedVariant.door_type || 'None';
            break;
          case 'orientation':
            selections[attr] = selectedVariant.orientation || 'None';
            break;
          case 'dimensions':
            selections[attr] = selectedVariant.dimensions || '';
            break;
          case 'mounting_type':
            selections[attr] = selectedVariant.mounting_type || '';
            break;
          case 'mixing_type':
            selections[attr] = selectedVariant.mixing_type || '';
            break;
          case 'handle_type':
            selections[attr] = selectedVariant.handle_type || '';
            break;
          case 'emergency_shower_type':
            selections[attr] = selectedVariant.emergency_shower_type || '';
            break;
          case 'cabinet_class':
            selections[attr] = selectedVariant.cabinet_class || '';
            break;
        }
      });
      return selections;
    }
    return {};
  });

  // Get filtered variants based on current selections
  const filteredVariants = useMemo(() => {
    return variants.filter(variant => {
      return configurationAttributes.every(attr => {
        const selection = attributeSelections[attr];
        if (!selection) return true;

        switch (attr) {
          case 'drawer_count':
            return String(variant.number_of_drawers || variant.drawer_count || 0) === selection;
          case 'door_type':
            return (variant.door_type || 'None') === selection;
          case 'orientation':
            return (variant.orientation || 'None') === selection;
          case 'dimensions':
            return variant.dimensions === selection;
          case 'mounting_type':
            return variant.mounting_type === selection;
          case 'mixing_type':
            return variant.mixing_type === selection;
          case 'handle_type':
            return variant.handle_type === selection;
          case 'emergency_shower_type':
            return variant.emergency_shower_type === selection;
          case 'cabinet_class':
            return variant.cabinet_class === selection;
          default:
            return true;
        }
      });
    });
  }, [variants, attributeSelections, configurationAttributes]);

  // Auto-select variant when only one matches the current selections
  React.useEffect(() => {
    if (filteredVariants.length === 1 && filteredVariants[0].id !== selectedVariantId) {
      onVariantChange(filteredVariants[0].id);
    }
  }, [filteredVariants, selectedVariantId, onVariantChange]);

  const handleAttributeChange = (attribute: string, value: string) => {
    setAttributeSelections(prev => ({
      ...prev,
      [attribute]: value
    }));
  };

  const getAvailableOptionsForAttribute = (attribute: string): string[] => {
    if (!attributeSelections) return attributeOptions[attribute] || [];
    
    // Filter options based on other selections to show only valid combinations
    const otherSelections = { ...attributeSelections };
    delete otherSelections[attribute];
    
    return attributeOptions[attribute].filter(option => {
      const testSelections = { ...otherSelections, [attribute]: option };
      
      return variants.some(variant => {
        return configurationAttributes.every(attr => {
          const selection = testSelections[attr];
          if (!selection) return true;

          switch (attr) {
            case 'drawer_count':
              return String(variant.number_of_drawers || variant.drawer_count || 0) === selection;
            case 'door_type':
              return (variant.door_type || 'None') === selection;
            case 'orientation':
              return (variant.orientation || 'None') === selection;
            case 'dimensions':
              return variant.dimensions === selection;
            case 'mounting_type':
              return variant.mounting_type === selection;
            case 'mixing_type':
              return variant.mixing_type === selection;
            case 'handle_type':
              return variant.handle_type === selection;
            case 'emergency_shower_type':
              return variant.emergency_shower_type === selection;
            case 'cabinet_class':
              return variant.cabinet_class === selection;
            default:
              return true;
          }
        });
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configure Product
          <Badge variant="outline" className="ml-auto">
            {variants.length} Variants
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Series Info */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Package className="w-4 h-4" />
            {series.product_series || series.name}
          </h4>
          <p className="text-sm text-muted-foreground">{series.category}</p>
          {seriesType !== 'standard' && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {seriesType.replace('_', ' ').toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Attribute-based Configuration */}
        {configurationAttributes.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Configuration</h4>
            <div className="space-y-4">
              {configurationAttributes.map((attribute) => {
                const availableOptions = getAvailableOptionsForAttribute(attribute);
                const currentSelection = attributeSelections[attribute];
                
                if (availableOptions.length === 0) return null;

                return (
                  <div key={attribute}>
                    <label className="text-sm font-medium capitalize mb-2 block">
                      {formatAttributeDisplay(attribute, '').replace(/\d+/, '').trim() || attribute.replace('_', ' ')}
                    </label>
                    {availableOptions.length <= 3 ? (
                      <div className="flex gap-2">
                        {availableOptions.map((option) => (
                          <Button
                            key={option}
                            variant={currentSelection === option ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleAttributeChange(attribute, option)}
                            className="text-sm"
                          >
                            {formatAttributeDisplay(attribute, option)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Select value={currentSelection || ''} onValueChange={(value) => handleAttributeChange(attribute, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${attribute.replace('_', ' ')}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {formatAttributeDisplay(attribute, option)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtered Variants Display */}
        {filteredVariants.length > 1 && (
          <div>
            <h4 className="font-medium mb-3">
              Select Model ({filteredVariants.length} available)
            </h4>
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {filteredVariants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariantId === variant.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onVariantChange(variant.id)}
                  className="justify-start text-sm h-auto py-3"
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">{variant.product_code || variant.name}</span>
                    {variant.dimensions && (
                      <Badge variant="secondary" className="text-xs">
                        {variant.dimensions}
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Finish Selection */}
        <div>
          <h4 className="font-medium mb-3">Finish</h4>
          <div className="grid grid-cols-1 gap-2">
            {finishOptions.map((finish) => (
              <Button
                key={finish.value}
                variant={selectedFinish === finish.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFinishChange(finish.value)}
                className="text-sm justify-start"
              >
                {finish.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Selection Summary */}
        {selectedVariant && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Current Selection
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">{selectedVariant.product_code}</span>
              </div>
              {configurationAttributes.map((attr) => {
                const selection = attributeSelections[attr];
                if (!selection || selection === 'None') return null;
                
                return (
                  <div key={attr} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {attr.replace('_', ' ')}:
                    </span>
                    <span className="font-medium">
                      {formatAttributeDisplay(attr, selection)}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finish:</span>
                <span className="font-medium">
                  {finishOptions.find(f => f.value === selectedFinish)?.label || selectedFinish}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* No variants warning */}
        {filteredVariants.length === 0 && Object.keys(attributeSelections).length > 0 && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            No variants match the current configuration. Please adjust your selections.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedSeriesConfigurator;