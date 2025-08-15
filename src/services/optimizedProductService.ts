
import { supabase } from '@/integrations/supabase/client';
import { Product as ProductType } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';

// Cache implementation
class ProductCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingRequests = new Map<string, Promise<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  async dedupedRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

const cache = new ProductCache();

// Transform database product with minimal processing
const transformDatabaseProduct = (dbProduct: DatabaseProduct): ProductType => {
  return {
    id: dbProduct.id,
    name: dbProduct.editable_title || dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.series_model_path || dbProduct.model_path || '',
    thumbnail: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.editable_description || dbProduct.description || '',
    fullDescription: dbProduct.editable_description || dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    finishes: [],
    variants: [],
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path,
    model_path: dbProduct.series_model_path || dbProduct.model_path,
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    cabinet_class: dbProduct.cabinet_class || 'standard',
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    editable_title: dbProduct.editable_title,
    editable_description: dbProduct.editable_description,
    is_active: dbProduct.is_active || false,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    overviewImage: dbProduct.overview_image_path,
    seriesOverviewImage: dbProduct.series_overview_image_path,
    parent_series_id: dbProduct.parent_series_id,
    baseProductId: dbProduct.parent_series_id
  };
};

class OptimizedProductService {
  async getProductSeries(forceRefresh = false): Promise<ProductType[]> {
    const cacheKey = 'product-series';
    
    if (!forceRefresh) {
      const cached = cache.get<ProductType[]>(cacheKey);
      if (cached) return cached;
    }

    return cache.dedupedRequest(cacheKey, async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          category,
          description,
          product_series,
          company_tags,
          series_thumbnail_path,
          series_overview_image_path,
          overview_image_path,
          thumbnail_path,
          created_at,
          updated_at,
          is_active,
          series_order
        `)
        .eq('is_series_parent', true)
        .eq('is_active', true)
        .order('series_order', { ascending: true });

      if (error) throw error;

      const transformed = (data || []).map(item => {
        const dbProduct: DatabaseProduct = {
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description,
          product_series: item.product_series,
          company_tags: item.company_tags,
          series_thumbnail_path: item.series_thumbnail_path,
          series_overview_image_path: item.series_overview_image_path,
          overview_image_path: item.overview_image_path,
          thumbnail_path: item.thumbnail_path,
          editable_title: item.name, // Use name as fallback
          editable_description: item.description, // Use description as fallback
          created_at: item.created_at,
          updated_at: item.updated_at,
          is_active: item.is_active,
          series_order: item.series_order,
          // Default values for required fields
          dimensions: '',
          door_type: null,
          orientation: '',
          finish_type: '',
          mounting_type: null,
          mixing_type: null,
          handle_type: null,
          emergency_shower_type: null,
          drawer_count: 0,
          cabinet_class: 'standard',
          product_code: '',
          model_path: '',
          additional_images: [],
          full_description: '',
          specifications: [],
          variant_type: 'standard',
          variant_order: 0,
          parent_series_id: null,
          series_model_path: null,
          is_series_parent: true,
          inherits_series_assets: false,
          target_variant_count: null,
          keywords: []
        };
        
        return transformDatabaseProduct(dbProduct);
      });

      cache.set(cacheKey, transformed, 5 * 60 * 1000); // 5 minutes
      return transformed;
    });
  }

  async getCompanyTags(forceRefresh = false): Promise<string[]> {
    const cacheKey = 'company-tags';
    
    if (!forceRefresh) {
      const cached = cache.get<string[]>(cacheKey);
      if (cached) return cached;
    }

    return cache.dedupedRequest(cacheKey, async () => {
      const { data, error } = await supabase
        .from('products')
        .select('company_tags')
        .eq('is_series_parent', true)
        .not('company_tags', 'is', null);

      if (error) throw error;

      const allTags = (data || [])
        .flatMap(item => item.company_tags || [])
        .filter(Boolean);
      
      const uniqueTags = [...new Set(allTags)];
      cache.set(cacheKey, uniqueTags, 10 * 60 * 1000); // 10 minutes
      return uniqueTags;
    });
  }

  async searchProductSeries(query: string): Promise<ProductType[]> {
    const cacheKey = `search-${query.toLowerCase()}`;
    
    const cached = cache.get<ProductType[]>(cacheKey);
    if (cached) return cached;

    return cache.dedupedRequest(cacheKey, async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          category,
          description,
          product_series,
          company_tags,
          series_thumbnail_path,
          series_overview_image_path,
          overview_image_path,
          thumbnail_path,
          product_code,
          created_at,
          updated_at,
          is_active,
          series_order
        `)
        .eq('is_series_parent', true)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,product_code.ilike.%${query}%,product_series.ilike.%${query}%`)
        .order('series_order');

      if (error) throw error;

      const transformed = (data || []).map(item => {
        const dbProduct: DatabaseProduct = {
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description,
          product_series: item.product_series,
          company_tags: item.company_tags,
          series_thumbnail_path: item.series_thumbnail_path,
          series_overview_image_path: item.series_overview_image_path,
          overview_image_path: item.overview_image_path,
          thumbnail_path: item.thumbnail_path,
          editable_title: item.name, // Use name as fallback
          editable_description: item.description, // Use description as fallback
          product_code: item.product_code,
          created_at: item.created_at,
          updated_at: item.updated_at,
          is_active: item.is_active,
          series_order: item.series_order,
          // Default values for required fields
          dimensions: '',
          door_type: null,
          orientation: '',
          finish_type: '',
          mounting_type: null,
          mixing_type: null,
          handle_type: null,
          emergency_shower_type: null,
          drawer_count: 0,
          cabinet_class: 'standard',
          model_path: '',
          additional_images: [],
          full_description: '',
          specifications: [],
          variant_type: 'standard',
          variant_order: 0,
          parent_series_id: null,
          series_model_path: null,
          is_series_parent: true,
          inherits_series_assets: false,
          target_variant_count: null,
          keywords: []
        };
        
        return transformDatabaseProduct(dbProduct);
      });

      cache.set(cacheKey, transformed, 2 * 60 * 1000); // 2 minutes for search
      return transformed;
    });
  }

  invalidateCache(pattern?: string): void {
    cache.invalidate(pattern);
  }

  getCacheStats() {
    return {
      size: cache['cache'].size,
      pendingRequests: cache['pendingRequests'].size
    };
  }
}

export const optimizedProductService = new OptimizedProductService();
