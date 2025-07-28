
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OptimizedOverviewImageProps {
  src: string;
  alt: string;
  className?: string;
  showCompanyTag?: boolean;
  companyTag?: string;
}

export const OptimizedOverviewImage: React.FC<OptimizedOverviewImageProps> = ({
  src,
  alt,
  className,
  showCompanyTag = true,
  companyTag
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {/* Fixed aspect ratio container */}
      <div className="aspect-square w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="animate-pulse bg-muted-foreground/20 rounded-full w-8 h-8"></div>
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground text-xs">
              <div className="w-8 h-8 mx-auto mb-2 bg-muted-foreground/20 rounded"></div>
              Image not available
            </div>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              isLoading ? "opacity-0" : "opacity-100"
            )}
          />
        )}
      </div>

      {/* Company tag overlay */}
      {showCompanyTag && companyTag && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur-sm">
            {companyTag}
          </Badge>
        </div>
      )}
    </div>
  );
};
