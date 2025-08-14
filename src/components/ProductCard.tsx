
import React, { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Package, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';
import OptimizedImage from '@/components/OptimizedImage';

interface ProductCardProps {
  product: Product;
  variant?: 'series' | 'product';
  onView?: (product: Product) => void;
  priority?: boolean;
}

const ProductCard = memo(({ 
  product, 
  variant = 'product', 
  onView, 
  priority = false 
}: ProductCardProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView(product);
    } else if (variant === 'series') {
      navigate(`/series/${product.id}`);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const imageUrl = variant === 'series' 
    ? (product.seriesOverviewImage || product.overviewImage || product.thumbnail)
    : product.thumbnail;

  const displayName = product.editable_title || product.name;
  const displayDescription = product.editable_description || product.description;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gradient-to-br from-muted/50 to-muted">
          <OptimizedImage
            src={imageUrl || '/placeholder.svg'}
            alt={displayName}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            fallback="/placeholder.svg"
            priority={priority}
          />
          <div className="absolute top-4 left-4">
            <Badge variant={variant === 'series' ? 'default' : 'secondary'} className="text-xs">
              {variant === 'series' ? (
                <>
                  <Package className="w-3 h-3 mr-1" />
                  Series
                </>
              ) : 'Product'}
            </Badge>
          </div>
          {product.company_tags && product.company_tags.length > 0 && (
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                {product.company_tags[0]}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {displayName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {product.category}
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {displayDescription || 'No description available'}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>{product.dimensions || 'Dimensions TBD'}</span>
            </div>
            
            <Button 
              size="sm" 
              onClick={handleView}
              className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View {variant === 'series' ? 'Series' : 'Details'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
