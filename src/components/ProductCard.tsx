
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Building2 } from 'lucide-react';
import { Product } from '@/types/product';
import { LazyImage } from '@/components/LazyImage';

interface ProductCardProps {
  product: Product;
  variant?: 'product' | 'series';
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'product',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (variant === 'series') {
      navigate(`/products/${product.id}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  // Get the best available image
  const getImageSrc = () => {
    if (variant === 'series') {
      return product.seriesOverviewImage || 
             product.thumbnail || 
             product.overviewImage || 
             '/placeholder.svg';
    }
    return product.overviewImage || 
           product.thumbnail || 
           product.seriesOverviewImage || 
           '/placeholder.svg';
  };

  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
          <LazyImage
            src={getImageSrc()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            fallback="/placeholder.svg"
            placeholder="/placeholder.svg"
          />
        </div>
        
        {/* Company Tags */}
        {product.company_tags && product.company_tags.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {product.company_tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="default" 
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {product.name}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          {product.dimensions && (
            <div className="text-sm text-muted-foreground">
              <strong>Dimensions:</strong> {product.dimensions}
            </div>
          )}
          {product.product_code && (
            <div className="text-sm text-muted-foreground">
              <strong>Product Code:</strong> {product.product_code}
            </div>
          )}
          {variant === 'series' && product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={handleViewDetails}
          className="w-full group-hover:shadow-md transition-shadow duration-200"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
