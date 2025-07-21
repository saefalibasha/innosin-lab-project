
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export const fetchProductsFromDatabase = async (): Promise<Product[]> => {
  try {
    // First, get all active products (both series parents and variants)
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('product_series', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    if (!products) return [];

    // Convert database products to frontend Product type
    const convertedProducts: Product[] = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category || 'Uncategorized',
      dimensions: product.dimensions || '',
      modelPath: product.model_path || '',
      thumbnail: product.thumbnail_path || '',
      overviewImage: product.overview_image_path || product.thumbnail_path || '',
      images: product.additional_images || [],
      description: product.description || '',
      fullDescription: product.full_description || product.description || '',
      specifications: product.specifications ? 
        (Array.isArray(product.specifications) ? product.specifications : []) : [],
      finishes: [{
        type: product.finish_type === 'SS' ? 'stainless-steel' : 'powder-coat',
        name: product.finish_type === 'SS' ? 'Stainless Steel' : 'Powder Coat',
        modelPath: product.model_path,
        thumbnail: product.thumbnail_path
      }],
      variants: [],
      baseProductId: product.parent_series_id || undefined
    }));

    return convertedProducts;
  } catch (error) {
    console.error('Error in fetchProductsFromDatabase:', error);
    return [];
  }
};

export const fetchCategoriesFromDatabase = async (): Promise<string[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    if (!products) return [];

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories;
  } catch (error) {
    console.error('Error in fetchCategoriesFromDatabase:', error);
    return [];
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('product_series', { ascending: true });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    if (!products) return [];

    // Convert to frontend Product type
    const convertedProducts: Product[] = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category || 'Uncategorized',
      dimensions: product.dimensions || '',
      modelPath: product.model_path || '',
      thumbnail: product.thumbnail_path || '',
      overviewImage: product.overview_image_path || product.thumbnail_path || '',
      images: product.additional_images || [],
      description: product.description || '',
      fullDescription: product.full_description || product.description || '',
      specifications: product.specifications ? 
        (Array.isArray(product.specifications) ? product.specifications : []) : [],
      finishes: [{
        type: product.finish_type === 'SS' ? 'stainless-steel' : 'powder-coat',
        name: product.finish_type === 'SS' ? 'Stainless Steel' : 'Powder Coat',
        modelPath: product.model_path,
        thumbnail: product.thumbnail_path
      }],
      variants: [],
      baseProductId: product.parent_series_id || undefined
    }));

    return convertedProducts;
  } catch (error) {
    console.error('Error in fetchProductsByCategory:', error);
    return [];
  }
};
