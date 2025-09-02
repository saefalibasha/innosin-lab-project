
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  drawerCount?: number;
  configuration?: string;
  artNumber: string;
  price?: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  series: string;
  variants: ProductVariant[];
  imageUrl: string;
  description?: string;
}

interface ProductVariantSelectorProps {
  product: Product;
  onVariantSelect: (product: Product, variant: ProductVariant) => void;
  onProductDrag: (productWithVariant: any) => void;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  onVariantSelect,
  onProductDrag
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    onVariantSelect(product, variant);
  };

  const handleDragStart = (e: React.DragEvent) => {
    const productWithVariant = {
      ...product,
      ...selectedVariant,
      originalId: product.id,
      variantId: selectedVariant.id,
      dimensions: selectedVariant.dimensions,
      drawerCount: selectedVariant.drawerCount,
      configuration: selectedVariant.configuration,
      artNumber: selectedVariant.artNumber
    };
    
    onProductDrag(productWithVariant);
    e.dataTransfer.setData('application/json', JSON.stringify(productWithVariant));
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{product.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Product Image */}
        <div 
          className="relative mb-3 cursor-move border-2 border-dashed border-gray-200 rounded-lg p-2 hover:border-blue-400 transition-colors"
          draggable
          onDragStart={handleDragStart}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-24 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-product.png';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-50 rounded-lg transition-opacity">
            <span className="text-white text-xs font-medium">Drag to place</span>
          </div>
        </div>

        {/* Selected Variant Info */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Selected:</span>
            <Badge variant="outline" className="text-xs">
              {selectedVariant.name}
            </Badge>
          </div>
          
          <div className="text-xs text-gray-600">
            <div>Dimensions: {selectedVariant.dimensions.length} × {selectedVariant.dimensions.width} × {selectedVariant.dimensions.height}mm</div>
            <div>Art#: {selectedVariant.artNumber}</div>
            {selectedVariant.drawerCount && (
              <div>Drawers: {selectedVariant.drawerCount}</div>
            )}
            {selectedVariant.configuration && (
              <div>Config: {selectedVariant.configuration}</div>
            )}
          </div>
        </div>

        {/* Variant Options */}
        {isExpanded && product.variants.length > 1 && (
          <div className="space-y-2 border-t pt-3">
            <span className="text-xs font-medium text-gray-700">Available Variants:</span>
            <div className="grid gap-2">
              {product.variants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariant.id === variant.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVariantChange(variant)}
                  className="w-full justify-start text-xs h-auto py-2"
                >
                  <div className="text-left">
                    <div className="font-medium">{variant.name}</div>
                    <div className="text-xs opacity-70">
                      {variant.dimensions.length}×{variant.dimensions.width}mm
                      {variant.drawerCount && ` • ${variant.drawerCount} drawers`}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-7"
            onClick={() => {
              const productWithVariant = {
                ...product,
                ...selectedVariant,
                originalId: product.id,
                variantId: selectedVariant.id,
                dimensions: selectedVariant.dimensions
              };
              onProductDrag(productWithVariant);
            }}
          >
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVariantSelector;
