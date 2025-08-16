
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import ProductImageGallery from '@/components/ProductImageGallery';
import Enhanced3DViewer from '@/components/Enhanced3DViewer';
import { AlertTriangle } from 'lucide-react';

interface StickyProductAssetsProps {
  product: Product | null;
  className?: string;
}

export const StickyProductAssets: React.FC<StickyProductAssetsProps> = ({
  product,
  className = ''
}) => {
  if (!product) {
    return (
      <div className={`${className} bg-muted/20 rounded-lg p-8 text-center`}>
        <div className="text-muted-foreground">No product selected</div>
      </div>
    );
  }

  const hasImage = product.thumbnail || product.thumbnail_path;
  const hasModel = product.modelPath || product.model_path;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Product Images */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Product Images</h3>
            {!hasImage && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Missing Image
              </Badge>
            )}
          </div>
          
          {hasImage ? (
            <ProductImageGallery
              thumbnail={product.thumbnail || product.thumbnail_path || ''}
              images={product.images || []}
              productName={product.name}
            />
          ) : (
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Product image not available</p>
                <p className="text-xs">Upload required in admin panel</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3D Model */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">3D Model</h3>
            {!hasModel && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Missing Model
              </Badge>
            )}
          </div>
          
          {hasModel ? (
            <Enhanced3DViewer
              modelPath={product.modelPath || product.model_path || ''}
              className="w-full h-64"
            />
          ) : (
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">3D model not available</p>
                <p className="text-xs">Upload required in admin panel</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Product Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product Code:</span>
              <span className="font-medium">{product.product_code || 'N/A'}</span>
            </div>
            {product.dimensions && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span>{product.dimensions}</span>
              </div>
            )}
            {product.finish_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finish:</span>
                <span>{product.finish_type}</span>
              </div>
            )}
            {product.orientation && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orientation:</span>
                <span>{product.orientation}</span>
              </div>
            )}
            {product.drawer_count && product.drawer_count > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Drawers:</span>
                <span>{product.drawer_count}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
