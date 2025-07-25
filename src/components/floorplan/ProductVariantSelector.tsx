
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Eye, Download } from 'lucide-react';
import { cleanProductName } from '@/lib/productUtils';
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
  selectedProduct: Product | null;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  products,
  selectedVariants,
  onVariantChange,
  onProductSelect,
  selectedProduct
}) => {
  // Helper function to extract first numeric value from dimension string
  const extractNumericValue = (dimensions: string): number => {
    const match = dimensions.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Sort products by dimensions (length first)
  const sortedProducts = [...products].sort((a, b) => {
    if (a.dimensions && b.dimensions) {
      return extractNumericValue(a.dimensions) - extractNumericValue(b.dimensions);
    }
    return 0;
  });

  // Get unique variants for filtering
  const getUniqueVariants = (key: keyof typeof selectedVariants) => {
    const values = products.map(p => {
      switch (key) {
        case 'finish':
          return p.finish_type;
        case 'orientation':
          return p.orientation;
        case 'drawerCount':
          return p.drawer_count?.toString();
        case 'doorType':
          return p.door_type;
        case 'dimensions':
          return p.dimensions;
        default:
          return null;
      }
    }).filter(Boolean);
    return [...new Set(values)];
  };

  // Filter products based on selected variants
  const filteredProducts = sortedProducts.filter(product => {
    const matchesFinish = !selectedVariants.finish || product.finish_type === selectedVariants.finish;
    const matchesOrientation = !selectedVariants.orientation || product.orientation === selectedVariants.orientation;
    const matchesDrawerCount = !selectedVariants.drawerCount || product.drawer_count?.toString() === selectedVariants.drawerCount;
    const matchesDoorType = !selectedVariants.doorType || product.door_type === selectedVariants.doorType;
    const matchesDimensions = !selectedVariants.dimensions || product.dimensions === selectedVariants.dimensions;
    
    return matchesFinish && matchesOrientation && matchesDrawerCount && matchesDoorType && matchesDimensions;
  });

  return (
    <div className="space-y-4">
      {/* Variant filters */}
      <div className="space-y-3">
        {getUniqueVariants('finish').length > 1 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Finish</label>
            <div className="flex flex-wrap gap-2">
              {getUniqueVariants('finish').map(finish => (
                <Button
                  key={finish}
                  variant={selectedVariants.finish === finish ? "default" : "outline"}
                  size="sm"
                  onClick={() => onVariantChange('finish', finish)}
                >
                  {finish}
                </Button>
              ))}
            </div>
          </div>
        )}

        {getUniqueVariants('orientation').length > 1 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Orientation</label>
            <div className="flex flex-wrap gap-2">
              {getUniqueVariants('orientation').map(orientation => (
                <Button
                  key={orientation}
                  variant={selectedVariants.orientation === orientation ? "default" : "outline"}
                  size="sm"
                  onClick={() => onVariantChange('orientation', orientation)}
                >
                  {orientation}
                </Button>
              ))}
            </div>
          </div>
        )}

        {getUniqueVariants('drawerCount').length > 1 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Drawer Count</label>
            <div className="flex flex-wrap gap-2">
              {getUniqueVariants('drawerCount').map(count => (
                <Button
                  key={count}
                  variant={selectedVariants.drawerCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => onVariantChange('drawerCount', count)}
                >
                  {count} Drawers
                </Button>
              ))}
            </div>
          </div>
        )}

        {getUniqueVariants('doorType').length > 1 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Door Type</label>
            <div className="flex flex-wrap gap-2">
              {getUniqueVariants('doorType').map(doorType => (
                <Button
                  key={doorType}
                  variant={selectedVariants.doorType === doorType ? "default" : "outline"}
                  size="sm"
                  onClick={() => onVariantChange('doorType', doorType)}
                >
                  {doorType}
                </Button>
              ))}
            </div>
          </div>
        )}

        {getUniqueVariants('dimensions').length > 1 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Dimensions</label>
            <div className="flex flex-wrap gap-2">
              {getUniqueVariants('dimensions').map(dimensions => (
                <Button
                  key={dimensions}
                  variant={selectedVariants.dimensions === dimensions ? "default" : "outline"}
                  size="sm"
                  onClick={() => onVariantChange('dimensions', dimensions)}
                >
                  {dimensions}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedProduct?.id === product.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onProductSelect(product)}
          >
            <CardHeader className="pb-3">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {product.thumbnail_path || product.thumbnail ? (
                  <img 
                    src={product.thumbnail_path || product.thumbnail} 
                    alt={cleanProductName(product.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <CardTitle className="text-base font-medium line-clamp-2">
                {cleanProductName(product.name)}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                {product.category && (
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                )}
                
                {product.dimensions && (
                  <p className="text-sm text-gray-600">
                    <strong>Dimensions:</strong> {product.dimensions}
                  </p>
                )}
                
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products match the selected variants
        </div>
      )}
    </div>
  );
};
