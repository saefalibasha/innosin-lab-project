
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { useProductRealtime } from './useProductRealtime';

export interface ProductSeries {
  id: string;
  name: string;
  category: string;
  products: Product[];
  thumbnail?: string;
  description?: string;
}

export const useProductSeries = () => {
  const [productSeries, setProductSeries] = useState<ProductSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductSeries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all active products with their series information
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('series_order', { ascending: true });

      if (productsError) throw productsError;

      // Group products by series
      const seriesMap = new Map<string, ProductSeries>();
      
      products?.forEach(product => {
        const seriesKey = product.product_series || product.category;
        
        if (!seriesMap.has(seriesKey)) {
          seriesMap.set(seriesKey, {
            id: seriesKey,
            name: seriesKey,
            category: product.category,
            products: [],
            thumbnail: product.series_thumbnail_path || product.thumbnail_path,
            description: product.editable_description || product.description
          });
        }
        
        seriesMap.get(seriesKey)!.products.push(product);
      });

      setProductSeries(Array.from(seriesMap.values()));
    } catch (err) {
      console.error('Error fetching product series:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product series');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductSeries();
  }, [fetchProductSeries]);

  // Set up real-time updates
  useProductRealtime({
    onProductChange: fetchProductSeries,
    onSeriesChange: fetchProductSeries,
    enabled: true
  });

  return {
    productSeries,
    loading,
    error,
    refreshProductSeries: fetchProductSeries
  };
};
