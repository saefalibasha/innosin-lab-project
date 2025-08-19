
import React, { useState, useMemo } from 'react';
import { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Ruler, Grid, Palette } from 'lucide-react';

interface InnosinLabConfiguratorProps {
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
}

const InnosinLabConfigurator: React.FC<InnosinLabConfiguratorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange
}) => {
  const [activeTab, setActiveTab] = useState<string>('configuration');

  const selectedProduct = variants.find(v => v.id === selectedVariantId) || variants[0];

  // Extract unique values for each configuration option
  const configurationOptions = useMemo(() => {
    const cabinetTypes = [...new Set(variants.map(v => {
      const name = v.name || '';
      if (name.includes('MC-PC-LH') || name.includes('MC-PC-RH')) return 'Mobile Cabinet (Handed)';
      if (name.includes('MC-PC-DWR')) return 'Mobile Cabinet (Drawers)';
      if (name.includes('MC-PC-DD')) return 'Mobile Cabinet (Double Door)';
      if (name.includes('MCC-PC')) return 'Mobile Combination Cabinet';
      if (name.includes('WCG-PC')) return 'Wall Cabinet Glass';
      if (name.includes('TCG-PC')) return 'Tall Cabinet Glass';
      if (name.includes('OR-PC')) return 'Open Rack';
      return 'Mobile Cabinet';
    }))];

    const orientations = [...new Set(variants.map(v => {
      if (v.name?.includes('LH')) return 'Left Hand';
      if (v.name?.includes('RH')) return 'Right Hand';
      if (v.name?.includes('DD')) return 'Double Door';
      return 'Standard';
    }))];

    const drawerCounts = [...new Set(variants.map(v => {
      const match = v.name?.match(/DWR(\d+)/);
      return match ? `${match[1]} Drawers` : 'No Drawers';
    }))];

    const dimensions = [...new Set(variants.map(v => v.dimensions).filter(Boolean))];

    const finishes = [...new Set(variants.map(v => v.finish_type).filter(Boolean))];

    return {
      cabinetTypes,
      orientations,
      drawerCounts,
      dimensions,
      finishes
    };
  }, [variants]);

  const getFilteredVariants = (filterType: string, filterValue: string) => {
    return variants.filter(variant => {
      switch (filterType) {
        case 'cabinetType':
          const name = variant.name || '';
          if (filterValue === 'Mobile Cabinet (Handed)') {
            return name.includes('MC-PC-LH') || name.includes('MC-PC-RH');
          }
          if (filterValue === 'Mobile Cabinet (Drawers)') {
            return name.includes('MC-PC-DWR');
          }
          if (filterValue === 'Mobile Cabinet (Double Door)') {
            return name.includes('MC-PC-DD');
          }
          if (filterValue === 'Mobile Combination Cabinet') {
            return name.includes('MCC-PC');
          }
          if (filterValue === 'Wall Cabinet Glass') {
            return name.includes('WCG-PC');
          }
          if (filterValue === 'Tall Cabinet Glass') {
            return name.includes('TCG-PC');
          }
          if (filterValue === 'Open Rack') {
            return name.includes('OR-PC');
          }
          return true;
        case 'orientation':
          if (filterValue === 'Left Hand') return variant.name?.includes('LH');
          if (filterValue === 'Right Hand') return variant.name?.includes('RH');
          if (filterValue === 'Double Door') return variant.name?.includes('DD');
          return filterValue === 'Standard';
        case 'drawerCount':
          const match = variant.name?.match(/DWR(\d+)/);
          const count = match ? `${match[1]} Drawers` : 'No Drawers';
          return count === filterValue;
        case 'dimensions':
          return variant.dimensions === filterValue;
        case 'finish':
          return variant.finish_type === filterValue;
        default:
          return true;
      }
    });
  };

  const handleFilterChange = (filterType: string, filterValue: string) => {
    const filteredVariants = getFilteredVariants(filterType, filterValue);
    if (filteredVariants.length > 0) {
      onVariantChange(filteredVariants[0].id);
    }
  };

  const configuratorOptions = [
    {
      id: 'configuration',
      name: 'Configuration',
      icon: Package,
      description: 'Select product configuration',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Cabinet Type</label>
            <Select
              value={configurationOptions.cabinetTypes.find(type => 
                getFilteredVariants('cabinetType', type).some(v => v.id === selectedVariantId)
              ) || ''}
              onValueChange={(value) => handleFilterChange('cabinetType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cabinet type" />
              </SelectTrigger>
              <SelectContent>
                {configurationOptions.cabinetTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {configurationOptions.orientations.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Orientation</label>
              <Select
                value={configurationOptions.orientations.find(orientation => 
                  getFilteredVariants('orientation', orientation).some(v => v.id === selectedVariantId)
                ) || ''}
                onValueChange={(value) => handleFilterChange('orientation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  {configurationOptions.orientations.map((orientation) => (
                    <SelectItem key={orientation} value={orientation}>
                      {orientation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {configurationOptions.drawerCounts.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Drawer Configuration</label>
              <Select
                value={configurationOptions.drawerCounts.find(count => 
                  getFilteredVariants('drawerCount', count).some(v => v.id === selectedVariantId)
                ) || ''}
                onValueChange={(value) => handleFilterChange('drawerCount', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select drawer configuration" />
                </SelectTrigger>
                <SelectContent>
                  {configurationOptions.drawerCounts.map((count) => (
                    <SelectItem key={count} value={count}>
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'dimensions',
      name: 'Dimensions',
      icon: Ruler,
      description: 'Select product dimensions',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Size</label>
            <Select
              value={selectedProduct.dimensions || ''}
              onValueChange={(value) => handleFilterChange('dimensions', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dimensions" />
              </SelectTrigger>
              <SelectContent>
                {configurationOptions.dimensions.map((dimension) => (
                  <SelectItem key={dimension} value={dimension}>
                    {dimension}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Current: {selectedProduct.dimensions || 'Not specified'}
          </div>
        </div>
      ),
    },
    {
      id: 'finishes',
      name: 'Finishes',
      icon: Palette,
      description: 'Select product finish',
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Finish Type</label>
            <Select
              value={selectedProduct.finish_type || ''}
              onValueChange={(value) => handleFilterChange('finish', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select finish" />
              </SelectTrigger>
              <SelectContent>
                {configurationOptions.finishes.map((finish) => (
                  <SelectItem key={finish} value={finish}>
                    {finish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Current: {selectedProduct.finish_type || 'Not specified'}
          </div>
        </div>
      ),
    },
  ];

  const activeOption = configuratorOptions.find(option => option.id === activeTab);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-2">
            {configuratorOptions.map((option) => (
              <button
                key={option.id}
                className={`flex items-center justify-start p-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === option.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-transparent hover:bg-muted'
                }`}
                onClick={() => setActiveTab(option.id)}
              >
                <option.icon className="mr-2 h-4 w-4" />
                {option.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="md:col-span-3">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{activeOption?.name}</h3>
              <p className="text-sm text-muted-foreground">{activeOption?.description}</p>
            </div>
            {activeOption?.content}
            
            {/* Show current selection */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedProduct.product_code}</p>
                </div>
                <Badge variant="outline">Selected</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InnosinLabConfigurator;
