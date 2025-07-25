
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';

interface ProductDragHandlerProps {
  product: Product;
  onDragStart: (product: Product) => void;
}

export const ProductDragHandler: React.FC<ProductDragHandlerProps> = ({
  product,
  onDragStart
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set drag data
    e.dataTransfer.setData('application/json', JSON.stringify(product));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Call the onDragStart callback
    onDragStart(product);
  };

  return (
    <Card
      className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow"
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-10 h-10 object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">IMG</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{product.name}</h4>
            <p className="text-xs text-gray-500 truncate">{product.category}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {product.dimensions}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDragHandler;
