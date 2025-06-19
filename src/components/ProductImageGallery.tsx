
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize, Image } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  thumbnail: string;
  productName: string;
  className?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  thumbnail,
  productName,
  className = "w-full h-48"
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // Use thumbnail as fallback if no images or if main image fails
  const displayImages = images.length > 0 ? images : [thumbnail];
  const currentImage = displayImages[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`${className} relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden`}>
      {!imageError ? (
        <img
          src={currentImage}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <Image className="w-12 h-12" />
        </div>
      )}
      
      {/* Navigation arrows for multiple images */}
      {displayImages.length > 1 && !imageError && (
        <>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={prevImage}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={nextImage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          {/* Image indicator dots */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {displayImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
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
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-serif">{productName} - Gallery</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {!imageError ? (
              <img
                src={currentImage}
                alt={`${productName} - Full size`}
                className="w-full h-96 object-contain"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-muted-foreground bg-gray-100 rounded">
                <Image className="w-16 h-16" />
              </div>
            )}
            
            {displayImages.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {displayImages.map((img, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-sea' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={img}
                      alt={`${productName} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
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
