import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types/product';
import { Settings, Package } from 'lucide-react';

interface InnosinLabConfiguratorProps {
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
  seriesName?: string;
}

interface GroupedConfiguration {
  cabinetType: string;
  configurations: {
    [key: string]: {
      drawers?: number;
      dimensions: string;
      orientation?: string;
      variants: Product[];
    };
  };
}

const InnosinLabConfigurator: React.FC<InnosinLabConfiguratorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange,
  seriesName = ''
}) => {
  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  // Smart grouping for Innosin Lab Mobile Cabinets
  const groupedConfigurations = useMemo(() => {
    const groups: { [key: string]: GroupedConfiguration } = {};

    variants.forEach(variant => {
      // Determine cabinet type from product code
      let cabinetType = 'Mobile Cabinet';
      if (variant.product_code?.includes('MCC')) {
        cabinetType = 'Mobile Combination Cabinet';
      } else if (variant.product_code?.includes('MC')) {
        cabinetType = 'Mobile Cabinet';
      }

      // Extract configuration details
      const drawers = variant.drawer_count || variant.number_of_drawers || 
        (variant.product_code?.match(/DWR?(\d+)/)?.[1] ? parseInt(variant.product_code.match(/DWR?(\d+)/)?.[1]!) : undefined);
      
      const dimensions = variant.dimensions || 'Standard';
      const orientation = variant.orientation || 'Standard';

      // Create configuration key
      const configKey = [
        drawers ? `${drawers} Drawers` : 'Standard',
        dimensions,
        orientation !== 'None' && orientation !== 'Standard' ? orientation : null
      ].filter(Boolean).join(' | ');

      if (!groups[cabinetType]) {
        groups[cabinetType] = {
          cabinetType,
          configurations: {}
        };
      }

      if (!groups[cabinetType].configurations[configKey]) {
        groups[cabinetType].configurations[configKey] = {
          drawers,
          dimensions,
          orientation: orientation !== 'None' ? orientation : undefined,
          variants: []
        };
      }

      groups[cabinetType].configurations[configKey].variants.push(variant);
    });

    return groups;
  }, [variants]);

  // Available finish options for Innosin Lab
  const finishOptions = [
    { value: 'PC', label: 'Powder Coat' },
    { value: 'SS', label: 'Stainless Steel' }
  ];

  if (!variants || variants.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No configurations available for this series.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configure Your Mobile Cabinet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cabinet Type Selection */}
        {Object.entries(groupedConfigurations).map(([cabinetType, group]) => (
          <div key={cabinetType} className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-lg">{cabinetType}</h4>
            </div>

            {/* Configuration Options */}
            <div className="grid gap-3">
              {Object.entries(group.configurations).map(([configKey, config]) => {
                const hasSelectedVariant = config.variants.some(v => v.id === selectedVariantId);
                
                return (
                  <div key={configKey} className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium">{configKey}</div>
                        <div className="text-sm text-muted-foreground">
                          {config.variants.length} variant{config.variants.length !== 1 ? 's' : ''} available
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {config.variants.map(variant => (
                          <Button
                            key={variant.id}
                            variant={variant.id === selectedVariantId ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onVariantChange(variant.id)}
                            className="text-xs"
                          >
                            {variant.product_code}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator />
          </div>
        ))}

        {/* Finish Selection */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <span>Finish Options</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {finishOptions.map(finish => (
              <Button
                key={finish.value}
                variant={selectedFinish === finish.value ? 'default' : 'outline'}
                onClick={() => onFinishChange(finish.value)}
                className="h-12"
              >
                {finish.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Selection Summary */}
        {selectedVariant && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Current Selection</h4>
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

              {(selectedVariant.drawer_count || selectedVariant.number_of_drawers) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Drawers:</span>
                  <span className="text-sm font-medium">
                    {selectedVariant.drawer_count || selectedVariant.number_of_drawers}
                  </span>
                </div>
              )}

              {selectedVariant.orientation && selectedVariant.orientation !== 'None' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Orientation:</span>
                  <span className="text-sm font-medium">
                    {selectedVariant.orientation === 'LH' ? 'Left Hand' : 
                     selectedVariant.orientation === 'RH' ? 'Right Hand' : 
                     selectedVariant.orientation}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Finish:</span>
                <span className="text-sm font-medium">
                  {finishOptions.find(f => f.value === selectedFinish)?.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InnosinLabConfigurator;