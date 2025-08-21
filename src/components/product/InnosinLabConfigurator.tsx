import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/types/product';
import { Package, Settings2, Filter, RotateCcw } from 'lucide-react';

interface InnosinLabConfiguratorProps {
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
  seriesName?: string;
}

interface ConfigurationOptions {
  drawerCounts: number[];
  dimensions: string[];
  orientations: string[];
  finishes: { value: string; label: string }[];
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
  
  // Configuration state
  const [selectedDrawerCount, setSelectedDrawerCount] = useState<string>('');
  const [selectedDimensions, setSelectedDimensions] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<string>('');

  // Detect series type and capabilities
  const seriesCapabilities = useMemo(() => {
    const lowerSeriesName = seriesName.toLowerCase();
    const isKneeSpace = lowerSeriesName.includes('knee space');
    const isOpenRack = lowerSeriesName.includes('open rack');
    
    // Check if any variants actually have drawers
    const hasDrawers = variants.some(variant => {
      const drawers = variant.number_of_drawers || variant.drawer_count || 
        (variant.product_code?.match(/DWR?(\d+)/)?.[1] ? parseInt(variant.product_code.match(/DWR?(\d+)/)?.[1]!) : undefined);
      return drawers && drawers > 0;
    });

    // Check if any variants have orientation
    const hasOrientation = variants.some(variant => 
      variant.orientation && variant.orientation !== 'None' && variant.orientation !== 'Standard'
    );

    return {
      showDrawers: hasDrawers && !isKneeSpace && !isOpenRack,
      showOrientation: hasOrientation && !isKneeSpace && !isOpenRack,
      isKneeSpace,
      isOpenRack
    };
  }, [variants, seriesName]);

