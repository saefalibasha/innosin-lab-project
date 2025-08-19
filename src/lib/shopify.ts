
import { Product } from '@/types/product';

// Mock Shopify API functions
export const getProduct = async (id: string): Promise<Product | null> => {
  // This would normally fetch from Shopify API
  // For now, return null as a placeholder
  console.log('Fetching product:', id);
  return null;
};

export const getProducts = async (): Promise<Product[]> => {
  // This would normally fetch from Shopify API
  // For now, return empty array as a placeholder
  console.log('Fetching all products');
  return [];
};
