
import { useEffect, useState } from 'react';

interface ImagePreloadResult {
  loaded: boolean;
  error: boolean;
}

export const useImagePreloader = (src: string): ImagePreloadResult => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src || src === '/placeholder.svg') {
      setLoaded(true);
      return;
    }

    const img = new Image();
    
    const handleLoad = () => {
      setLoaded(true);
      setError(false);
    };

    const handleError = () => {
      setError(true);
      setLoaded(false);
      console.warn(`Failed to preload image: ${src}`);
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loaded, error };
};

export const useMultipleImagePreloader = (sources: string[]): { [key: string]: ImagePreloadResult } => {
  const [results, setResults] = useState<{ [key: string]: ImagePreloadResult }>({});

  useEffect(() => {
    const validSources = sources.filter(src => src && !src.includes('placeholder'));
    
    if (validSources.length === 0) {
      return;
    }

    const loadPromises = validSources.map(src => {
      return new Promise<{ src: string; loaded: boolean; error: boolean }>((resolve) => {
        const img = new Image();
        
        img.onload = () => resolve({ src, loaded: true, error: false });
        img.onerror = () => resolve({ src, loaded: false, error: true });
        
        img.src = src;
      });
    });

    Promise.allSettled(loadPromises).then(results => {
      const newResults: { [key: string]: ImagePreloadResult } = {};
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { src, loaded, error } = result.value;
          newResults[src] = { loaded, error };
        } else {
          const src = validSources[index];
          newResults[src] = { loaded: false, error: true };
        }
      });
      
      setResults(newResults);
    });
  }, [sources]);

  return results;
};

export default useImagePreloader;
