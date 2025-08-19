
import { supabase } from '@/integrations/supabase/client';
import { Product as ProductType } from '@/types/product';

// Transform database product to our Product interface
const transformDatabaseProduct = (dbProduct: any): ProductType => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    finishes: [],
    variants: [],
    baseProductId: dbProduct.parent_series_id,
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.thumbnail_path,
    model_path: dbProduct.model_path,
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    parent_series_id: dbProduct.parent_series_id,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    is_active: dbProduct.is_active
  };
};

export class EnhancedProductService {
  private cache = new Map<string, any>();
  private cacheTimestamps = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getAllProducts(forceRefresh = false): Promise<ProductType[]> {
    const cacheKey = 'all_products';
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    const products = (data || []).map(transformDatabaseProduct);
    this.setCache(cacheKey, products);
    return products;
  }

  async getProductById(id: string): Promise<ProductType | null> {
    const cacheKey = `product_${id}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    const product = transformDatabaseProduct(data);
    this.setCache(cacheKey, product);
    return product;
  }

  async getProductsByCategory(category: string): Promise<ProductType[]> {
    const cacheKey = `category_${category}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }

    const products = (data || []).map(transformDatabaseProduct);
    this.setCache(cacheKey, products);
    return products;
  }

  async getCategories(forceRefresh = false): Promise<string[]> {
    const cacheKey = 'categories';
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    const categories = [...new Set((data || []).map(item => item.category).filter(Boolean))];
    this.setCache(cacheKey, categories);
    return categories;
  }

  async searchProducts(query: string): Promise<ProductType[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return (data || []).map(transformDatabaseProduct);
  }

  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  getCacheStats() {
    return {
      products: this.cache.size,
      categories: this.cacheTimestamps.size
    };
  }

  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private setCache(key: string, value: any) {
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
  }

  async subscribeToUpdates(callback: () => void) {
    const subscription = supabase
      .channel('product-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'products' 
        }, 
        () => {
          this.clearCache();
          callback();
        }
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }
}

export default new EnhancedProductService();
