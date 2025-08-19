import { Product } from '@/types/product';
import { productService } from '@/services/productService';

// For backwards compatibility, we'll keep the synchronous export
// but recommend using the async fetchProductsFromDatabase function directly
export const products: Product[] = [];

// For new code, use these async functions
export const getProductsAsync = () => productService.getAllProducts();
export const getCategoriesAsync = () => productService.getCategories();

// Sync version for backwards compatibility (returns empty array, should be replaced with async calls)
export const getProductsSync = (): Product[] => {
  console.warn('getProductsSync is deprecated. Use getProductsAsync instead.');
  return [];
};

// Sync version for backwards compatibility (returns empty array, should be replaced with async calls)
export const getCategories = (): string[] => {
  console.warn('getCategories is deprecated. Use getCategoriesAsync instead.');
  return [];
};
