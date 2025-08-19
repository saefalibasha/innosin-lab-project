
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Package, Layers, Rulers, Palette, RotateCcw } from 'lucide-react';
import { Product } from '@/types/product';

interface InnosinLabConfiguratorProps {
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
}

interface ConfigurationOptions {
  cabinetTypes: string[];
  doorConfigurations: string[];
  drawerCounts: number[];
  dimensions: string[];
  finishTypes: string[];
  orientations: string[];
}

const InnosinLabConfigurator: React.FC<InnosinLabConfiguratorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange
}) => {
  const selectedVariant = variants.find(v => v.id === selectedVariantId);

  // Extract configuration options from variants
  const configOptions: ConfigurationOptions = useMemo(() => {
    const cabinetTypes = [...new Set(variants.map(v => {
      const name = v.name || '';
      if (name.includes('MCC')) return 'Mobile Combination Cabinet';
      if (name.includes('MC')) return 'Mobile Cabinet';
      if (name.includes('WCG')) return 'Wall Cabinet Glass';
      if (name.includes('TCG')) return 'Tall Cabinet Glass';
      if (name.includes('OR')) return 'Open Rack';
      return 'Mobile Cabinet';
    }))];

    const doorConfigurations = [...new Set(variants.map(v => {
      const name = v.name || '';
      if (name.includes('DD')) return 'Double Door';
      if (name.includes('DWR')) return 'Drawers Only';
      if (name.includes('LH')) return 'Left Hand Door';
      if (name.includes('RH')) return 'Right Hand Door';
      return 'Single Door';
    }).filter(Boolean))];

    const drawerCounts = [...new Set(variants.map(v => v.drawer_count || 0))]
      .filter(count => count > 0)
      .sort((a, b) => a - b);

    const dimensions = [...new Set(variants.map(v => v.dimensions).filter(Boolean))]
      .sort();

    const finishTypes = [...new Set(variants.map(v => v.finish_type).filter(Boolean))];

    const orientations = [...new Set(variants.map(v => v.orientation).filter(Boolean))];

    return {
      cabinetTypes,
      doorConfigurations,
      drawerCounts,
      dimensions,
      finishTypes,
      orientations
    };
  }, [variants]);

  // Get current selections
  const currentCabinetType = useMemo(() => {
    const name = selectedVariant?.name || '';
    if (name.includes('MCC')) return 'Mobile Combination Cabinet';
    if (name.includes('MC')) return 'Mobile Cabinet';
    if (name.includes('WCG')) return 'Wall Cabinet Glass';
    if (name.includes('TCG')) return 'Tall Cabinet Glass';
    if (name.includes('OR')) return 'Open Rack';
    return 'Mobile Cabinet';
  }, [selectedVariant]);

  const currentDoorConfig = useMemo(() => {
    const name = selectedVariant?.name || '';
    if (name.includes('DD')) return 'Double Door';
    if (name.includes('DWR')) return 'Drawers Only';
    if (name.includes('LH')) return 'Left Hand Door';
    if (name.includes('RH')) return 'Right Hand Door';
    return 'Single Door';
  }, [selectedVariant]);

  // Filter variants based on selections
  const getFilteredVariants = (filterType: string, filterValue: string) => {
    return variants.filter(variant => {
      switch (filterType) {
        case 'cabinetType':
          const name = variant.name || '';
          if (filterValue === 'Mobile Combination Cabinet') return name.includes('MCC');
          if (filterValue === 'Mobile Cabinet') return name.includes('MC') && !name.includes('MCC');
          if (filterValue === 'Wall Cabinet Glass') return name.includes('WCG');
          if (filterValue === 'Tall Cabinet Glass') return name.includes('TCG');
          if (filterValue === 'Open Rack') return name.includes('OR');
          return true;
        case 'doorConfig':
          const doorName = variant.name || '';
          if (filterValue === 'Double Door') return doorName.includes('DD');
          if (filterValue === 'Drawers Only') return doorName.includes('DWR');
          if (filterValue === 'Left Hand Door') return doorName.includes('LH');
          if (filterValue === 'Right Hand Door') return doorName.includes('RH');
          return !doorName.includes('DD') && !doorName.includes('DWR') && !doorName.includes('LH') && !doorName.includes('RH');
        case 'drawerCount':
          return variant.drawer_count === parseInt(filterValue);
        case 'dimensions':
          return variant.dimensions === filterValue;
        case 'finishType':
          return variant.finish_type === filterValue;
        case 'orientation':
          return variant.orientation === filterValue;
        default:
          return true;
      }
    });
  };

  const handleSelectionChange = (filterType: string, value: string) => {
    const filteredVariants = getFilteredVariants(filterType, value);
    if (filteredVariants.length > 0) {
      onVariantChange(filteredVariants[0].id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Product Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cabinet Type */}
        {configOptions.cabinetTypes.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="w-4 h-4" />
              Cabinet Type
            </div>
            <Select value={currentCabinetType} onValueChange={(value) => handleSelectionChange('cabinetType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select cabinet type" />
              </SelectTrigger>
              <SelectContent>
                {configOptions.cabinetTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Door Configuration */}
        {configOptions.doorConfigurations.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layers className="w-4 h-4" />
              Door Configuration
            </div>
            <Select value={currentDoorConfig} onValueChange={(value) => handleSelectionChange('doorConfig', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select door configuration" />
              </SelectTrigger>
              <SelectContent>
                {configOptions.doorConfigurations.map(config => (
                  <SelectItem key={config} value={config}>
                    {config}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Drawer Count */}
        {configOptions.drawerCounts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layers className="w-4 h-4" />
              Number of Drawers
            </div>
            <Select 
              value={selectedVariant?.drawer_count?.toString() || ''} 
              onValueChange={(value) => handleSelectionChange('drawerCount', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select drawer count" />
              </SelectTrigger>
              <SelectContent>
                {configOptions.drawerCounts.map(count => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} Drawers
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Dimensions */}
        {configOptions.dimensions.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Rulers className="w-4 h-4" />
              Dimensions
            </div>
            <Select 
              value={selectedVariant?.dimensions || ''} 
              onValueChange={(value) => handleSelectionChange('dimensions', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dimensions" />
              </SelectTrigger>
              <SelectContent>
                {configOptions.dimensions.map(dimension => (
                  <SelectItem key={dimension} value={dimension}>
                    {dimension}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Finish Type */}
        {configOptions.finishTypes.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4" />
              Finish
            </div>
            <Select 
              value={selectedVariant?.finish_type || ''} 
              onValueChange={(value) => handleSelectionChange('finishType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select finish" />
              </SelectTrigger>
              <SelectContent>
                {configOptions.finishTypes.map(finish => (
                  <SelectItem key={finish} value={finish}>
                    {finish === 'PC' ? 'Powder Coat' : finish === 'SS304' ? 'Stainless Steel' : finish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Orientation */}
        {configOptions.orientations.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <RotateCcw className="w-4 h-4" />
              Orientation
            </div>
            <Select 
              value={selectedVariant?.orientation || ''} 
              onValueChange={(value) => handleSelectionChange('orientation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select orientation" />
              </SelectTrigger>
              <SelectContent>
                {configOptions.orientations.map(orientation => (
                  <SelectItem key={orientation} value={orientation}>
                    {orientation === 'LH' ? 'Left Hand' : orientation === 'RH' ? 'Right Hand' : orientation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected Product Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            Selected Configuration
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{selectedVariant?.product_code}</Badge>
            {selectedVariant?.dimensions && (
              <Badge variant="secondary">{selectedVariant.dimensions}</Badge>
            )}
            {selectedVariant?.finish_type && (
              <Badge variant="secondary">
                {selectedVariant.finish_type === 'PC' ? 'Powder Coat' : selectedVariant.finish_type}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InnosinLabConfigurator;
