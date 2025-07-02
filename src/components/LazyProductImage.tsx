import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

const LazyProductImage: React.FC<LazyProductImageProps> = ({
  src,
  alt,
  className = '',
  fallback = '/placeholder.svg'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
  };

  const handleError = () => {
    setIsError(true);
    setIsLoaded(false);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !isError && (
        <Skeleton className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {isInView && (
        <img
          src={isError ? fallback : src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyProductImage;