
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  thumbnail: string;
  productName: string;
  isProductPage?: boolean;
  className?: string;
  showThumbnails?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  thumbnail,
  productName,
  isProductPage = false,
  className,
  showThumbnails = true
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Filter out placeholder images and ensure we have valid images
  const validImages = images.filter(img => img && img !== '/placeholder.svg' && !img.includes('placeholder'));
  const displayImages = validImages.length > 0 ? validImages : [thumbnail || '/placeholder.svg'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image Display */}
      <div className="relative bg-white rounded-lg border overflow-hidden group">
        <div className={cn(
          "flex items-center justify-center",
          isProductPage ? "aspect-[4/3] min-h-[400px]" : "aspect-square min-h-[300px]"
        )}>
          <img
            src={displayImages[currentImageIndex]}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
        
        {/* Navigation Arrows - only show if more than one image */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
              onClick={previousImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - only show if more than one image and showThumbnails is true */}
      {displayImages.length > 1 && showThumbnails && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                index === currentImageIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="w-full h-full flex items-center justify-center bg-white">
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
