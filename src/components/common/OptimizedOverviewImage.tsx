
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedOverviewImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  companyTags?: string[];
  showCompanyTag?: boolean;
}

export const OptimizedOverviewImage: React.FC<OptimizedOverviewImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  companyTags,
  showCompanyTag = true
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {/* Optimized Image Container */}
      <div className={cn(
        "relative overflow-hidden rounded-lg bg-muted",
        "h-32 w-full", // Fixed smaller height
        className
      )}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-muted-foreground/20 w-full h-full rounded-lg" />
          </div>
        )}
        <img
          src={imgSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
      </div>

      {/* Company Tag Overlay */}
      {showCompanyTag && companyTags && companyTags.length > 0 && (
        <div className="absolute top-2 left-2">
          <div className="bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 border shadow-sm">
            <span className="text-xs font-medium text-foreground">
              {companyTags[0]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
