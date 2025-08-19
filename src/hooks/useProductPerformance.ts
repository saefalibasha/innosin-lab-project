
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Product } from '@/types/product';

interface ProductCache {
  [key: string]: {
    data: Product[];
    timestamp: number;
    ttl: number;
  };
}

interface UseProductPerformanceOptions {
  cacheEnabled?: boolean;
  cacheTTL?: number;
  enableVirtualization?: boolean;
  itemHeight?: number;
  containerHeight?: number;
}

export const useProductPerformance = (
  products: Product[],
  options: UseProductPerformanceOptions = {}
) => {
  const {
    cacheEnabled = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    enableVirtualization = true,
    itemHeight = 120,
    containerHeight = 600
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scrollTop, setScrollTop] = useState(0);
  
  const cacheRef = useRef<ProductCache>({});
  const performanceMetrics = useRef({
    renderTime: 0,
    filterTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  });

  // Debounced search term
  const debouncedSearchTerm = useMemo(() => {
    const [debouncedValue, setDebouncedValue] = useState(searchTerm);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(searchTerm);
      }, 300);
      
      return () => clearTimeout(handler);
    }, [searchTerm]);
    
    return debouncedValue;
  }, [searchTerm]);

  // Memoized filtering with performance tracking
  const filteredProducts = useMemo(() => {
    const startTime = performance.now();
    
    const cacheKey = `${debouncedSearchTerm}-${categoryFilter}`;
    
    // Check cache first
    if (cacheEnabled && cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey];
      if (Date.now() - cached.timestamp < cached.ttl) {
        performanceMetrics.current.cacheHits++;
        performanceMetrics.current.filterTime = performance.now() - startTime;
        return cached.data;
      }
    }
    
    // Filter products
    const filtered = products.filter(product => {
      const matchesSearch = !debouncedSearchTerm || 
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.product_code?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    // Cache results
    if (cacheEnabled) {
      cacheRef.current[cacheKey] = {
        data: filtered,
        timestamp: Date.now(),
        ttl: cacheTTL
      };
      performanceMetrics.current.cacheMisses++;
    }

    performanceMetrics.current.filterTime = performance.now() - startTime;
    return filtered;
  }, [products, debouncedSearchTerm, categoryFilter, cacheEnabled, cacheTTL]);

  // Virtual scrolling calculations
  const virtualScrollData = useMemo(() => {
    if (!enableVirtualization) return null;

    const visibleStartIndex = Math.floor(scrollTop / itemHeight);
    const visibleEndIndex = Math.min(
      visibleStartIndex + Math.ceil(containerHeight / itemHeight) + 2,
      filteredProducts.length - 1
    );

    const visibleProducts = filteredProducts.slice(visibleStartIndex, visibleEndIndex + 1);
    const totalHeight = filteredProducts.length * itemHeight;
    const offsetY = visibleStartIndex * itemHeight;

    return {
      visibleProducts,
      totalHeight,
      offsetY,
      visibleStartIndex,
      visibleEndIndex
    };
  }, [filteredProducts, scrollTop, itemHeight, containerHeight, enableVirtualization]);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    return {
      ...performanceMetrics.current,
      cacheEfficiency: performanceMetrics.current.cacheHits / 
        (performanceMetrics.current.cacheHits + performanceMetrics.current.cacheMisses) * 100
    };
  }, []);

  // Cache cleanup
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      Object.keys(cacheRef.current).forEach(key => {
        const cached = cacheRef.current[key];
        if (now - cached.timestamp > cached.ttl) {
          delete cacheRef.current[key];
        }
      });
    };

    const interval = setInterval(cleanup, cacheTTL);
    return () => clearInterval(interval);
  }, [cacheTTL]);

  return {
    // Data
    filteredProducts,
    virtualScrollData,
    
    // State
    isLoading,
    searchTerm,
    categoryFilter,
    scrollTop,
    
    // Actions
    setSearchTerm,
    setCategoryFilter,
    setScrollTop,
    setIsLoading,
    
    // Performance
    getPerformanceMetrics,
    
    // Counts
    totalProducts: products.length,
    filteredCount: filteredProducts.length
  };
};

// Preload images for better performance
export const useImagePreloader = (products: Product[]) => {
  useEffect(() => {
    const imageUrls = products
      .map(p => p.thumbnail)
      .filter(Boolean) as string[];
    
    const preloadImages = imageUrls.slice(0, 20).map(src => { // Preload first 20 images
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.allSettled(preloadImages);
  }, [products]);
};

export default useProductPerformance;
