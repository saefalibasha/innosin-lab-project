
import React from 'react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { Button } from '@/components/ui/button';

interface ProductSidebarProps {
  placedProducts: PlacedProduct[];
  setPlacedProducts: React.Dispatch<React.SetStateAction<PlacedProduct[]>>;
}

export const ProductSidebar: React.FC<ProductSidebarProps> = ({
  placedProducts,
  setPlacedProducts
}) => {
  const handleRemoveProduct = (productId: string) => {
    setPlacedProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <div className="w-64 bg-white border-r p-4">
      <h2 className="text-lg font-semibold mb-4">Products</h2>
      
      <div className="space-y-2">
        {placedProducts.map(product => (
          <div key={product.id} className="p-2 border rounded">
            <div className="text-sm font-medium">{product.name}</div>
            <div className="text-xs text-gray-500">{product.category}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveProduct(product.id)}
              className="mt-2"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
