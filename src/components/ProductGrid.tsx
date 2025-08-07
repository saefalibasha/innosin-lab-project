
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center">
              {product.thumbnail || product.thumbnail_path ? (
                <img
                  src={product.thumbnail || product.thumbnail_path}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="text-muted-foreground text-sm">No Image</div>
              )}
            </div>
            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{product.category}</Badge>
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            {product.product_code && (
              <p className="text-sm text-muted-foreground">
                Code: {product.product_code}
              </p>
            )}
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            
            {product.dimensions && (
              <p className="text-sm text-muted-foreground">
                Dimensions: {product.dimensions}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
