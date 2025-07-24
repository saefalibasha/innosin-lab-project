
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, Package } from 'lucide-react';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface ProductStatisticsProps {
  placedProducts: PlacedProduct[];
}

interface ProductBreakdown {
  id: string;
  name: string;
  category: string;
  count: number;
  dimensions: string;
  color: string;
}

const ProductStatistics: React.FC<ProductStatisticsProps> = ({ placedProducts }) => {
  // Create detailed breakdown of placed products
  const productBreakdown = React.useMemo(() => {
    const breakdownMap = new Map<string, ProductBreakdown>();
    
    placedProducts.forEach(product => {
      const key = `${product.productId}-${product.dimensions.length}-${product.dimensions.width}`;
      
      if (breakdownMap.has(key)) {
        breakdownMap.get(key)!.count += 1;
      } else {
        breakdownMap.set(key, {
          id: product.productId,
          name: product.name,
          category: product.category || 'Other',
          count: 1,
          dimensions: `${product.dimensions.length.toFixed(1)} × ${product.dimensions.width.toFixed(1)}m`,
          color: product.color || '#6b7280'
        });
      }
    });
    
    return Array.from(breakdownMap.values()).sort((a, b) => b.count - a.count);
  }, [placedProducts]);

  // Category statistics
  const categoryStats = React.useMemo(() => {
    const categories = placedProducts.reduce((acc, product) => {
      const category = product.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).sort(([, a], [, b]) => b - a);
  }, [placedProducts]);

  const totalProducts = placedProducts.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Project Statistics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Total Products */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Products:</span>
            <Badge variant="secondary" className="text-sm">
              {totalProducts}
            </Badge>
          </div>
          
          {/* Category Breakdown */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">By Category:</span>
            {categoryStats.map(([category, count]) => (
              <div key={category} className="flex justify-between text-xs">
                <span>{category}:</span>
                <Badge variant="outline" className="text-xs h-4">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Product Breakdown */}
        {productBreakdown.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-3 w-3" />
              <span className="text-sm font-medium">Product Breakdown:</span>
            </div>
            
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {productBreakdown.map((product) => (
                  <div key={`${product.id}-${product.dimensions}`} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: product.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.dimensions}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs h-4 ml-2">
                      {product.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {totalProducts === 0 && (
          <div className="text-center py-4">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No products placed yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductStatistics;
