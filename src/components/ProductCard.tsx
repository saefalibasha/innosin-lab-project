
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import LazyProductImage from './LazyProductImage';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onAddToQuote?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToQuote
}) => {
  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToQuote) {
      onAddToQuote(product);
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background border">
      <Link to={`/products/${product.id}`} className="block">
        <CardHeader className="p-0">
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <LazyProductImage
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
            >
              {product.category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="text-sm text-muted-foreground">
            {product.dimensions}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            asChild
          >
            <span>View Details</span>
          </Button>
          {onAddToQuote && (
            <Button 
              onClick={handleAddToQuote}
              className="flex-1 bg-sea hover:bg-sea-dark"
            >
              Add to Quote
            </Button>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
};

export default ProductCard;
