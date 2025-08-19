
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

class ProductService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async withRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`${context} attempt ${attempt} failed:`, error);
        
        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
          continue;
        }
        
        throw new Error(`${context} failed after ${this.MAX_RETRIES} attempts: ${lastError.message}`);
      }
    }
    
    throw lastError!;
  }

  private transformDatabaseProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name || '',
      category: dbProduct.category || '',
      dimensions: dbProduct.dimensions || '',
      modelPath: dbProduct.model_path || '',
      thumbnail: dbProduct.thumbnail_path || '',
      images: Array.isArray(dbProduct.additional_images) ? dbProduct.additional_images : [],
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
      company_tags: Array.isArray(dbProduct.company_tags) ? dbProduct.company_tags : [],
      product_series: dbProduct.product_series,
      parent_series_id: dbProduct.parent_series_id,
      created_at: dbProduct.created_at,
      updated_at: dbProduct.updated_at,
      is_active: dbProduct.is_active !== false
    };
  }

  async getAllProducts(): Promise<Product[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data.map(this.transformDatabaseProduct);
    }, 'Get all products');
  }

  async getProductById(id: string): Promise<Product> {
    if (!id) {
      throw new Error('Product ID is required');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Product not found');
        }
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('Product not found');
      }

      return this.transformDatabaseProduct(data);
    }, `Get product by ID: ${id}`);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return (data || []).map(this.transformDatabaseProduct);
    }, `Get products by category: ${category}`);
  }

  async getProductsBySeries(series: string): Promise<Product[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_series', series)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return (data || []).map(this.transformDatabaseProduct);
    }, `Get products by series: ${series}`);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,product_code.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return (data || []).map(this.transformDatabaseProduct);
    }, `Search products: ${query}`);
  }

  async getCategories(): Promise<string[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true)
        .order('category');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const uniqueCategories = [...new Set((data || []).map(item => item.category).filter(Boolean))];
      return uniqueCategories;
    }, 'Get categories');
  }

  async fetchProductSeriesFromDatabase(): Promise<Product[]> {
    return this.getAllProducts();
  }

  async fetchCompanyTagsFromDatabase(): Promise<string[]> {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('company_tags')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const allTags = (data || [])
        .flatMap(item => item.company_tags || [])
        .filter(Boolean);
      
      return [...new Set(allTags)];
    }, 'Get company tags');
  }

  async searchProductSeries(query: string): Promise<Product[]> {
    return this.searchProducts(query);
  }

  subscribeToProductUpdates(callback: () => void) {
    const subscription = supabase
      .channel('product-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'products' 
        }, 
        () => {
          callback();
        }
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }
}

export const productService = new ProductService();

// Export individual functions for compatibility
export const fetchProductSeriesFromDatabase = () => productService.fetchProductSeriesFromDatabase();
export const fetchCompanyTagsFromDatabase = () => productService.fetchCompanyTagsFromDatabase();
export const searchProductSeries = (query: string) => productService.searchProductSeries(query);
export const subscribeToProductUpdates = (callback: () => void) => productService.subscribeToProductUpdates(callback);
