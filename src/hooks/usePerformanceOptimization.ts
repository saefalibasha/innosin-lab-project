import React, { useMemo, useCallback } from 'react';
import { Product } from '@/types/product';

// Debounce hook for search input
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtualized product list for large catalogs
export const useVirtualizedProducts = (
  products: Product[],
  itemHeight: number = 400,
  containerHeight: number = 800
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleStartIndex = Math.floor(scrollTop / itemHeight);
  const visibleEndIndex = Math.min(
    visibleStartIndex + Math.ceil(containerHeight / itemHeight) + 1,
    products.length - 1
  );

  const visibleProducts = useMemo(() => {
    return products.slice(visibleStartIndex, visibleEndIndex + 1);
  }, [products, visibleStartIndex, visibleEndIndex]);

  const totalHeight = products.length * itemHeight;
  const offsetY = visibleStartIndex * itemHeight;

  return {
    visibleProducts,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Optimized product filtering
export const useOptimizedProductFilter = (
  products: Product[],
  searchTerm: string,
  category: string
) => {
  return useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.specifications.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesCategory = category === 'all' || product.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, category]);
};

// Preload critical company assets
export const useAssetPreloader = (companyLogos: string[]) => {
  React.useEffect(() => {
    const preloadImages = companyLogos.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.allSettled(preloadImages);
  }, [companyLogos]);
};

export default {
  useDebounce,
  useVirtualizedProducts,
  useOptimizedProductFilter,
  useAssetPreloader
};