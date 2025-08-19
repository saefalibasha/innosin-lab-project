
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import enhancedProductService from '@/services/enhancedProductService';
import productService from '@/services/productService';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface UseOptimizedProductDetailResult {
  product: Product | null;
  variants: Product[];
  loading: boolean;
  error: string | null;
  loadingStates: {
    product: boolean;
    variants: boolean;
    complete: boolean;
  };
}

export const useOptimizedProductDetail = (id: string | undefined): UseOptimizedProductDetailResult => {
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    product: true,
    variants: true,
    complete: false
  });

  const { startTimer, endTimer } = usePerformanceMonitor('ProductDetail');

  const fetchProductDetails = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setLoadingStates({ product: false, variants: false, complete: true });
      return;
    }

    try {
      startTimer('total-fetch');
      setError(null);

      // First, quickly fetch the main product
      startTimer('product-fetch');
      const productData = await enhancedProductService.getProductById(id);
      endTimer('product-fetch');
      
      if (!productData) {
        setError('Product not found');
        setLoading(false);
        setLoadingStates({ product: false, variants: false, complete: true });
        return;
      }

      // Set product immediately to show basic info
      setProduct(productData);
      setLoadingStates(prev => ({ ...prev, product: false }));

      // Then fetch variants in background if needed
      startTimer('variants-fetch');
      let variantData: Product[] = [];
      
      if (productData.parent_series_id === null || productData.parent_series_id === undefined) {
        // This is a series parent, fetch its variants
        variantData = await productService.getVariantsBySeriesId(id);
      } else {
        // This is a variant, fetch siblings
        const parentId = productData.parent_series_id;
        if (parentId) {
          variantData = await productService.getVariantsBySeriesId(parentId);
        }
      }
      
      setVariants(variantData);
      endTimer('variants-fetch');
      endTimer('total-fetch');
      
      setLoadingStates({ product: false, variants: false, complete: true });
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id, startTimer, endTimer]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  return {
    product,
    variants,
    loading,
    error,
    loadingStates
  };
};
