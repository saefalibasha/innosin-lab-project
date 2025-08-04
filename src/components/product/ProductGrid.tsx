
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Building2 } from 'lucide-react';
import { Product } from '@/types/product';
import { OptimizedOverviewImage } from '@/components/common/OptimizedOverviewImage';

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  loading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductSelect,
  loading
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="aspect-square bg-muted rounded-lg mb-3"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.09M15 13h2m-2 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any products matching your criteria. This might be due to:
          </p>
          <ul className="text-sm text-muted-foreground text-left space-y-1">
            <li>• Database connectivity issues</li>
            <li>• No products matching the current filters</li>
            <li>• Products may need to be activated in the admin panel</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Check the browser console for detailed debugging information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
              <OptimizedOverviewImage
                src={product.seriesOverviewImage || product.overviewImage || product.thumbnail || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
                showCompanyTag={false}
              />
            </div>
            
            {/* Company Tags - Display prominently in blue */}
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
            
            <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
            <CardDescription className="text-sm">
              {product.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
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
            </div>
            
            <Button 
              onClick={() => onProductSelect(product)}
              className="w-full mt-4 group-hover:shadow-md transition-shadow"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
