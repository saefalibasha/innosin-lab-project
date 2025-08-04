
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';

interface ProductVariantSelectorProps {
  products: Product[];
  selectedVariants: Record<string, string>;
  onVariantChange: (variantType: string, value: string) => void;
  onProductSelect: (product: Product) => void;
  selectedProduct?: Product | null;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  products,
  selectedVariants,
  onVariantChange,
  onProductSelect,
  selectedProduct
}) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Get unique values for each configuration field
  const configOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};
    
    products.forEach(product => {
      // Emergency Shower Type
      if (product.emergency_shower_type) {
        if (!options.emergency_shower_type) options.emergency_shower_type = new Set();
        options.emergency_shower_type.add(product.emergency_shower_type);
      }
      
      // Mixing Type (for UNIFLEX)
      if (product.mixing_type) {
        if (!options.mixing_type) options.mixing_type = new Set();
        options.mixing_type.add(product.mixing_type);
      }
      
      // Handle Type (for UNIFLEX)
      if (product.handle_type) {
        if (!options.handle_type) options.handle_type = new Set();
        options.handle_type.add(product.handle_type);
      }
      
      // Mounting Type (for Safe Aire and others)
      if (product.mounting_type) {
        if (!options.mounting_type) options.mounting_type = new Set();
        options.mounting_type.add(product.mounting_type);
      }
      
      // Cabinet Class (for fume hoods)
      if (product.cabinet_class) {
        if (!options.cabinet_class) options.cabinet_class = new Set();
        options.cabinet_class.add(product.cabinet_class);
      }
      
      // Finish Type
      if (product.finish_type) {
        if (!options.finish_type) options.finish_type = new Set();
        options.finish_type.add(product.finish_type);
      }
      
      // Dimensions
      if (product.dimensions) {
        if (!options.dimensions) options.dimensions = new Set();
        options.dimensions.add(product.dimensions);
      }
      
      // Orientation
      if (product.orientation && product.orientation !== 'None') {
        if (!options.orientation) options.orientation = new Set();
        options.orientation.add(product.orientation);
      }
      
      // Door Type
      if (product.door_type) {
        if (!options.door_type) options.door_type = new Set();
        options.door_type.add(product.door_type);
      }
      
      // Drawer Count
      if (product.drawer_count) {
        if (!options.drawer_count) options.drawer_count = new Set();
        options.drawer_count.add(product.drawer_count.toString());
      }
    });
    
    // Convert Sets to sorted arrays
    const sortedOptions: Record<string, string[]> = {};
    Object.keys(options).forEach(key => {
      sortedOptions[key] = Array.from(options[key]).sort();
    });
    
    return sortedOptions;
  }, [products]);

  // Filter products based on selected variants
  useEffect(() => {
    let filtered = products;
    
    Object.entries(selectedVariants).forEach(([variantType, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(product => {
          switch (variantType) {
            case 'emergency_shower_type':
              return product.emergency_shower_type === value;
            case 'mixing_type':
              return product.mixing_type === value;
            case 'handle_type':
              return product.handle_type === value;
            case 'mounting_type':
              return product.mounting_type === value;
            case 'cabinet_class':
              return product.cabinet_class === value;
            case 'finish_type':
              return product.finish_type === value;
            case 'dimensions':
              return product.dimensions === value;
            case 'orientation':
              return product.orientation === value;
            case 'door_type':
              return product.door_type === value;
            case 'drawer_count':
              return product.drawer_count?.toString() === value;
            default:
              return true;
          }
        });
      }
    });
    
    setFilteredProducts(filtered);
    
    // Auto-select the first product if no product is selected or current selection doesn't match filters
    if (filtered.length > 0) {
      if (!selectedProduct || !filtered.find(p => p.id === selectedProduct.id)) {
        onProductSelect(filtered[0]);
      }
    }
  }, [selectedVariants, products, selectedProduct, onProductSelect]);

  const getFieldLabel = (fieldName: string) => {
    switch (fieldName) {
      case 'emergency_shower_type':
        return 'Emergency Shower Type';
      case 'mixing_type':
        return 'Mixing Type';
      case 'handle_type':
        return 'Handle Type';
      case 'mounting_type':
        return 'Mounting Type';
      case 'cabinet_class':
        return 'Cabinet Class';
      case 'finish_type':
        return 'Finish';
      case 'dimensions':
        return 'Dimensions';
      case 'orientation':
        return 'Orientation';
      case 'door_type':
        return 'Door Type';
      case 'drawer_count':
        return 'Drawer Count';
      default:
        return fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      {/* Configuration Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(configOptions).map(([fieldName, options]) => (
          <div key={fieldName} className="space-y-2">
            <label className="text-sm font-medium">{getFieldLabel(fieldName)}</label>
            <Select
              value={selectedVariants[fieldName] || 'all'}
              onValueChange={(value) => onVariantChange(fieldName, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${getFieldLabel(fieldName)}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {getFieldLabel(fieldName)}s</SelectItem>
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

      {/* Filtered Products */}
      {filteredProducts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            Available Products ({filteredProducts.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedProduct?.id === product.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onProductSelect(product)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate">{product.name}</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Code: {product.product_code}
                      </p>
                      {product.dimensions && (
                        <p className="text-xs text-muted-foreground">
                          Dimensions: {product.dimensions}
                        </p>
                      )}
                      
                      {/* Configuration badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.emergency_shower_type && (
                          <Badge variant="outline" className="text-xs">
                            {product.emergency_shower_type}
                          </Badge>
                        )}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No products match the selected configuration.</p>
          <p className="text-xs mt-1">Try adjusting your selections above.</p>
        </div>
      )}
    </div>
  );
};
