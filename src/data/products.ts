
import { Product } from '@/types/product';
import { getProductsSync, getProductsAsync, getCategories as getCategoriesFromAssets } from '@/utils/productAssets';

// Export products from the asset management system
export const products: Product[] = getProductsSync();

// Export async product loading for better performance
export const loadProducts = getProductsAsync;

// Export the async function directly as well - re-export from productAssets
export const getProductsAsync = getProductsAsync;

// Generate unique categories from products
export const getCategories = getCategoriesFromAssets;
