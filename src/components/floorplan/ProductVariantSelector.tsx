
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Palette, RotateCcw, Layers, DoorOpen, Ruler } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductVariantSelectorProps {
  products: Product[];
  selectedVariants: {
    finish?: string;
    orientation?: string;
    drawerCount?: string;
    doorType?: string;
    dimensions?: string;
  };
  onVariantChange: (variantType: string, value: string) => void;
  onProductSelect: (product: Product) => void;
  selectedProduct?: Product;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  products,
  selectedVariants,
  onVariantChange,
  onProductSelect,
  selectedProduct
}) => {
  // Extract available variant options from products
  const availableFinishes = Array.from(new Set(
    products.map(p => p.finish_type).filter(Boolean)
  ));
  
  const availableOrientations = Array.from(new Set(
    products.map(p => p.orientation).filter(Boolean)
  ));
  
  const availableDrawerCounts = Array.from(new Set(
    products.map(p => p.drawer_count?.toString()).filter(Boolean)
  ));
  
  const availableDoorTypes = Array.from(new Set(
    products.map(p => p.door_type).filter(Boolean)
  ));
  
  const availableDimensions = Array.from(new Set(
    products.map(p => p.dimensions).filter(Boolean)
  ));

  // Filter products based on selected variants
  const filteredProducts = products.filter(product => {
    if (selectedVariants.finish && product.finish_type !== selectedVariants.finish) return false;
    if (selectedVariants.orientation && product.orientation !== selectedVariants.orientation) return false;
    if (selectedVariants.drawerCount && product.drawer_count?.toString() !== selectedVariants.drawerCount) return false;
    if (selectedVariants.doorType && product.door_type !== selectedVariants.doorType) return false;
    if (selectedVariants.dimensions && product.dimensions !== selectedVariants.dimensions) return false;
    return true;
  });

  const getFinishDisplayName = (finish: string) => {
    const finishMap: Record<string, string> = {
      'PC': 'Powder Coat',
      'SS304': 'Stainless Steel',
      'powder-coat': 'Powder Coat',
      'stainless-steel': 'Stainless Steel'
    };
    return finishMap[finish] || finish;
  };

  const getOrientationDisplayName = (orientation: string) => {
    const orientationMap: Record<string, string> = {
      'LH': 'Left Hand',
      'RH': 'Right Hand',
      'Left-Handed': 'Left Hand',
      'Right-Handed': 'Right Hand'
    };
    return orientationMap[orientation] || orientation;
  };

  return (
    <div className="space-y-6">
      {/* Finish Type Selection */}
      {availableFinishes.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Finish Type:
          </label>
          <ToggleGroup
            type="single"
            value={selectedVariants.finish || ''}
            onValueChange={(value) => onVariantChange('finish', value)}
            className="justify-start flex-wrap"
          >
            {availableFinishes.map((finish) => (
              <ToggleGroupItem
                key={finish}
                value={finish}
                variant="outline"
                className="text-sm h-10 px-4"
              >
                {getFinishDisplayName(finish)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {/* Orientation Selection */}
      {availableOrientations.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Orientation:
          </label>
          <div className="flex gap-2 flex-wrap">
            {availableOrientations.map((orientation) => (
              <Button
                key={orientation}
                variant={selectedVariants.orientation === orientation ? "default" : "outline"}
                size="sm"
                onClick={() => onVariantChange('orientation', orientation)}
                className="text-sm h-10 px-4"
              >
                {getOrientationDisplayName(orientation)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Drawer Count Selection */}
      {availableDrawerCounts.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Drawer Count:
          </label>
          <Select
            value={selectedVariants.drawerCount || ''}
            onValueChange={(value) => onVariantChange('drawerCount', value)}
          >
            <SelectTrigger className="w-full h-10 text-sm">
              <SelectValue placeholder="Select drawer count" />
            </SelectTrigger>
            <SelectContent>
              {availableDrawerCounts.map((count) => (
                <SelectItem key={count} value={count}>
                  {count} {count === '1' ? 'Drawer' : 'Drawers'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Door Type Selection */}
      {availableDoorTypes.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DoorOpen className="h-4 w-4" />
            Door Type:
          </label>
          <Select
            value={selectedVariants.doorType || ''}
            onValueChange={(value) => onVariantChange('doorType', value)}
          >
            <SelectTrigger className="w-full h-10 text-sm">
              <SelectValue placeholder="Select door type" />
            </SelectTrigger>
            <SelectContent>
              {availableDoorTypes.map((doorType) => (
                <SelectItem key={doorType} value={doorType}>
                  {doorType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Dimensions Selection */}
      {availableDimensions.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Dimensions:
          </label>
          <Select
            value={selectedVariants.dimensions || ''}
            onValueChange={(value) => onVariantChange('dimensions', value)}
          >
            <SelectTrigger className="w-full h-10 text-sm">
              <SelectValue placeholder="Select dimensions" />
            </SelectTrigger>
            <SelectContent>
              {availableDimensions.map((dimension) => (
                <SelectItem key={dimension} value={dimension}>
                  {dimension}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Product Selection */}
      {filteredProducts.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Available Products: 
            <Badge variant="outline" className="text-sm">{filteredProducts.length}</Badge>
          </label>
          <div className="grid grid-cols-1 gap-3">
            {filteredProducts.map((product) => (
              <Button
                key={product.id}
                variant={selectedProduct?.id === product.id ? "default" : "outline"}
                className="w-full p-4 h-auto justify-start text-left"
                onClick={() => onProductSelect(product)}
              >
                <div className="flex items-center gap-3 w-full">
                  <img
                    src={product.thumbnail_path || '/placeholder.svg'}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm break-words leading-tight">
                      {product.name}
                    </div>
                    <div className="text-sm text-muted-foreground break-words">
                      {product.product_code}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No products match the selected variants</p>
        </div>
      )}
    </div>
  );
};
