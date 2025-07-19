
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Package, Ruler } from 'lucide-react';

interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string;
  product_series: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  dimensions: string;
  editable_title: string;
  editable_description: string;
  is_active: boolean;
}

interface ProductVariantCardProps {
  product: Product;
  onSelect: () => void;
}

export const ProductVariantCard: React.FC<ProductVariantCardProps> = ({
  product,
  onSelect
}) => {
  const isKneeSpace = product.product_series?.includes('Knee Space');
  
  // Get finish label
  const getFinishLabel = (finishType: string) => {
    switch (finishType) {
      case 'PC': return 'Powder Coat';
      case 'SS': return 'Stainless Steel';
      default: return finishType;
    }
  };

  // Get variant display name for KS series
  const getDisplayName = () => {
    if (isKneeSpace && product.product_code?.startsWith('KS')) {
      return product.product_code; // Show KS700, KS750, etc.
    }
    return product.editable_title || product.name;
  };

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Name */}
          <div>
            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
              {getDisplayName()}
            </h4>
            {product.product_code && !isKneeSpace && (
              <p className="text-xs text-muted-foreground mt-1">
                Code: {product.product_code}
              </p>
            )}
          </div>

          {/* Dimensions */}
          {product.dimensions && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Ruler className="h-3 w-3" />
              <span>{product.dimensions}</span>
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            {product.finish_type && (
              <Badge 
                variant={product.finish_type === 'SS' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {product.finish_type} ({getFinishLabel(product.finish_type)})
              </Badge>
            )}
            {product.orientation && product.orientation !== 'None' && (
              <Badge variant="outline" className="text-xs">
                {product.orientation}
              </Badge>
            )}
            {product.drawer_count > 0 && (
              <Badge variant="outline" className="text-xs">
                {product.drawer_count} Drawers
              </Badge>
            )}
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
