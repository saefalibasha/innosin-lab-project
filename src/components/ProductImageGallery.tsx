
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OptimizedImage from './OptimizedImage';

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

  // Build display images prioritizing actual content over placeholders
  const displayImages = React.useMemo(() => {
    const allImages: string[] = [];
    
    // Add thumbnail if it exists and is not a placeholder
    if (thumbnail && !thumbnail.includes('placeholder')) {
      allImages.push(thumbnail);
    }
    
    // Add other images, filtering out placeholders
    const validImages = images.filter(img => img && !img.includes('placeholder') && img !== thumbnail);
    allImages.push(...validImages);
    
    // Only add placeholder if no real images exist
    if (allImages.length === 0) {
      return ['/placeholder.svg'];
    }
    
    return allImages;
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

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-muted">
        <OptimizedImage
          src={currentImage}
          alt={productName}
          className="w-full h-full object-cover"
          priority={currentImageIndex === 0}
        />
        
        {displayImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      {displayImages.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
