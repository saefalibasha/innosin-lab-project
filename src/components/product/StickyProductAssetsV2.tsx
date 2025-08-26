import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Box, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import Enhanced3DViewerV2 from '@/components/Enhanced3DViewerV2';

interface StickyProductAssetsV2Props {
  currentAssets: {
    thumbnail?: string;
    model?: string;
    images?: string[];
  } | null;
  productName: string;
  className?: string;
  productId?: string;
}

const StickyProductAssetsV2 = ({
  currentAssets,
  productName,
  className = '',
  productId
}: StickyProductAssetsV2Props) => {
  const [activeView, setActiveView] = useState<'images' | '3d'>('images');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modelError, setModelError] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Prepare image gallery
  const allImages = [
    currentAssets?.thumbnail,
    ...(currentAssets?.images || [])
  ].filter(Boolean);

  const hasModel = currentAssets?.model && currentAssets.model.trim() !== '' && !modelError;
  const hasImages = allImages.length > 0;
  const currentImage = allImages[currentImageIndex] || '';

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
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : allImages.length - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < allImages.length - 1 ? prevIndex + 1 : 0
    );
  };

  const onMissingModel = (productId: string, productName: string) => {
    console.warn(`Missing model for product ${productId}: ${productName}`);
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
      <Card className="overflow-hidden" ref={cardRef}>
        <CardContent className="p-0 relative">
          {activeView === 'images' && hasImages ? (
            <>
              <div className="relative aspect-square">
                <img
                  src={currentImage}
                  alt={`${productName} - Image ${currentImageIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: 1 }}
                />
                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                      <span className="sr-only">Previous</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                      <span className="sr-only">Next</span>
                    </Button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : activeView === '3d' && hasModel ? (
            <Enhanced3DViewerV2
              key={`viewer-${viewerKey}`}
              modelUrl={currentAssets.model}
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

export default StickyProductAssetsV2;
