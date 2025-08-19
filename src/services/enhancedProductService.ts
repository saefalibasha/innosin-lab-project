import { supabase } from '@/integrations/supabase/client';
import { Product as ProductType } from '@/types/product';
import { productService } from './productService';

export class EnhancedProductService {
  private cache = new Map<string, any>();
  private cacheTimestamps = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getAllProducts(forceRefresh = false): Promise<ProductType[]> {
    const cacheKey = 'all_products';
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const products = await productService.getAllProducts();
    this.setCache(cacheKey, products);
    return products;
  }

  async getProductById(id: string): Promise<ProductType | null> {
    const cacheKey = `product_${id}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const product = await productService.getProductById(id);
    this.setCache(cacheKey, product);
    return product;
  }

  async getProductsByCategory(category: string): Promise<ProductType[]> {
    const cacheKey = `category_${category}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const products = await productService.getProductsByCategory(category);
    this.setCache(cacheKey, products);
    return products;
  }

  async getCategories(forceRefresh = false): Promise<string[]> {
    const cacheKey = 'categories';
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const categories = await productService.getCategories();
    this.setCache(cacheKey, categories);
    return categories;
  }

  async searchProducts(query: string): Promise<ProductType[]> {
    return await productService.searchProducts(query);
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
