
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize, Image } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  thumbnail: string;
  productName: string;
  className?: string;
  overviewImage?: string;
  seriesOverviewImage?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  thumbnail,
  productName,
  className = "w-full h-48",
  overviewImage,
  seriesOverviewImage
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  console.log('🔍 ProductImageGallery rendering for:', productName);
  console.log('🔍 Thumbnail path:', thumbnail);
  console.log('🔍 Additional images:', images);
  console.log('🔍 Overview image:', overviewImage);
  console.log('🔍 Series overview image:', seriesOverviewImage);
  
  // Build display images with priority: series overview > overview > additional images > thumbnail
  const buildDisplayImages = () => {
    const displayImages = [];
    
    // Priority 1: Series overview image
    if (seriesOverviewImage) {
      displayImages.push(seriesOverviewImage);
    }
    
    // Priority 2: Overview image (if different from series overview)
    if (overviewImage && overviewImage !== seriesOverviewImage) {
      displayImages.push(overviewImage);
    }
    
    // Priority 3: Additional images
    if (images && images.length > 0) {
      images.forEach(img => {
        if (img && img !== seriesOverviewImage && img !== overviewImage && img !== thumbnail) {
          displayImages.push(img);
        }
      });
    }
    
    // Priority 4: Thumbnail (if not already included)
    if (thumbnail && !displayImages.includes(thumbnail)) {
      displayImages.push(thumbnail);
    }
    
    return displayImages.filter(Boolean);
  };

  const displayImages = buildDisplayImages();
  const currentImage = displayImages[currentImageIndex] || thumbnail;

  console.log('🔍 Final display images:', displayImages);
  console.log('🔍 Current image to display:', currentImage);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleImageError = () => {
    console.warn('❌ Image failed to load:', currentImage);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', currentImage);
    setImageError(false);
  };

  return (
    <div className={`${className} relative bg-white rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center`}>
      {!imageError && currentImage ? (
        <img
          src={currentImage}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          className="max-w-full max-h-full object-contain drop-shadow-sm"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gray-50">
          <Image className="w-12 h-12 mb-2" />
          <span className="text-xs">Image not found</span>
          {currentImage && (
            <span className="text-xs mt-1 px-2 text-center break-all">{currentImage}</span>
          )}
        </div>
      )}
      
      {/* Navigation arrows for multiple images */}
      {displayImages.length > 1 && !imageError && (
        <>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-md border border-gray-200"
            onClick={prevImage}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/95 hover:bg-white shadow-md border border-gray-200"
            onClick={nextImage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          {/* Image indicator dots */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {displayImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors shadow-sm ${
                  index === currentImageIndex ? 'bg-sea' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Fullscreen view button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 bg-white/95 hover:bg-white shadow-md border border-gray-200"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-serif">{productName} - Gallery</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {!imageError && currentImage ? (
              <div className="w-full h-96 bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                <img
                  src={currentImage}
                  alt={`${productName} - Full size`}
                  className="max-w-full max-h-full object-contain drop-shadow-sm"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>
            ) : (
              <div className="w-full h-96 flex flex-col items-center justify-center text-muted-foreground bg-gray-50 rounded border border-gray-100">
                <Image className="w-16 h-16 mb-2" />
                <span>Image not available</span>
                {currentImage && (
                  <span className="text-sm mt-1 px-4 text-center break-all">{currentImage}</span>
                )}
              </div>
            )}
            
            {displayImages.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-sea' : 'border-gray-200'
                    } bg-white flex items-center justify-center`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={img}
                      alt={`${productName} thumbnail ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImageGallery;
