
import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '100vw',
  quality = 75,
  placeholder = 'blur',
  blurDataURL
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
  };

  // Generate WebP and fallback URLs
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const originalSrc = src;

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {placeholder === 'blur' && !isLoaded && !isError && (
        <div className="absolute inset-0">
          {blurDataURL ? (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-110"
            />
          ) : (
            <Skeleton className="w-full h-full bg-muted animate-pulse" />
          )}
        </div>
      )}
      
      {(isInView || priority) && (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            src={originalSrc}
            alt={alt}
            sizes={sizes}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </picture>
      )}
    </div>
  );
};
