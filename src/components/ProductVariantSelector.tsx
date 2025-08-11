
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';

interface ProductVariantSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
}

interface VariantOptions {
  finish_type: string[];
  orientation: string[];
  door_type: string[];
  dimensions: string[];
  drawer_count: number[];
  mounting_type: string[];
  mixing_type: string[];
  handle_type: string[];
  emergency_shower_type: string[];
  cabinet_class: string[];
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  products,
  selectedProduct,
  onProductSelect
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Get all available variant options
  const variantOptions: VariantOptions = {
    finish_type: [],
    orientation: [],
    door_type: [],
    dimensions: [],
    drawer_count: [],
    mounting_type: [],
    mixing_type: [],
    handle_type: [],
    emergency_shower_type: [],
    cabinet_class: []
  };

  products.forEach(product => {
    if (product.finish_type && !variantOptions.finish_type.includes(product.finish_type)) {
      variantOptions.finish_type.push(product.finish_type);
    }
    if (product.orientation && !variantOptions.orientation.includes(product.orientation)) {
      variantOptions.orientation.push(product.orientation);
    }
    if (product.door_type && !variantOptions.door_type.includes(product.door_type)) {
      variantOptions.door_type.push(product.door_type);
    }
    if (product.dimensions && !variantOptions.dimensions.includes(product.dimensions)) {
      variantOptions.dimensions.push(product.dimensions);
    }
    if (product.drawer_count && !variantOptions.drawer_count.includes(product.drawer_count)) {
      variantOptions.drawer_count.push(product.drawer_count);
    }
    if (product.mounting_type && !variantOptions.mounting_type.includes(product.mounting_type)) {
      variantOptions.mounting_type.push(product.mounting_type);
    }
    if (product.mixing_type && !variantOptions.mixing_type.includes(product.mixing_type)) {
      variantOptions.mixing_type.push(product.mixing_type);
    }
    if (product.handle_type && !variantOptions.handle_type.includes(product.handle_type)) {
      variantOptions.handle_type.push(product.handle_type);
    }
    if (product.emergency_shower_type && !variantOptions.emergency_shower_type.includes(product.emergency_shower_type)) {
      variantOptions.emergency_shower_type.push(product.emergency_shower_type);
    }
    if (product.cabinet_class && !variantOptions.cabinet_class.includes(product.cabinet_class)) {
      variantOptions.cabinet_class.push(product.cabinet_class);
    }
  });

  // Sort all options
  Object.keys(variantOptions).forEach(key => {
    if (key === 'drawer_count') {
      (variantOptions[key as keyof VariantOptions] as number[]).sort((a, b) => a - b);
    } else {
      (variantOptions[key as keyof VariantOptions] as string[]).sort();
    }
  });

  // Filter products based on selected options
  const filteredProducts = products.filter(product => {
    return Object.entries(selectedOptions).every(([optionType, value]) => {
      if (!value || value === 'all') return true;
      
      switch (optionType) {
        case 'finish_type':
          return product.finish_type === value;
        case 'orientation':
          return product.orientation === value;
        case 'door_type':
          return product.door_type === value;
        case 'dimensions':
          return product.dimensions === value;
        case 'drawer_count':
          return product.drawer_count?.toString() === value;
        case 'mounting_type':
          return product.mounting_type === value;
        case 'mixing_type':
          return product.mixing_type === value;
        case 'handle_type':
          return product.handle_type === value;
        case 'emergency_shower_type':
          return product.emergency_shower_type === value;
        case 'cabinet_class':
          return product.cabinet_class === value;
        default:
          return true;
      }
    });
  });

  // Auto-select first matching product when options change
  useEffect(() => {
    if (filteredProducts.length > 0 && (!selectedProduct || !filteredProducts.find(p => p.id === selectedProduct.id))) {
      onProductSelect(filteredProducts[0]);
    }
  }, [filteredProducts, selectedProduct, onProductSelect]);

  const handleOptionChange = (optionType: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: value
    }));
  };

  const getOptionLabel = (optionType: string) => {
    switch (optionType) {
      case 'finish_type':
        return 'Finish Type';
      case 'orientation':
        return 'Orientation';
      case 'door_type':
        return 'Door Type';
      case 'dimensions':
        return 'Dimensions';
      case 'drawer_count':
        return 'Number of Drawers';
      case 'mounting_type':
        return 'Mounting Type';
      case 'mixing_type':
        return 'Mixing Type';
      case 'handle_type':
        return 'Handle Type';
      case 'emergency_shower_type':
        return 'Emergency Shower Type';
      case 'cabinet_class':
        return 'Cabinet Class';
      default:
        return optionType;
    }
  };

  // Only show option selectors that have multiple values
  const availableOptions = Object.entries(variantOptions).filter(([_, values]) => values.length > 1);

  if (availableOptions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableOptions.map(([optionType, options]) => (
            <div key={optionType} className="space-y-2">
              <label className="text-sm font-medium">{getOptionLabel(optionType)}</label>
              <Select
                value={selectedOptions[optionType] || 'all'}
                onValueChange={(value) => handleOptionChange(optionType, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${getOptionLabel(optionType)}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Options</SelectItem>
                  {options.map(option => (
                    <SelectItem key={option} value={option.toString()}>
                      {option.toString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Selected Configuration:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{selectedProduct.name}</Badge>
              {selectedProduct.product_code && (
                <Badge variant="outline">Code: {selectedProduct.product_code}</Badge>
              )}
              {selectedProduct.dimensions && (
                <Badge variant="outline">Size: {selectedProduct.dimensions}</Badge>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          {filteredProducts.length} variant{filteredProducts.length !== 1 ? 's' : ''} available
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVariantSelector;
