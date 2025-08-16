
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Box, AlertCircle } from 'lucide-react';
import Enhanced3DViewer from '@/components/Enhanced3DViewer';
import ProductImageGallery from '@/components/ProductImageGallery';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StickyProductAssetsProps {
  currentAssets: {
    thumbnail?: string;
    model?: string;
    images?: string[];
  } | null;
  productName: string;
  className?: string;
  onMissingModel?: (productId: string, productName: string) => void;
  productId?: string;
}

const StickyProductAssets = ({
  currentAssets,
  productName,
  className = '',
  onMissingModel,
  productId
}: StickyProductAssetsProps) => {
  const [activeTab, setActiveTab] = useState('photos');
  const [modelError, setModelError] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 300; // Adjust based on when you want it to become sticky
      setIsSticky(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setModelError(false);
  }, [currentAssets?.model]);

  const handleModelError = () => {
    setModelError(true);
    if (onMissingModel && productId) {
      onMissingModel(productId, productName);
    }
  };

  const getDisplayImages = () => {
    if (currentAssets?.images && currentAssets.images.length > 0) {
      return currentAssets.images;
    }
    if (currentAssets?.thumbnail) {
      return [currentAssets.thumbnail];
    }
    return [];
  };

  const hasModel = currentAssets?.model && !modelError;
  const hasImages = getDisplayImages().length > 0;

  return (
    <div className={`${className} transition-all duration-300`}>
      <div className={`${isSticky ? 'sticky top-20 z-10' : ''}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
            <TabsTrigger value="photos" className="flex items-center gap-2 text-sm font-medium">
              <Camera className="w-4 h-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-2 text-sm font-medium">
              <Box className="w-4 h-4" />
              3D Model
              {!hasModel && (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="mt-0">
            <div className="rounded-xl overflow-hidden border shadow-sm">
              {hasImages ? (
                <ProductImageGallery
                  images={getDisplayImages()}
                  thumbnail={currentAssets?.thumbnail || ''}
                  productName={productName}
                  className="w-full h-96 lg:h-[500px]"
                />
              ) : (
                <div className="w-full h-96 lg:h-[500px] bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="3d" className="mt-0">
            <div className="rounded-xl overflow-hidden border shadow-sm">
              {hasModel ? (
                <Enhanced3DViewer
                  modelPath={currentAssets.model}
                  className="w-full h-96 lg:h-[500px]"
                  onError={handleModelError}
                />
              ) : (
                <div className="w-full h-96 lg:h-[500px] bg-muted flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <Box className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">3D model not available</p>
                    {modelError && (
                      <Alert className="text-left">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Model failed to load. This has been logged for review.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StickyProductAssets;
