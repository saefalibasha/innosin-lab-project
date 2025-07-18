
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Package2, Ruler, Settings } from 'lucide-react';

interface Product {
  id: string;
  product_code: string;
  name: string;
  product_series: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  dimensions: string;
  editable_title: string;
  editable_description: string;
}

interface ProductVariantCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductVariantCard: React.FC<ProductVariantCardProps> = ({
  product,
  onClick
}) => {
  const getOrientationDisplay = (orientation: string) => {
    if (!orientation || orientation === 'None') return null;
    return orientation;
  };

  const getConfigurationDisplay = () => {
    const parts = [];
    
    if (product.door_type && product.door_type !== 'None') {
      parts.push(product.door_type);
    }
    
    if (product.drawer_count > 0) {
      parts.push(`${product.drawer_count} Drawers`);
    }

    const orientation = getOrientationDisplay(product.orientation);
    if (orientation) {
      parts.push(orientation);
    }

    return parts.join(' • ');
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Package2 className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium text-primary">
                {product.product_code}
              </div>
            </div>
            <Badge 
              variant={product.finish_type === 'SS' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {product.finish_type}
            </Badge>
          </div>

          {/* Title */}
          <div>
            <h5 className="font-medium text-sm leading-tight">
              {product.editable_title || product.name}
            </h5>
            {product.editable_description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {product.editable_description}
              </p>
            )}
          </div>

          {/* Configuration */}
          {getConfigurationDisplay() && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Settings className="h-3 w-3" />
              <span>{getConfigurationDisplay()}</span>
            </div>
          )}

          {/* Dimensions */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Ruler className="h-3 w-3" />
            <span>{product.dimensions}</span>
          </div>

          {/* Action Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Manage Assets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
