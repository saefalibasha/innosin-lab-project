
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductImageGalleryV2Props {
  images: string[];
  thumbnail?: string;
  productName: string;
  className?: string;
}

const ProductImageGalleryV2: React.FC<ProductImageGalleryV2Props> = ({
  images,
  thumbnail,
  productName,
  className = ''
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState<Set<number>>(new Set());
  const [imageLoaded, setImageLoaded] = useState<Set<number>>(new Set());

  // Prepare all images (thumbnail first, then additional images)
  const allImages = React.useMemo(() => {
    const imageSet = new Set<string>();
    
    // Add thumbnail first if it exists
    if (thumbnail) {
      imageSet.add(thumbnail);
    }
    
    // Add other images
    images.forEach(img => {
      if (img && img !== thumbnail) {
        imageSet.add(img);
      }
    });
    
    return Array.from(imageSet);
  }, [images, thumbnail]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleImageError = (index: number) => {
    setImageError(prev => new Set([...prev, index]));
  };

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => new Set([...prev, index]));
  };

  const handleFullscreen = () => {
    const currentImage = allImages[currentImageIndex];
    if (currentImage) {
      window.open(currentImage, '_blank');
    }
  };

  // Reset current index if it exceeds available images
  useEffect(() => {
    if (currentImageIndex >= allImages.length && allImages.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [allImages.length, currentImageIndex]);

  if (allImages.length === 0) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = allImages[currentImageIndex];
  const hasError = imageError.has(currentImageIndex);
  const isLoaded = imageLoaded.has(currentImageIndex);

  return (
    <div className={`relative bg-muted overflow-hidden ${className}`}>
      {/* Main Image Display */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {!hasError ? (
          <>
            <img
              src={currentImage}
              alt={`${productName} - View ${currentImageIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onError={() => handleImageError(currentImageIndex)}
              onLoad={() => handleImageLoad(currentImageIndex)}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto'
              }}
            />
            
            {/* Loading indicator */}
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Failed to load image</p>
          </div>
        )}
        
        {/* Navigation Controls */}
        {allImages.length > 1 && !hasError && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
        
        {/* Image Counter */}
        {allImages.length > 1 && (
          <Badge className="absolute bottom-4 right-4">
            {currentImageIndex + 1} / {allImages.length}
          </Badge>
        )}
        
        {/* Fullscreen Button */}
        {!hasError && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 opacity-80 hover:opacity-100 transition-opacity"
            onClick={handleFullscreen}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Thumbnail Strip */}
      {allImages.length > 1 && (
        <div className="absolute bottom-4 left-4 flex gap-2 max-w-[calc(100%-8rem)] overflow-x-auto">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                index === currentImageIndex 
                  ? 'border-primary shadow-lg' 
                  : 'border-muted-foreground/20 hover:border-muted-foreground/50'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGalleryV2;
