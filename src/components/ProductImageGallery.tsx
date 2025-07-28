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
  showThumbnails?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images = [],
  thumbnail,
  productName,
  className = '',
  showThumbnails = true
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Build the image list (thumbnail first, then others), validate & dedupe
  const displayImages = useMemo(() => {
    const list: string[] = [];

    if (isValidImageUrl(thumbnail)) list.push(thumbnail);

    const rest = images.filter((img) => isValidImageUrl(img) && img !== thumbnail);
    list.push(...rest);

    const uniq = Array.from(new Set(list));
    return uniq.length ? uniq : ['/placeholder.svg'];
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

  const handleThumbnailClick = (index: number) => setCurrentImageIndex(index);

  return (
    <div className={`relative ${className}`}>
      {/* Main image area (dynamic height, never crop) */}
      <div
        className="
          relative w-full
          flex items-center justify-center
          rounded-lg bg-white overflow-hidden
          min-h-[240px]
          max-h-[60vh] md:max-h-[70vh] lg:max-h-[75vh]
        "
      >
        <OptimizedImage
          src={currentImage}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          className="w-auto h-auto max-w-full max-h-full object-contain"
          priority={currentImageIndex === 0}
        />

        {displayImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background shadow-lg"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && displayImages.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2 overflow-x-auto pb-2">
          {displayImages.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => handleThumbnailClick(i)}
              aria-label={`View image ${i + 1}`}
              className={`
                flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white
                ${i === currentImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-muted hover:border-muted-foreground/30'}
              `}
            >
              <OptimizedImage
                src={img}
                alt={`${productName} - Thumbnail ${i + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators (mobile) */}
      {displayImages.length > 1 && (
        <div className="flex justify-center mt-2 space-x-1 md:hidden">
          {displayImages.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to image ${i + 1}`}
              onClick={() => handleThumbnailClick(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