  // Extract all available configuration options
  const configurationOptions = useMemo((): ConfigurationOptions => {
    const drawerCounts = new Set<number>();
    const dimensions = new Set<string>();
    const orientations = new Set<string>();

    variants.forEach(variant => {
      // Drawer count - only if series supports drawers
      if (seriesCapabilities.showDrawers) {
        const drawers = variant.number_of_drawers || variant.drawer_count || 
          (variant.product_code?.match(/DWR?(\d+)/)?.[1] ? parseInt(variant.product_code.match(/DWR?(\d+)/)?.[1]!) : undefined);
        if (drawers && drawers > 0) drawerCounts.add(drawers);
      }

      // Dimensions
      if (variant.dimensions) dimensions.add(variant.dimensions);

      // Orientation - only if series supports orientation
      if (seriesCapabilities.showOrientation) {
        const orientation = variant.orientation;
        if (orientation && orientation !== 'None' && orientation !== 'Standard') {
          orientations.add(orientation);
        }
        orientations.add('Standard');
      }
    });

    return {
      drawerCounts: Array.from(drawerCounts).sort((a, b) => a - b),
      dimensions: Array.from(dimensions).sort((a, b) => {
        // Parse dimensions like "500x650" and sort by width first, then height
        const parseSize = (dim: string) => {
          const parts = dim.split('x').map(p => parseInt(p.trim()));
          return { width: parts[0] || 0, height: parts[1] || 0 };
        };
        
        const sizeA = parseSize(a);
        const sizeB = parseSize(b);
        
        // Sort by width first, then by height if widths are equal
        if (sizeA.width !== sizeB.width) {
          return sizeA.width - sizeB.width;
        }
        return sizeA.height - sizeB.height;
      }),
      orientations: Array.from(orientations).sort(),
      finishes: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' }
      ]
    };
  }, [variants, seriesCapabilities]);

  // Filter variants based on current selections
  const getFilteredVariants = (
    drawerCount?: string,
    dimensions?: string,
    orientation?: string
  ) => {
    return variants.filter(variant => {
      // Drawer count filter - only apply if series supports drawers
      if (drawerCount && seriesCapabilities.showDrawers) {
        const variantDrawers = variant.number_of_drawers || variant.drawer_count || 
          (variant.product_code?.match(/DWR?(\d+)/)?.[1] ? parseInt(variant.product_code.match(/DWR?(\d+)/)?.[1]!) : undefined);
        if (variantDrawers !== parseInt(drawerCount)) return false;
      }

      // Dimensions filter
      if (dimensions && variant.dimensions !== dimensions) return false;

      // Orientation filter - only apply if series supports orientation
      if (orientation && seriesCapabilities.showOrientation) {
        const variantOrientation = variant.orientation || 'Standard';
        if (variantOrientation !== orientation) return false;
      }

      return true;
    });
  };

  // Get available options for each dropdown based on current selections
  const getAvailableOptions = (optionType: string) => {
    const filtered = getFilteredVariants(
      optionType !== 'drawerCount' ? selectedDrawerCount : undefined,
      optionType !== 'dimensions' ? selectedDimensions : undefined,
      optionType !== 'orientation' ? selectedOrientation : undefined
    );

    switch (optionType) {
      case 'drawerCount':
        return configurationOptions.drawerCounts.filter(count => 
          filtered.some(v => {
            const variantDrawers = v.number_of_drawers || v.drawer_count || 
              (v.product_code?.match(/DWR?(\d+)/)?.[1] ? parseInt(v.product_code.match(/DWR?(\d+)/)?.[1]!) : undefined);
            return variantDrawers === count;
          })
        );
      case 'dimensions':
        return configurationOptions.dimensions.filter(dim => 
          filtered.some(v => v.dimensions === dim)
        );
      case 'orientation':
        return configurationOptions.orientations.filter(orient => 
          filtered.some(v => (v.orientation || 'Standard') === orient)
        );
      default:
        return [];
    }
  };

  // Auto-select first variant when configuration changes
  useEffect(() => {
    const filteredVariants = getFilteredVariants(
      seriesCapabilities.showDrawers ? selectedDrawerCount : undefined,
      selectedDimensions,
      seriesCapabilities.showOrientation ? selectedOrientation : undefined
    );
    
    console.log('🔧 Configuration changed:', {
      drawerCount: selectedDrawerCount,
      dimensions: selectedDimensions,
      orientation: selectedOrientation,
      filteredVariants: filteredVariants.length,
      capabilities: seriesCapabilities
    });
    
    if (filteredVariants.length > 0 && !filteredVariants.find(v => v.id === selectedVariantId)) {
      console.log('🎯 Auto-selecting variant:', filteredVariants[0].product_code);
      onVariantChange(filteredVariants[0].id);
    }
  }, [selectedDrawerCount, selectedDimensions, selectedOrientation, seriesCapabilities]);

  // Reset dependent selections when parent selection changes
  const handleDrawerCountChange = (value: string) => {
    setSelectedDrawerCount(value);
    setSelectedDimensions('');
    setSelectedOrientation('');
  };

  const handleDimensionsChange = (value: string) => {
    setSelectedDimensions(value);
    setSelectedOrientation('');
  };

  // Clear all selections
  const handleClearOptions = () => {
    setSelectedDrawerCount('');
    setSelectedDimensions('');
    setSelectedOrientation('');
  };

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
      <CardContent className="space-y-6 pt-6">
        {/* Configuration Dropdowns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Configuration Options</h4>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearOptions}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Options
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Drawer Count - only show if series supports drawers */}
            {seriesCapabilities.showDrawers && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Number of Drawers</label>
                <Select value={selectedDrawerCount} onValueChange={handleDrawerCountChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select drawer count" />
                  </SelectTrigger>
                  <SelectContent>
                    {configurationOptions.drawerCounts.map(count => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} {count === 1 ? 'Drawer' : 'Drawers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dimensions - show immediately for knee space/open rack, or after drawer selection for others */}
            {(!seriesCapabilities.showDrawers || selectedDrawerCount) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Dimensions</label>
                <Select value={selectedDimensions} onValueChange={handleDimensionsChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dimensions" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableOptions('dimensions').map(dim => (
                      <SelectItem key={dim} value={dim}>
                        {dim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Orientation - only show if series supports orientation and dimensions are selected */}
            {seriesCapabilities.showOrientation && selectedDimensions && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Orientation</label>
                <Select value={selectedOrientation} onValueChange={setSelectedOrientation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableOptions('orientation').map(orient => (
                      <SelectItem key={orient} value={orient}>
                        {orient === 'LH' ? 'Left Hand' : 
                         orient === 'RH' ? 'Right Hand' : orient}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Finish Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h4 className="font-medium">Finish Options</h4>
          </div>
          <Select value={selectedFinish} onValueChange={onFinishChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select finish" />
            </SelectTrigger>
            <SelectContent>
              {configurationOptions.finishes.map(finish => (
                <SelectItem key={finish.value} value={finish.value}>
                  {finish.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Available Variants - show when required selections are made */}
        {(
          (!seriesCapabilities.showDrawers || selectedDrawerCount) && 
          selectedDimensions && 
          (!seriesCapabilities.showOrientation || selectedOrientation)
        ) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Available Variants</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {getFilteredVariants(
                seriesCapabilities.showDrawers ? selectedDrawerCount : undefined,
                selectedDimensions,
                seriesCapabilities.showOrientation ? selectedOrientation : undefined
              ).map(variant => (
                <button
                  key={variant.id}
                  onClick={() => {
                    console.log('🎯 Manual variant selection:', variant.product_code, variant.id);
                    onVariantChange(variant.id);
                  }}
                  className={`p-2 text-xs rounded border transition-colors ${
                    variant.id === selectedVariantId 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'hover:bg-muted border-border'
                  }`}
                >
                  {variant.product_code}
                </button>
              ))}
            </div>
          </div>
        )}

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

              {seriesCapabilities.showDrawers && (selectedVariant.number_of_drawers || selectedVariant.drawer_count) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Drawers:</span>
                  <span className="text-sm font-medium">
                    {selectedVariant.number_of_drawers || selectedVariant.drawer_count}
                  </span>
                </div>
              )}

              {seriesCapabilities.showOrientation && selectedVariant.orientation && selectedVariant.orientation !== 'None' && (
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
                  {configurationOptions.finishes.find(f => f.value === selectedFinish)?.label}
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