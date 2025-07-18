
import { Product } from '@/types/product';
import { getProductsSync, getProductsAsync as getProductsAsyncFromAssets, getCategories as getCategoriesFromAssets } from '@/utils/productAssets';

// Export products from the asset management system
export const products: Product[] = getProductsSync();

// Export async product loading for better performance
export const loadProducts = getProductsAsyncFromAssets;

// Export the async function directly as well - re-export from productAssets
export const getProductsAsync = getProductsAsyncFromAssets;

// Generate unique categories from products
export const getCategories = getCategoriesFromAssets;
