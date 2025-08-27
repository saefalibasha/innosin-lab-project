
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Layers } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  drawerCount?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  thumbnail?: string;
}

interface ProductVariantSelectorProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onVariantSelect: (variant: any) => void;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  isOpen,
  onClose,
  onVariantSelect
}) => {
  if (!product) return null;

  const handleVariantSelect = (variant: ProductVariant) => {
    const selectedVariant = {
      ...product,
      id: variant.id,
      productId: variant.id.toUpperCase(),
      name: `${product.name} - ${variant.name}`,
      drawerCount: variant.drawerCount,
      dimensions: variant.dimensions || product.dimensions,
      thumbnail: variant.thumbnail || product.thumbnail
    };
    
    onVariantSelect(selectedVariant);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select {product.name} Variant
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Choose from available configurations and drawer options:
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {product.variants?.map((variant: ProductVariant) => (
              <Card 
                key={variant.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                onClick={() => handleVariantSelect(variant)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1">{variant.name}</h3>
                      
                      {variant.drawerCount && (
                        <div className="flex items-center gap-1 mb-2">
                          <Layers className="h-3 w-3 text-blue-600" />
                          <Badge variant="secondary" className="text-xs">
                            {variant.drawerCount}
                          </Badge>
                        </div>
                      )}
                      
                      {variant.dimensions && (
                        <div className="text-xs text-gray-500">
                          {variant.dimensions.length} × {variant.dimensions.width} × {variant.dimensions.height}mm
                        </div>
                      )}
                    </div>
                    
                    {variant.thumbnail && (
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden ml-2">
                        <img 
                          src={variant.thumbnail} 
                          alt={variant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVariantSelect(variant);
                    }}
                  >
                    Select This Variant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductVariantSelector;
