
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product as ProductType } from '@/types/product';

interface ProductAssetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductType | null;
}

const ProductAssetModal: React.FC<ProductAssetModalProps> = ({
  isOpen,
  onOpenChange,
  product
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Product Code</h4>
            <p className="text-sm text-muted-foreground">{product.product_code}</p>
          </div>
          <div>
            <h4 className="font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAssetModal;
