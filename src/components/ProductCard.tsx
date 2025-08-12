
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onViewDetails?: () => void;
  className?: string;
  variant?: 'default' | 'series';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewDetails, 
  className = '',
  variant = 'default'
}) => {
  const isSeriesVariant = variant === 'series';
  
  // Truncate description for series variant
  const getDescription = () => {
    if (!product.description) return '';
    if (isSeriesVariant) {
      return product.description.length > 80 
        ? product.description.substring(0, 80) + '...'
        : product.description;
    }
    return product.description;
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-0">
        {/* Image Container */}
        <div className={`relative overflow-hidden ${
          isSeriesVariant ? 'h-48' : 'h-64'
        } bg-gray-50 rounded-t-lg`}>
          {product.thumbnail || product.seriesOverviewImage ? (
            <img 
              src={product.thumbnail || product.seriesOverviewImage || '/placeholder-image.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-700">
              {product.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className={isSeriesVariant ? 'p-4' : 'p-6'}>
          <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${
            isSeriesVariant ? 'text-lg' : 'text-xl'
          }`}>
            {product.name}
          </h3>
          
          <p className={`text-gray-600 mb-4 line-clamp-2 ${
            isSeriesVariant ? 'text-sm' : 'text-base'
          }`}>
            {getDescription()}
          </p>

          {/* Specifications */}
          {product.dimensions && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">Dimensions: </span>
              <span className="text-sm font-medium text-gray-700">{product.dimensions}</span>
            </div>
          )}

          {/* Action Button */}
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-blue-50 group-hover:border-blue-200"
            onClick={onViewDetails}
            size={isSeriesVariant ? 'sm' : 'default'}
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
