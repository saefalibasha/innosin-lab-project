
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Tag } from 'lucide-react';

interface DatabaseProduct {
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
  editable_title?: string;
  editable_description?: string;
  company_tags: string[];
  is_active: boolean;
}

interface ProductVariantCardProps {
  product: DatabaseProduct;
  onSelect: () => void;
  onEdit: () => void;
}

export const ProductVariantCard: React.FC<ProductVariantCardProps> = ({
  product,
  onSelect,
  onEdit,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-2">
                {product.editable_title || product.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {product.product_code}
              </p>
            </div>
            <Badge 
              variant={product.is_active ? "default" : "secondary"}
              className="text-xs"
            >
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Finish:</span>
              <span className="font-medium">{product.finish_type}</span>
            </div>
            
            {product.orientation && product.orientation !== 'None' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Orientation:</span>
                <span className="font-medium">{product.orientation}</span>
              </div>
            )}
            
            {product.dimensions && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium">{product.dimensions}</span>
              </div>
            )}

            {product.drawer_count > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Drawers:</span>
                <span className="font-medium">{product.drawer_count}</span>
              </div>
            )}
          </div>

          {product.company_tags && product.company_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.company_tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs flex items-center gap-1">
                  <Tag className="h-2 w-2" />
                  {tag}
                </Badge>
              ))}
              {product.company_tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{product.company_tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelect}
              className="flex-1 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
