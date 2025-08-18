
import { Product } from '@/types/product';
import productService from '@/services/productService';

// Cache for products and categories
let productsCache: Product[] | null = null;
let categoriesCache: string[] | null = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getAllProducts = async (forceRefresh = false): Promise<Product[]> => {
  const now = Date.now();
  
  if (!forceRefresh && productsCache && (now - lastFetch) < CACHE_DURATION) {
    return productsCache;
  }

  try {
    const products = await productService.getAllProducts();
    productsCache = products;
    lastFetch = now;
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return productsCache || [];
  }
};

export const getCategories = async (forceRefresh = false): Promise<string[]> => {
  const now = Date.now();
  
  if (!forceRefresh && categoriesCache && (now - lastFetch) < CACHE_DURATION) {
    return categoriesCache;
  }

  try {
    const categories = await productService.getCategories();
    categoriesCache = categories;
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return categoriesCache || [];
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const products = await getAllProducts();
  return products.filter(product => product.category === category);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const products = await getAllProducts();
  return products.find(product => product.id === id) || null;
};

export const clearProductCache = () => {
  productsCache = null;
  categoriesCache = null;
  lastFetch = 0;
};
