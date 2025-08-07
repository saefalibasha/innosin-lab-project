
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface DatabaseVariant {
  id: string;
  product_code: string;
  name: string;
  category: string;
  dimensions?: string;
  door_type?: string;
  orientation?: string;
  finish_type?: string;
  mounting_type?: string;
  mixing_type?: string;
  handle_type?: string;
  emergency_shower_type?: string;
  drawer_count?: number;
  description?: string;
  thumbnail_path?: string;
  model_path?: string;
  is_active: boolean;
}

interface ProductSeries {
  id: string;
  name: string;
  variants: DatabaseVariant[];
}

interface VariantManagerProps {
  open: boolean;
  onClose: () => void;
  series: ProductSeries;
  onVariantsUpdated: () => void;
}

const VariantManager: React.FC<VariantManagerProps> = ({
  open,
  onClose,
  series,
  onVariantsUpdated
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Variants - {series.name}</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground">
              Variant management for {series.name} with {series.variants.length} variants.
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default VariantManager;
