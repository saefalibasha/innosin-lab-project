
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

// Helper function to map database product to Product interface
const mapDatabaseProductToProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id || '',
    name: dbProduct.name || '',
    category: dbProduct.category || '',
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.full_description || dbProduct.description || '',
    specifications: dbProduct.specifications || [],
    finishes: [], // Will be populated if needed
    variants: [], // Will be populated if needed
    baseProductId: dbProduct.parent_series_id,
    
    // Map database fields to Product interface
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.number_of_drawers,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code,
    thumbnail_path: dbProduct.thumbnail_path,
    model_path: dbProduct.model_path,
    
    // New variant fields
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    company_tags: dbProduct.company_tags,
    product_series: dbProduct.product_series,
    cabinet_class: dbProduct.variant_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    
    // Admin editable fields
    editable_title: dbProduct.name,
    editable_description: dbProduct.description,
    
    // Image fields
    overviewImage: dbProduct.overview_image_path,
    seriesOverviewImage: dbProduct.series_overview_image_path,
    
    // Timestamps and status
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    is_active: dbProduct.is_active,
    
    // Series parent relationship
    parent_series_id: dbProduct.parent_series_id
  };
};

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
      price: undefined, // Price is not stored in the current schema
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

    return (data || []).map(mapDatabaseProductToProduct);
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

  return (data || []).map(mapDatabaseProductToProduct);
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

  return (data || []).map(mapDatabaseProductToProduct);
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
