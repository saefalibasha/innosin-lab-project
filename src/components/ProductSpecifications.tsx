
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/types/product';

interface ProductSpecificationsProps {
  product: Product;
}

const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  if (!product.specifications || product.specifications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {product.specifications.map((spec: any, index: number) => (
            <div key={index} className="flex justify-between border-b pb-2">
              <span className="font-medium">{spec.name || spec.key || 'Property'}:</span>
              <span className="text-muted-foreground">{spec.value || spec}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSpecifications;
