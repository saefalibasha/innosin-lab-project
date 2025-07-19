
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Package, Tag } from 'lucide-react';

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
  company_tags: string[];
  is_active: boolean;
}

interface ProductVariantCardProps {
  product: Product;
  onSelect: () => void;
  onEdit: () => void;
}

export const ProductVariantCard: React.FC<ProductVariantCardProps> = ({
  product,
  onSelect,
  onEdit,
}) => {
  const displayTitle = product.editable_title || product.name;
  const displayDescription = product.editable_description || `${product.product_code} - ${product.dimensions || 'No dimensions'}`;

  return (
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium truncate">
                {product.product_code}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate">
                {displayTitle}
              </p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="h-6 w-6 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={onSelect}>
        <div className="space-y-2">
          {/* Dimensions */}
          {product.dimensions && (
            <div className="text-xs text-muted-foreground">
              📏 {product.dimensions}
            </div>
          )}
          
          {/* Finish & Orientation */}
          <div className="flex flex-wrap gap-1">
            {product.finish_type && (
              <Badge variant="outline" className="text-xs">
                {product.finish_type === 'PC' ? 'Powder Coat' : 
                 product.finish_type === 'SS' ? 'Stainless Steel' : 
                 product.finish_type}
              </Badge>
            )}
            {product.orientation && product.orientation !== 'None' && (
              <Badge variant="secondary" className="text-xs">
                {product.orientation}
              </Badge>
            )}
          </div>

          {/* Door Type & Drawer Count */}
          <div className="flex flex-wrap gap-1">
            {product.door_type && (
              <Badge variant="outline" className="text-xs">
                {product.door_type}
              </Badge>
            )}
            {product.drawer_count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {product.drawer_count} drawer{product.drawer_count !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Company Tags */}
          {product.company_tags && product.company_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {product.company_tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.company_tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.company_tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {displayDescription}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
