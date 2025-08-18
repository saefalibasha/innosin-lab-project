
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export interface ProductDetails {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category: string;
  details?: Record<string, any>;
  assets?: {
    thumbnail?: string;
    model?: string;
    images?: string[];
  };
}

class ProductService {
  async getProductDetails(productNumber: string): Promise<ProductDetails> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_code', productNumber)
      .single();

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price || undefined,
      category: data.category,
      details: typeof data.specifications === 'object' ? data.specifications as Record<string, any> : {},
      assets: {
        thumbnail: data.thumbnail_path,
        model: data.model_path,
        images: data.additional_images || []
      }
    };
  }

  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data || [];
  }

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))] as string[];
    return categories;
  }
}

// Export individual functions that other parts of the codebase expect
export const fetchProductSeriesFromDatabase = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_series_parent', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch product series: ${error.message}`);
  }

  return data || [];
};

export const fetchCompanyTagsFromDatabase = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('company_tags')
    .not('company_tags', 'is', null);

  if (error) {
    throw new Error(`Failed to fetch company tags: ${error.message}`);
  }

  const allTags = new Set<string>();
  data?.forEach(item => {
    if (item.company_tags && Array.isArray(item.company_tags)) {
      item.company_tags.forEach(tag => allTags.add(tag));
    }
  });

  return Array.from(allTags);
};

export const searchProductSeries = async (searchTerm: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_series_parent', true)
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`)
    .order('name');

  if (error) {
    throw new Error(`Failed to search product series: ${error.message}`);
  }

  return data || [];
};

export const subscribeToProductUpdates = (callback: () => void) => {
  const subscription = supabase
    .channel('products-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'products'
    }, callback)
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const productService = new ProductService();
export default productService;
