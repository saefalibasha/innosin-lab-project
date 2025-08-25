
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Box, AlertCircle } from 'lucide-react';
import Enhanced3DViewerV2 from '@/components/Enhanced3DViewerV2';
import ProductImageGalleryV2 from '@/components/ProductImageGalleryV2';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StickyProductAssetsV2Props {
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

const StickyProductAssetsV2 = ({
  currentAssets,
  productName,
  className = '',
  onMissingModel,
  productId
}: StickyProductAssetsV2Props) => {
  const [activeTab, setActiveTab] = useState('photos');
  const [modelError, setModelError] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [model3DKey, setModel3DKey] = useState(0); // Key to force re-render
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 300;
      setIsSticky(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset model error when assets change
  useEffect(() => {
    setModelError(false);
    // Force re-render of 3D model component when switching back to it
    if (activeTab === '3d') {
      setModel3DKey(prev => prev + 1);
    }
  }, [currentAssets?.model, activeTab]);

  // Handle tab switching with proper 3D model initialization
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Force re-render of 3D model when switching to 3D tab
    if (value === '3d') {
      setTimeout(() => {
        setModel3DKey(prev => prev + 1);
      }, 100);
    }
  };

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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted">
            <TabsTrigger 
              value="photos" 
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background"
            >
              <Camera className="w-4 h-4" />
              Photos
              {hasImages && (
                <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {getDisplayImages().length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="3d" 
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background"
            >
              <Box className="w-4 h-4" />
              3D Model
              {!hasModel && (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
            </TabsTrigger>
          </TabsList>

          <div ref={tabContentRef}>
            <TabsContent value="photos" className="mt-0">
              <div className="rounded-xl overflow-hidden border shadow-sm bg-background">
                {hasImages ? (
                  <ProductImageGalleryV2
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
              <div className="rounded-xl overflow-hidden border shadow-sm bg-background">
                {hasModel ? (
                  <Enhanced3DViewerV2
                    key={`model-${model3DKey}`} // Force re-render
                    modelPath={currentAssets.model}
                    className="w-full h-96 lg:h-[500px]"
                    onError={handleModelError}
                    onMissingModel={onMissingModel}
                    productId={productId}
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
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default StickyProductAssetsV2;
