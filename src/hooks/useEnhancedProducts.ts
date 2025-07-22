
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import enhancedProductService from '@/services/enhancedProductService';

interface UseProductsOptions {
  category?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseProductsResult {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  clearCache: () => void;
  cacheStats: { products: number; categories: number };
}

export const useEnhancedProducts = (options: UseProductsOptions = {}): UseProductsResult => {
  const {
    category,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000 // 5 minutes
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        category 
          ? enhancedProductService.getProductsByCategory(category)
          : enhancedProductService.getProducts(forceRefresh),
        enhancedProductService.getCategories(forceRefresh)
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error in useEnhancedProducts:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const refreshProducts = useCallback(() => fetchData(true), [fetchData]);

  const clearCache = useCallback(() => {
    enhancedProductService.clearCache();
    fetchData(true);
  }, [fetchData]);

  const getCacheStats = useCallback(() => {
    return enhancedProductService.getCacheStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    products,
    categories,
    loading,
    error,
    refreshProducts,
    clearCache,
    cacheStats: getCacheStats()
  };
};

export const useProductById = (id: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productData = await enhancedProductService.getProductById(id);
        setProduct(productData);
        
        if (!productData) {
          setError('Product not found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product';
        setError(errorMessage);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};
