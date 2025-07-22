
import { Product } from '@/types/product';
import { fetchProductsFromDatabase, fetchCategoriesFromDatabase } from './productService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class EnhancedProductService {
  private static instance: EnhancedProductService;
  private productCache: Map<string, CacheEntry<Product[]>> = new Map();
  private categoryCache: Map<string, CacheEntry<string[]>> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): EnhancedProductService {
    if (!EnhancedProductService.instance) {
      EnhancedProductService.instance = new EnhancedProductService();
    }
    return EnhancedProductService.instance;
  }

  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() < entry.expiresAt;
  }

  private setCacheEntry<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    const now = Date.now();
    cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    });
  }

  async getProducts(forceRefresh = false): Promise<Product[]> {
    const cacheKey = 'all_products';
    const cached = this.productCache.get(cacheKey);

    if (!forceRefresh && cached && this.isCacheValid(cached)) {
      console.log('✅ Returning cached products');
      return cached.data;
    }

    try {
      console.time('Enhanced product fetch');
      const products = await fetchProductsFromDatabase();
      console.timeEnd('Enhanced product fetch');
      
      // Validate and clean product data
      const validatedProducts = this.validateProducts(products);
      
      this.setCacheEntry(this.productCache, cacheKey, validatedProducts);
      console.log(`✅ Fetched and cached ${validatedProducts.length} products`);
      
      return validatedProducts;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.log('⚠️ Returning stale cached data due to error');
        return cached.data;
      }
      
      throw new Error('Failed to fetch products and no cached data available');
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.getProducts();
      const product = products.find(p => p.id === id);
      
      if (!product) {
        console.warn(`⚠️ Product not found: ${id}`);
        return null;
      }
      
      console.log(`✅ Found product: ${product.name}`);
      return product;
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      return null;
    }
  }

  async getCategories(forceRefresh = false): Promise<string[]> {
    const cacheKey = 'all_categories';
    const cached = this.categoryCache.get(cacheKey);

    if (!forceRefresh && cached && this.isCacheValid(cached)) {
      console.log('✅ Returning cached categories');
      return cached.data;
    }

    try {
      console.time('Enhanced category fetch');
      const categories = await fetchCategoriesFromDatabase();
      console.timeEnd('Enhanced category fetch');
      
      this.setCacheEntry(this.categoryCache, cacheKey, categories);
      console.log(`✅ Fetched and cached ${categories.length} categories`);
      
      return categories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      
      if (cached) {
        console.log('⚠️ Returning stale cached categories due to error');
        return cached.data;
      }
      
      // Fallback to extracting categories from products
      try {
        const products = await this.getProducts();
        const fallbackCategories = [...new Set(products.map(p => p.category))];
        console.log('✅ Generated categories from products as fallback');
        return fallbackCategories;
      } catch {
        return [];
      }
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await this.getProducts();
      const filtered = products.filter(p => p.category === category);
      console.log(`✅ Found ${filtered.length} products in category: ${category}`);
      return filtered;
    } catch (error) {
      console.error(`❌ Error fetching products by category ${category}:`, error);
      return [];
    }
  }

  private validateProducts(products: Product[]): Product[] {
    return products.filter(product => {
      if (!product.id || !product.name || !product.category) {
        console.warn('⚠️ Invalid product data:', product);
        return false;
      }
      return true;
    }).map(product => ({
      ...product,
      // Ensure required fields have defaults
      description: product.description || 'No description available',
      fullDescription: product.fullDescription || product.description || 'No description available',
      specifications: product.specifications || [],
      images: product.images || [],
      thumbnail: product.thumbnail || '/placeholder.svg',
      modelPath: product.modelPath || ''
    }));
  }

  clearCache(): void {
    this.productCache.clear();
    this.categoryCache.clear();
    console.log('🧹 Cache cleared');
  }

  getCacheStats(): { products: number; categories: number } {
    return {
      products: this.productCache.size,
      categories: this.categoryCache.size
    };
  }
}

export const enhancedProductService = EnhancedProductService.getInstance();
export default enhancedProductService;
