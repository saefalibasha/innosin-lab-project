
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product } from '@/types/product';

interface ProductVariantSelectorProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onVariantSelect: (variant?: Product) => void;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  isOpen,
  onClose,
  onVariantSelect,
}) => {
  if (!product) return null;

  const handleVariantSelect = (selectedProduct: Product) => {
    onVariantSelect(selectedProduct);
    onClose();
  };

  // For now, we'll show the current product as the only variant
  // This can be expanded later when we have actual variant data
  const variants = [product];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Product Variant</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {variants.map((variant, index) => (
              <div
                key={variant.id || index}
                className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                onClick={() => handleVariantSelect(variant)}
              >
                <div className="aspect-square bg-white rounded overflow-hidden flex items-center justify-center mb-3">
                  <img
                    src={variant.thumbnail || '/placeholder-product.png'}
                    alt={variant.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.png';
                    }}
                  />
                </div>
                
                <h4 className="font-medium text-sm mb-2">{variant.name}</h4>
                
                {variant.dimensions && (
                  <p className="text-xs text-muted-foreground mb-1">
                    Dimensions: {variant.dimensions}
                  </p>
                )}
                
                {variant.product_code && (
                  <p className="text-xs text-muted-foreground mb-1">
                    Code: {variant.product_code}
                  </p>
                )}
                
                {variant.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {variant.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductVariantSelector;
