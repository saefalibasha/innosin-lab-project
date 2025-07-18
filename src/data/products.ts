
import { Product } from '@/types/product';
import { getProductsSync, getCategories as getCategoriesFromAssets } from '@/utils/productAssets';

// Export products from the enhanced asset management system  
export const products: Product[] = getProductsSync();

// Generate unique categories from products
export const getCategories = getCategoriesFromAssets;
