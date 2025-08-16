
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/types/product';
import { Separator } from '@/components/ui/separator';
import { Package, Wrench, Palette, Move3D, FileText } from 'lucide-react';

interface UniversalProductConfiguratorProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  seriesName?: string;
}

interface ConfigurationOptions {
  finishes: Set<string>;
  orientations: Set<string>;
  dimensions: Set<string>;
  drawerCounts: Set<number>;
  doorTypes: Set<string>;
  mountingTypes: Set<string>;
  mixingTypes: Set<string>;
  handleTypes: Set<string>;
  emergencyTypes: Set<string>;
}

export const UniversalProductConfigurator: React.FC<UniversalProductConfiguratorProps> = ({
  products,
  selectedProduct,
  onProductSelect,
  seriesName
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [availableOptions, setAvailableOptions] = useState<ConfigurationOptions>({
    finishes: new Set(),
    orientations: new Set(),
    dimensions: new Set(),
    drawerCounts: new Set(),
    doorTypes: new Set(),
    mountingTypes: new Set(),
    mixingTypes: new Set(),
    handleTypes: new Set(),
    emergencyTypes: new Set()
  });

  // Extract all available configuration options from products
  useEffect(() => {
    const options: ConfigurationOptions = {
      finishes: new Set(),
      orientations: new Set(),
      dimensions: new Set(),
      drawerCounts: new Set(),
      doorTypes: new Set(),
      mountingTypes: new Set(),
      mixingTypes: new Set(),
      handleTypes: new Set(),
      emergencyTypes: new Set()
    };

    products.forEach(product => {
      if (product.finish_type) options.finishes.add(product.finish_type);
      if (product.orientation) options.orientations.add(product.orientation);
      if (product.dimensions) options.dimensions.add(product.dimensions);
      if (product.drawer_count && product.drawer_count > 0) options.drawerCounts.add(product.drawer_count);
      if (product.door_type) options.doorTypes.add(product.door_type);
      if (product.mounting_type) options.mountingTypes.add(product.mounting_type);
      if (product.mixing_type) options.mixingTypes.add(product.mixing_type);
      if (product.handle_type) options.handleTypes.add(product.handle_type);
      if (product.emergency_shower_type) options.emergencyTypes.add(product.emergency_shower_type);
    });

    setAvailableOptions(options);
  }, [products]);

  // Filter products based on active filters
  const filteredProducts = products.filter(product => {
    return Object.entries(activeFilters).every(([filterType, filterValue]) => {
      if (!filterValue) return true;
      
      switch (filterType) {
        case 'finish': return product.finish_type === filterValue;
        case 'orientation': return product.orientation === filterValue;
        case 'dimensions': return product.dimensions === filterValue;
        case 'drawers': return product.drawer_count?.toString() === filterValue;
        case 'door': return product.door_type === filterValue;
        case 'mounting': return product.mounting_type === filterValue;
        case 'mixing': return product.mixing_type === filterValue;
        case 'handle': return product.handle_type === filterValue;
        case 'emergency': return product.emergency_shower_type === filterValue;
        default: return true;
      }
    });
  });

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...activeFilters, [filterType]: value };
    setActiveFilters(newFilters);
    
    // Auto-select first matching product
    const matchingProducts = products.filter(product => {
      return Object.entries(newFilters).every(([fType, fValue]) => {
        if (!fValue) return true;
        switch (fType) {
          case 'finish': return product.finish_type === fValue;
          case 'orientation': return product.orientation === fValue;
          case 'dimensions': return product.dimensions === fValue;
          case 'drawers': return product.drawer_count?.toString() === fValue;
          case 'door': return product.door_type === fValue;
          case 'mounting': return product.mounting_type === fValue;
          case 'mixing': return product.mixing_type === fValue;
          case 'handle': return product.handle_type === fValue;
          case 'emergency': return product.emergency_shower_type === fValue;
          default: return true;
        }
      });
    });

    if (matchingProducts.length > 0) {
      onProductSelect(matchingProducts[0]);
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    if (products.length > 0) {
      onProductSelect(products[0]);
    }
  };

  const hasOptions = Object.values(availableOptions).some(set => set.size > 1);

  if (!hasOptions) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2" />
            <p>This product has no configurable options.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Product Configuration
          {seriesName && <Badge variant="outline">{seriesName}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableOptions.finishes.size > 1 && (
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Finish Type
              </label>
              <Select value={activeFilters.finish || ''} onValueChange={(value) => handleFilterChange('finish', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select finish" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Finishes</SelectItem>
                  {Array.from(availableOptions.finishes).map(finish => (
                    <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.orientations.size > 1 && (
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Move3D className="h-4 w-4" />
                Orientation
              </label>
              <Select value={activeFilters.orientation || ''} onValueChange={(value) => handleFilterChange('orientation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Orientations</SelectItem>
                  {Array.from(availableOptions.orientations).map(orientation => (
                    <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.dimensions.size > 1 && (
            <div>
              <label className="text-sm font-medium mb-2">Dimensions</label>
              <Select value={activeFilters.dimensions || ''} onValueChange={(value) => handleFilterChange('dimensions', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dimensions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Dimensions</SelectItem>
                  {Array.from(availableOptions.dimensions).map(dimension => (
                    <SelectItem key={dimension} value={dimension}>{dimension}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.drawerCounts.size > 1 && (
            <div>
              <label className="text-sm font-medium mb-2">Number of Drawers</label>
              <Select value={activeFilters.drawers || ''} onValueChange={(value) => handleFilterChange('drawers', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drawers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Drawer Options</SelectItem>
                  {Array.from(availableOptions.drawerCounts).sort((a, b) => a - b).map(count => (
                    <SelectItem key={count} value={count.toString()}>{count} Drawers</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.doorTypes.size > 1 && (
            <div>
              <label className="text-sm font-medium mb-2">Door Type</label>
              <Select value={activeFilters.door || ''} onValueChange={(value) => handleFilterChange('door', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select door type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Door Types</SelectItem>
                  {Array.from(availableOptions.doorTypes).map(doorType => (
                    <SelectItem key={doorType} value={doorType}>{doorType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.mountingTypes.size > 1 && (
            <div>
              <label className="text-sm font-medium mb-2">Mounting Type</label>
              <Select value={activeFilters.mounting || ''} onValueChange={(value) => handleFilterChange('mounting', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mounting type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Mounting Types</SelectItem>
                  {Array.from(availableOptions.mountingTypes).map(mountingType => (
                    <SelectItem key={mountingType} value={mountingType}>{mountingType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.mixingTypes.size > 1 && (
            <div>
              <label className="text-sm font-medium mb-2">Mixing Type</label>
              <Select value={activeFilters.mixing || ''} onValueChange={(value) => handleFilterChange('mixing', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mixing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Mixing Types</SelectItem>
                  {Array.from(availableOptions.mixingTypes).map(mixingType => (
                    <SelectItem key={mixingType} value={mixingType}>{mixingType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.handleTypes.size > 1 && (
            <div>
              <label className="text-sm font-medium mb-2">Handle Type</label>
              <Select value={activeFilters.handle || ''} onValueChange={(value) => handleFilterChange('handle', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select handle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Handle Types</SelectItem>
                  {Array.from(availableOptions.handleTypes).map(handleType => (
                    <SelectItem key={handleType} value={handleType}>{handleType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.emergencyTypes.size > 1 && (
            <div>
              <label className="text-sm font-medium mb-2">Emergency Type</label>
              <Select value={activeFilters.emergency || ''} onValueChange={(value) => handleFilterChange('emergency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Emergency Types</SelectItem>
                  {Array.from(availableOptions.emergencyTypes).map(emergencyType => (
                    <SelectItem key={emergencyType} value={emergencyType}>{emergencyType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {Object.values(activeFilters).some(filter => filter) && (
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([filterType, filterValue]) => {
                if (!filterValue) return null;
                return (
                  <Badge key={filterType} variant="secondary">
                    {filterType}: {filterValue}
                  </Badge>
                );
              })}
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        <Separator />

        {/* Selected Product Info */}
        {selectedProduct && (
          <div className="space-y-3">
            <h4 className="font-medium">Selected Configuration</h4>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="font-medium">{selectedProduct.name}</div>
              <div className="text-sm text-muted-foreground">{selectedProduct.product_code}</div>
              <div className="text-sm mt-1">{selectedProduct.description}</div>
            </div>
          </div>
        )}

        {/* Available Products Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products.length} configurations
        </div>
      </CardContent>
    </Card>
  );
};
