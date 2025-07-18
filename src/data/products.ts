
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

// Get products from database instead of static files
export const getProductsAsync = async (): Promise<Product[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return products?.map(product => ({
      id: product.product_code,
      name: product.name,
      category: product.category,
      description: product.description || '',
      fullDescription: product.full_description || '',
      dimensions: product.dimensions || '',
      thumbnail: product.thumbnail_path || '/products/placeholder.jpg',
      modelPath: product.model_path || '',
      images: product.additional_images || [],
      specifications: Array.isArray(product.specifications) ? product.specifications : [],
      keywords: product.keywords || [],
      additionalImages: product.additional_images || [],
      overviewImage: product.overview_image_path
    })) || [];
  } catch (error) {
    console.error('Error in getProductsAsync:', error);
    return [];
  }
};

// Synchronous version for backwards compatibility (returns empty array, use async version)
export const getProductsSync = (): Product[] => {
  console.warn('getProductsSync is deprecated, use getProductsAsync instead');
  return [];
};

// Load products alias
export const loadProducts = getProductsAsync;

// Get categories from database products
export const getCategories = async (): Promise<string[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    const categories = [...new Set(products?.map(p => p.category).filter(Boolean) || [])];
    return categories.sort();
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
};

// Default empty products for backwards compatibility
export const products: Product[] = [];
