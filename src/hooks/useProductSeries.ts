import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';
import { useProductRealtime } from './useProductRealtime';

export interface ProductSeries {
  id: string;
  name: string;
  category: string;
  products: Product[];
  thumbnail?: string;
  description?: string;
  availableVariants: {
    finishes: string[];
    orientations: string[];
    drawerCounts: number[];
    doorTypes: string[];
    dimensions: string[];
  };
}

// Transform any database object to proper DatabaseProduct with defaults
const ensureDatabaseProduct = (rawProduct: any): DatabaseProduct => {
  return {
    id: rawProduct.id || '',
    name: rawProduct.name || '',
    category: rawProduct.category || '',
    dimensions: rawProduct.dimensions || '',
    model_path: rawProduct.model_path || '',
    thumbnail_path: rawProduct.thumbnail_path || '',
    additional_images: rawProduct.additional_images || [],
    description: rawProduct.description || '',
    full_description: rawProduct.full_description || '',
    specifications: rawProduct.specifications || [],
    finish_type: rawProduct.finish_type || '',
    orientation: rawProduct.orientation || '',
    door_type: rawProduct.door_type || '',
    variant_type: rawProduct.variant_type || '',
    drawer_count: rawProduct.drawer_count || 0,
    cabinet_class: rawProduct.cabinet_class || 'standard',
    product_code: rawProduct.product_code || '',
    mounting_type: rawProduct.mounting_type || '',
    mixing_type: rawProduct.mixing_type || '',
    handle_type: rawProduct.handle_type || '',
    emergency_shower_type: rawProduct.emergency_shower_type || '',
    company_tags: rawProduct.company_tags || [],
    product_series: rawProduct.product_series || '',
    parent_series_id: rawProduct.parent_series_id || '',
    is_series_parent: rawProduct.is_series_parent || false,
    is_active: rawProduct.is_active !== undefined ? rawProduct.is_active : true,
    series_model_path: rawProduct.series_model_path || '',
    series_thumbnail_path: rawProduct.series_thumbnail_path || '',
    series_overview_image_path: rawProduct.series_overview_image_path || '',
    overview_image_path: rawProduct.overview_image_path || '',
    series_order: rawProduct.series_order || 0,
    variant_order: rawProduct.variant_order || 0,
    created_at: rawProduct.created_at || '',
    updated_at: rawProduct.updated_at || '',
    editable_title: rawProduct.editable_title || rawProduct.name || '',
    editable_description: rawProduct.editable_description || rawProduct.description || '',
    inherits_series_assets: rawProduct.inherits_series_assets || false,
    target_variant_count: rawProduct.target_variant_count || 0,
    keywords: rawProduct.keywords || []
  };
};

// Transform database product to Product interface
const transformDatabaseProduct = (dbProduct: DatabaseProduct): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    overviewImage: dbProduct.overview_image_path,
    seriesOverviewImage: dbProduct.series_overview_image_path,
    images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.editable_description || dbProduct.full_description || dbProduct.description || '',
    specifications: dbProduct.specifications || [],
    // Additional fields for compatibility
    finishes: [],
    variants: [],
    baseProductId: dbProduct.parent_series_id,
    // Variant-specific fields
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code,
    thumbnail_path: dbProduct.thumbnail_path,
    model_path: dbProduct.model_path,
    // New variant fields
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    company_tags: dbProduct.company_tags,
    product_series: dbProduct.product_series,
    cabinet_class: dbProduct.cabinet_class || 'standard',
    emergency_shower_type: dbProduct.emergency_shower_type,
    // Admin editable fields
    editable_title: dbProduct.editable_title || dbProduct.name,
    editable_description: dbProduct.editable_description || dbProduct.description,
    // Timestamps and status
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    is_active: dbProduct.is_active
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

      // Group products by series, filtering out products without thumbnails
      const seriesMap = new Map<string, ProductSeries>();
      
      (products || []).forEach((rawProduct) => {
        // Only include products that have a thumbnail_path
        if (!rawProduct.thumbnail_path) {
          return;
        }

        // Transform to proper DatabaseProduct first, then to Product
        const dbProduct = ensureDatabaseProduct(rawProduct);
        const transformedProduct = transformDatabaseProduct(dbProduct);
        const seriesKey = dbProduct.product_series || dbProduct.category;
        
        if (!seriesMap.has(seriesKey)) {
          seriesMap.set(seriesKey, {
            id: seriesKey,
            name: seriesKey,
            category: dbProduct.category,
            products: [],
            thumbnail: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path,
            description: dbProduct.editable_description || dbProduct.description,
            availableVariants: {
              finishes: [],
              orientations: [],
              drawerCounts: [],
              doorTypes: [],
              dimensions: []
            }
          });
        }
        
        const series = seriesMap.get(seriesKey)!;
        series.products.push(transformedProduct);
        
        // Update available variants
        if (dbProduct.finish_type && !series.availableVariants.finishes.includes(dbProduct.finish_type)) {
          series.availableVariants.finishes.push(dbProduct.finish_type);
        }
        if (dbProduct.orientation && !series.availableVariants.orientations.includes(dbProduct.orientation)) {
          series.availableVariants.orientations.push(dbProduct.orientation);
        }
        if (dbProduct.drawer_count && !series.availableVariants.drawerCounts.includes(dbProduct.drawer_count)) {
          series.availableVariants.drawerCounts.push(dbProduct.drawer_count);
        }
        if (dbProduct.door_type && !series.availableVariants.doorTypes.includes(dbProduct.door_type)) {
          series.availableVariants.doorTypes.push(dbProduct.door_type);
        }
        if (dbProduct.dimensions && !series.availableVariants.dimensions.includes(dbProduct.dimensions)) {
          series.availableVariants.dimensions.push(dbProduct.dimensions);
        }
      });

      // Filter out series that have no products (after filtering out products without photos)
      const filteredSeries = Array.from(seriesMap.values()).filter(series => series.products.length > 0);
      
      setProductSeries(filteredSeries);
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
    enabled: true
  });

  return {
    productSeries,
    loading,
    error,
    refreshProductSeries: fetchProductSeries
  };
};
