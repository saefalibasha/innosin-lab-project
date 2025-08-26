
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Enhanced3DViewerV2 from '@/components/Enhanced3DViewerV2';

interface ProductAssetViewerV2Props {
  product: {
    id: string;
    name: string;
    model_path?: string;
    thumbnail_path?: string;
    overview_image_path?: string;
  };
  onMissingModel?: (modelPath: string, productId: string) => void;
}

const ProductAssetViewerV2 = ({ product, onMissingModel }: ProductAssetViewerV2Props) => {
  const modelPath = product.model_path;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <div className="space-y-6">
      {/* 3D Model Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>3D Model</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            {modelPath ? (
              <Enhanced3DViewerV2
                modelUrl={modelPath}
                productId={product.id}
                className="w-full h-full"
                onMissingModel={onMissingModel}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No 3D model available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2D Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thumbnail */}
        <Card>
          <CardHeader>
            <CardTitle>Thumbnail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {product.thumbnail_path ? (
                <img
                  src={product.thumbnail_path}
                  alt={`${product.name} thumbnail`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No thumbnail available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overview Image */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {product.overview_image_path ? (
                <img
                  src={product.overview_image_path}
                  alt={`${product.name} overview`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No overview image available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductAssetViewerV2;
