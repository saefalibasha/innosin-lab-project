
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Edit, Upload, Eye, Tag } from 'lucide-react';

interface DatabaseProduct {
  id: string;
  name: string;
  product_code: string;
  category: string;
  product_series: string;
  dimensions: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  description: string;
  full_description: string;
  specifications: any;
  company_tags: string[];
  model_path?: string;
  thumbnail_path?: string;
  additional_images?: string[];
  created_at?: string;
  updated_at?: string;
  editable_title?: string;
  editable_description?: string;
  is_active: boolean;
  is_series_parent: boolean;
  parent_series_id?: string;
  series_thumbnail_path?: string;
  series_model_path?: string;
  inherits_series_assets: boolean;
}

interface ProductSeriesSectionProps {
  seriesName: string;
  products: DatabaseProduct[];
  onProductSelect: (product: DatabaseProduct) => void;
  onEditProduct: (product: DatabaseProduct) => void;
  onProductUpdated: () => void;
}

export const ProductSeriesSection: React.FC<ProductSeriesSectionProps> = ({
  seriesName,
  products,
  onProductSelect,
  onEditProduct,
  onProductUpdated
}) => {
  const getCompletionBadge = (product: DatabaseProduct) => {
    const hasAssets = product.thumbnail_path && product.model_path;
    const hasSeriesAssets = product.series_thumbnail_path && product.series_model_path;
    const isComplete = hasAssets || (product.inherits_series_assets && hasSeriesAssets);
    
    return (
      <Badge variant={isComplete ? "default" : "secondary"}>
        {isComplete ? "Complete" : "Incomplete"}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {seriesName}
          <Badge variant="outline">{products.length} products</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{product.name}</h4>
                    <p className="text-xs text-muted-foreground">{product.product_code}</p>
                  </div>
                  {getCompletionBadge(product)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1">
                  <p><strong>Category:</strong> {product.category}</p>
                  <p><strong>Dimensions:</strong> {product.dimensions || 'N/A'}</p>
                  <p><strong>Finish:</strong> {product.finish_type}</p>
                  {product.orientation !== 'None' && (
                    <p><strong>Orientation:</strong> {product.orientation}</p>
                  )}
                  {product.drawer_count > 0 && (
                    <p><strong>Drawers:</strong> {product.drawer_count}</p>
                  )}
                </div>
                
                {product.company_tags && product.company_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.company_tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditProduct(product)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProductSelect(product)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Assets
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
