import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OptimizedImage from './OptimizedImage';
import { isValidImageUrl } from '@/utils/assetValidator';

interface ProductImageGalleryProps {
  images: string[];
  thumbnail: string;
  productName: string;
  className?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images = [],
  thumbnail,
  productName,
  className = ''
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Build display images with better validation
  const displayImages = useMemo(() => {
    const allImages: string[] = [];

    if (isValidImageUrl(thumbnail)) {
      allImages.push(thumbnail);
    }

    const validImages = images.filter(
      (img) => isValidImageUrl(img) && img !== thumbnail
    );
    allImages.push(...validImages);

    return allImages.length > 0 ? allImages : ['/placeholder.svg'];
  }, [images, thumbnail]);

  const currentImage = displayImages[currentImageIndex] || '/placeholder.svg';

  const handlePrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main image display */}
      <div className="relative w-full h-64 md:h-72 lg:h-80 overflow-hidden rounded-lg bg-white flex items-center justify-center">
        <OptimizedImage
          src={currentImage}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-contain"
          priority={currentImageIndex === 0}
        />

        {displayImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail navigation */}
      {displayImages.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white ${
                index === currentImageIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-muted hover:border-muted-foreground/30'
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1}`}
            >
              <OptimizedImage
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators for mobile */}
      {displayImages.length > 1 && (
        <div className="flex justify-center mt-2 space-x-1 md:hidden">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30'
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
