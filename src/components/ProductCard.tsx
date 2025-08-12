
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/products/${product.id}`);
  };

  // Use company tag (first one) or fallback to category
  const displayTag = product.company_tags && product.company_tags.length > 0 
    ? product.company_tags[0] 
    : product.category;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{displayTag}</Badge>
        </div>
        <CardTitle className="text-lg leading-tight">
          {product.editable_title || product.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {product.editable_description || product.description || 'No description available'}
        </p>
        
        <div className="space-y-2">
          {product.dimensions && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Dimensions:</span> {product.dimensions}
            </p>
          )}
          
          <Button 
            onClick={handleViewDetails}
            className="w-full"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
