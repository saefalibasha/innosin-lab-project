
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface ProductAssetModalProps {
  open: boolean;
  onClose: () => void;
  productId?: string;
}

const ProductAssetModal: React.FC<ProductAssetModalProps> = ({
  open,
  onClose,
  productId
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Product Asset Manager</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground">
              Asset management for product {productId}
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAssetModal;
