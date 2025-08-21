
import React, { useMemo, useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SpecificProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
}

export const SpecificProductSelector: React.FC<SpecificProductSelectorProps> = ({
  products,
  selectedProduct,
  onProductSelect
}) => {
  const [selectedConfigs, setSelectedConfigs] = useState<Record<string, string>>({});

  // Enhanced series type detection
  const seriesType = useMemo(() => {
    if (products.length === 0) return 'unknown';
    
    const firstProduct = products[0];
    const productSeries = firstProduct.product_series?.toLowerCase() || '';
    const category = firstProduct.category?.toLowerCase() || '';
    
    // Check for UNIFLEX series (Broen-Lab)
    if (productSeries.includes('uniflex') || 
        productSeries.includes('single way taps') || 
        firstProduct.mixing_type || 
        firstProduct.handle_type) {
      return 'uniflex';
    }
    
    // Check for Emergency Shower series (Broen-Lab)
    if (productSeries.includes('emergency shower') || 
        firstProduct.emergency_shower_type) {
      return 'emergency_shower';
    }
    
    // Check for Safe Aire II / Fume Hoods
    if (productSeries.includes('safe aire') || 
        productSeries.includes('fume hood') ||
        category.includes('fume') ||
        firstProduct.mounting_type) {
      return 'safe_aire';
    }
    
    // Check for Innosin Lab series
    if (category.includes('innosin') || productSeries.includes('innosin')) {
      return 'innosin_lab';
    }
    
    // Check for specific fume hood series
    if (productSeries.includes('tangerine') || 
        productSeries.includes('noce') ||
        firstProduct.cabinet_class) {
      return 'fume_hood';
    }
    
    return 'standard';
  }, [products]);

  // Get unique configuration options based on series type and available data
  const configOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};
    
    products.forEach(product => {
      const productName = product.name?.toLowerCase() || '';
      const productCode = product.product_code?.toLowerCase() || '';
      
      // Check if this is a knee space or open rack product (should not have drawer options)
      const isKneeSpace = productName.includes('knee space') || productCode.includes('ks');
      const isOpenRack = productName.includes('open rack') || productCode.includes('or-');
      
      // UNIFLEX configurations
      if (seriesType === 'uniflex') {
        if (product.mixing_type) {
          if (!options.mixing_type) options.mixing_type = new Set();
          options.mixing_type.add(product.mixing_type);
        }
        if (product.handle_type) {
          if (!options.handle_type) options.handle_type = new Set();
          options.handle_type.add(product.handle_type);
        }
      }
      
      // Emergency Shower configurations
      if (seriesType === 'emergency_shower' && product.emergency_shower_type) {
        if (!options.emergency_shower_type) options.emergency_shower_type = new Set();
        options.emergency_shower_type.add(product.emergency_shower_type);
      }
      
      // Safe Aire / Fume Hood configurations
      if ((seriesType === 'safe_aire' || seriesType === 'fume_hood') && product.mounting_type) {
        if (!options.mounting_type) options.mounting_type = new Set();
        options.mounting_type.add(product.mounting_type);
      }
      
      // Innosin Lab configurations
      if (seriesType === 'innosin_lab') {
        // Always show dimensions for Innosin Lab products
        if (product.dimensions) {
          if (!options.dimensions) options.dimensions = new Set();
          options.dimensions.add(product.dimensions);
        }
        
        // Always show finish options
        if (product.finish_type) {
          if (!options.finish_type) options.finish_type = new Set();
          options.finish_type.add(product.finish_type);
        }
        
        // Only show drawer count if the product actually has drawers and is not knee space/open rack
        if (!isKneeSpace && !isOpenRack) {
          if (product.number_of_drawers && product.number_of_drawers > 0) {
            if (!options.number_of_drawers) options.number_of_drawers = new Set();
            options.number_of_drawers.add(product.number_of_drawers.toString());
          }
          if (product.drawer_count && product.drawer_count > 0) {
            if (!options.drawer_count) options.drawer_count = new Set();
            options.drawer_count.add(product.drawer_count.toString());
          }
        }
        
        // Only show orientation for products that have meaningful orientation options
        if (product.orientation && product.orientation !== 'None' && product.orientation !== '') {
          if (!options.orientation) options.orientation = new Set();
          options.orientation.add(product.orientation);
        }
        
        // Only show door type for products that have doors
        if (product.door_type && product.door_type !== 'None' && product.door_type !== '') {
          if (!options.door_type) options.door_type = new Set();
          options.door_type.add(product.door_type);
        }
      }
      
      // Fume Hood specific configurations
      if (seriesType === 'fume_hood' && product.cabinet_class) {
        if (!options.cabinet_class) options.cabinet_class = new Set();
        options.cabinet_class.add(product.cabinet_class);
      }
      
      // Common configurations for non-Innosin Lab types
      if (seriesType !== 'innosin_lab') {
        if (product.dimensions) {
          if (!options.dimensions) options.dimensions = new Set();
          options.dimensions.add(product.dimensions);
        }
        
        if (product.finish_type) {
          if (!options.finish_type) options.finish_type = new Set();
          options.finish_type.add(product.finish_type);
        }
      }
    });
    
    // Convert to sorted arrays
    const result: Record<string, string[]> = {};
    Object.entries(options).forEach(([key, valueSet]) => {
      result[key] = Array.from(valueSet).sort();
    });
    
    return result;
  }, [products, seriesType]);

  // Filter products based on selected configurations
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    Object.entries(selectedConfigs).forEach(([configType, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(product => {
          switch (configType) {
            case 'mixing_type':
              return product.mixing_type === value;
            case 'handle_type':
              return product.handle_type === value;
            case 'emergency_shower_type':
              return product.emergency_shower_type === value;
            case 'mounting_type':
              return product.mounting_type === value;
            case 'cabinet_class':
              return product.cabinet_class === value;
            case 'finish_type':
              return product.finish_type === value;
            case 'orientation':
              return product.orientation === value;
            case 'door_type':
              return product.door_type === value;
            case 'dimensions':
              return product.dimensions === value;
            case 'number_of_drawers':
              return product.number_of_drawers?.toString() === value;
            case 'drawer_count':
              return product.drawer_count?.toString() === value;
            default:
              return true;
          }
        });
      }
    });
    
    return filtered;
  }, [products, selectedConfigs]);

  // Auto-select first product when filters change
  useEffect(() => {
    if (filteredProducts.length > 0 && (!selectedProduct || !filteredProducts.find(p => p.id === selectedProduct.id))) {
      onProductSelect(filteredProducts[0]);
    }
  }, [filteredProducts, selectedProduct, onProductSelect]);

  const handleConfigChange = (configType: string, value: string) => {
    setSelectedConfigs(prev => ({
      ...prev,
      [configType]: value
    }));
  };

  const getConfigLabel = (configType: string) => {
    switch (configType) {
      case 'mixing_type':
        return 'Mixing Type';
      case 'handle_type':
        return 'Handle Type';
      case 'emergency_shower_type':
        return 'Emergency Shower Type';
      case 'mounting_type':
        return 'Mounting Type';
      case 'cabinet_class':
        return 'Cabinet Class';
      case 'finish_type':
        return 'Finish Type';
      case 'orientation':
        return 'Orientation';
      case 'door_type':
        return 'Door Type';
      case 'dimensions':
        return 'Dimensions';
      default:
        return configType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getSeriesDisplayName = () => {
    switch (seriesType) {
      case 'uniflex':
        return 'UNIFLEX Taps';
      case 'emergency_shower':
        return 'Emergency Shower';
      case 'safe_aire':
        return 'Safe Aire II';
      case 'fume_hood':
        return 'Fume Hood';
      case 'innosin_lab':
        return 'Innosin Lab';
      default:
        return 'Product';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Selectors */}
      {Object.keys(configOptions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{getSeriesDisplayName()} Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(configOptions).map(([configType, options]) => (
                <div key={configType} className="space-y-2">
                  <label className="text-sm font-medium">{getConfigLabel(configType)}</label>
                  <Select
                    value={selectedConfigs[configType] || 'all'}
                    onValueChange={(value) => handleConfigChange(configType, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${getConfigLabel(configType)}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Options</SelectItem>
                      {options.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Available {getSeriesDisplayName()} Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedProduct?.id === product.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onProductSelect(product)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Code: {product.product_code}
                    </p>
                    {product.dimensions && (
                      <p className="text-xs text-muted-foreground">
                        Size: {product.dimensions}
                      </p>
                    )}
                    
                    {/* Configuration badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.mixing_type && (
                        <Badge variant="outline" className="text-xs">
                          {product.mixing_type}
                        </Badge>
                      )}
                      {product.handle_type && (
                        <Badge variant="outline" className="text-xs">
                          {product.handle_type}
                        </Badge>
                      )}
                      {product.emergency_shower_type && (
                        <Badge variant="outline" className="text-xs">
                          {product.emergency_shower_type}
                        </Badge>
                      )}
                      {product.mounting_type && (
                        <Badge variant="outline" className="text-xs">
                          {product.mounting_type}
                        </Badge>
                      )}
                      {product.cabinet_class && (
                        <Badge variant="outline" className="text-xs">
                          {product.cabinet_class}
                        </Badge>
                      )}
                      {product.finish_type && (
                        <Badge variant="outline" className="text-xs">
                          {product.finish_type}
                        </Badge>
                      )}
                      {product.orientation && (
                        <Badge variant="outline" className="text-xs">
                          {product.orientation}
                        </Badge>
                      )}
                      {product.door_type && (
                        <Badge variant="outline" className="text-xs">
                          {product.door_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {product.thumbnail_path && (
                    <img
                      src={product.thumbnail_path}
                      alt={product.name}
                      className="w-12 h-12 object-contain ml-3 rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No products match the selected configuration.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
