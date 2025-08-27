
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ThumbnailProductCardProps {
  product: any;
  onDragStart: (product: any) => void;
  onDragEnd: () => void;
}

export const ThumbnailProductCard: React.FC<ThumbnailProductCardProps> = ({
  product,
  onDragStart,
  onDragEnd
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(product);
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  const getImagePath = () => {
    if (product.thumbnail) return product.thumbnail;
    if (product.productId) {
      return `/products/${product.productId.toLowerCase().replace(/[^a-z0-9-]/g, '-')}/${product.productId}.jpg`;
    }
    return null;
  };

  const imagePath = getImagePath();

  return (
    <Card 
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow duration-200 bg-white border border-gray-200"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent className="p-3">
        <div className="aspect-square mb-2 bg-gray-50 rounded-md overflow-hidden relative">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
          
          {imagePath && !imageError ? (
            <img
              src={imagePath}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center p-2">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {product.category}
                </div>
                <div className="text-xs text-gray-500">
                  {product.dimensions ? 
                    `${product.dimensions.length}×${product.dimensions.width}mm` : 
                    'No image'
                  }
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-gray-900 line-clamp-2 min-h-[32px]">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            
            {product.dimensions && (
              <span className="text-xs text-gray-500">
                {product.dimensions.length}×{product.dimensions.width}
              </span>
            )}
          </div>
          
          {product.drawerCount && (
            <div className="text-xs text-blue-600 font-medium">
              {product.drawerCount} Drawers
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
