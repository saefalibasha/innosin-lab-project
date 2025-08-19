
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2, Eye, Box } from 'lucide-react';
import Enhanced3DViewer from '@/components/Enhanced3DViewer';

interface ProductAssetViewerProps {
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

const ProductAssetViewer = ({
  currentAssets,
  productName,
  className = '',
  onMissingModel,
  productId
}: ProductAssetViewerProps) => {
  const [activeView, setActiveView] = useState<'images' | '3d'>('images');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Prepare image gallery
  const allImages = [
    currentAssets?.thumbnail,
    ...(currentAssets?.images || [])
  ].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const hasModel = currentAssets?.model && currentAssets.model.trim() !== '';
  const hasImages = allImages.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'images' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('images')}
          disabled={!hasImages}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Images
        </Button>
        <Button
          variant={activeView === '3d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('3d')}
          disabled={!hasModel}
          className="flex-1"
        >
          <Box className="w-4 h-4 mr-2" />
          3D Model
        </Button>
      </div>

      {/* Main Asset Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {activeView === 'images' && hasImages ? (
            <div className="relative aspect-square bg-muted">
              <img
                src={allImages[currentImageIndex]}
                alt={`${productName} - View ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              
              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"  
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {/* Image Counter */}
                  <Badge className="absolute bottom-4 right-4">
                    {currentImageIndex + 1} / {allImages.length}
                  </Badge>
                </>
              )}
              
              {/* Zoom Button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 opacity-80 hover:opacity-100"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          ) : activeView === '3d' && hasModel ? (
            <div className="aspect-square">
              <Enhanced3DViewer
                modelPath={currentAssets.model}
                className="w-full h-full"
                onMissingModel={onMissingModel}
                productId={productId}
              />
            </div>
          ) : (
            <div className="aspect-square bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Box className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm">
                  {activeView === 'images' ? 'No images available' : 'No 3D model available'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thumbnail Strip for Images */}
      {activeView === 'images' && allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                index === currentImageIndex 
                  ? 'border-primary' 
                  : 'border-muted hover:border-muted-foreground'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Asset Status */}
      <div className="flex gap-2 text-xs text-muted-foreground">
        <Badge variant={hasImages ? 'default' : 'secondary'}>
          {hasImages ? `${allImages.length} Image${allImages.length !== 1 ? 's' : ''}` : 'No Images'}
        </Badge>
        <Badge variant={hasModel ? 'default' : 'secondary'}>
          {hasModel ? '3D Model' : 'No 3D Model'}
        </Badge>
      </div>
    </div>
  );
};

export default ProductAssetViewer;
