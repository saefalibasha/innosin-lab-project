
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Box, AlertCircle } from 'lucide-react';
import Enhanced3DViewerV2 from '@/components/Enhanced3DViewerV2';
import ProductImageGalleryV2 from '@/components/ProductImageGalleryV2';

interface ProductAssetViewerV2Props {
  currentAssets: {
    thumbnail?: string;
    model?: string;
    images?: string[];
  } | null;
  productName: string;
  className?: string;
  onMissingModel?: (modelPath: string, productId?: string) => void;
  productId?: string;
}

const ProductAssetViewerV2 = ({
  currentAssets,
  productName,
  className = '',
  onMissingModel,
  productId
}: ProductAssetViewerV2Props) => {
  const [activeView, setActiveView] = useState<'images' | '3d'>('images');
  const [modelError, setModelError] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);

  // Prepare image gallery
  const allImages = [
    currentAssets?.thumbnail,
    ...(currentAssets?.images || [])
  ].filter(Boolean);

  const hasModel = currentAssets?.model && currentAssets.model.trim() !== '' && !modelError;
  const hasImages = allImages.length > 0;

  // Reset model error when assets change
  useEffect(() => {
    setModelError(false);
  }, [currentAssets?.model]);

  // Handle view switching with proper re-initialization
  const handleViewChange = (view: 'images' | '3d') => {
    setActiveView(view);
    if (view === '3d') {
      // Force re-render of 3D viewer
      setTimeout(() => {
        setViewerKey(prev => prev + 1);
      }, 100);
    }
  };

  const handleModelError = () => {
    setModelError(true);
    if (onMissingModel && currentAssets?.model) {
      onMissingModel(currentAssets.model, productId);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'images' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleViewChange('images')}
          disabled={!hasImages}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Images
          {hasImages && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {allImages.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeView === '3d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleViewChange('3d')}
          disabled={!hasModel}
          className="flex-1"
        >
          <Box className="w-4 h-4 mr-2" />
          3D Model
          {!hasModel && (
            <AlertCircle className="w-3 h-3 ml-1 text-amber-500" />
          )}
        </Button>
      </div>

      {/* Main Asset Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {activeView === 'images' && hasImages ? (
            <ProductImageGalleryV2
              images={allImages}
              thumbnail={currentAssets?.thumbnail || ''}
              productName={productName}
              className="aspect-square"
            />
          ) : activeView === '3d' && hasModel ? (
            <Enhanced3DViewerV2
              key={`viewer-${viewerKey}`}
              modelPath={currentAssets.model}
              className="aspect-square"
              onError={handleModelError}
              onMissingModel={onMissingModel}
              productId={productId}
            />
          ) : (
            <div className="aspect-square bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                {activeView === 'images' ? (
                  <>
                    <Eye className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm">No images available</p>
                  </>
                ) : (
                  <>
                    <Box className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm">
                      {modelError ? 'Model failed to load' : 'No 3D model available'}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Status */}
      <div className="flex gap-2 text-xs text-muted-foreground">
        <Badge variant={hasImages ? 'default' : 'secondary'}>
          {hasImages ? `${allImages.length} Image${allImages.length !== 1 ? 's' : ''}` : 'No Images'}
        </Badge>
        <Badge variant={hasModel ? 'default' : 'secondary'}>
          {hasModel ? '3D Model Available' : 'No 3D Model'}
        </Badge>
      </div>
    </div>
  );
};

export default ProductAssetViewerV2;
