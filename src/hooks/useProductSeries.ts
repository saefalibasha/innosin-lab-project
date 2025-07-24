
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

// Transform database product to Product interface
const transformDatabaseProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions,
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    overviewImage: dbProduct.overview_image,
    seriesOverviewImage: dbProduct.series_overview_image,
    images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.editable_description || dbProduct.description || '',
    specifications: dbProduct.specifications || [],
    // Additional fields for compatibility
    finishes: dbProduct.finishes || [],
    variants: dbProduct.variants || [],
    baseProductId: dbProduct.base_product_id
  };
};

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
      
      products?.forEach(dbProduct => {
        const transformedProduct = transformDatabaseProduct(dbProduct);
        const seriesKey = dbProduct.product_series || dbProduct.category;
        
        if (!seriesMap.has(seriesKey)) {
          seriesMap.set(seriesKey, {
            id: seriesKey,
            name: seriesKey,
            category: dbProduct.category,
            products: [],
            thumbnail: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path,
            description: dbProduct.editable_description || dbProduct.description
          });
        }
        
        seriesMap.get(seriesKey)!.products.push(transformedProduct);
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
