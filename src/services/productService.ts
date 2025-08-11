
import { supabase } from '@/integrations/supabase/client';
import { Product as ProductType } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';

// Transform raw database response to proper DatabaseProduct with defaults
const ensureDatabaseProduct = (rawProduct: any): DatabaseProduct => {
  return {
    id: rawProduct.id || '',
    name: rawProduct.name || '',
    category: rawProduct.category || '',
    dimensions: rawProduct.dimensions || '',
    model_path: rawProduct.model_path || '',
    thumbnail_path: rawProduct.thumbnail_path || '',
    additional_images: rawProduct.additional_images || [],
    description: rawProduct.description || '',
    full_description: rawProduct.full_description || '',
    specifications: rawProduct.specifications || [],
    finish_type: rawProduct.finish_type || '',
    orientation: rawProduct.orientation || '',
    door_type: rawProduct.door_type || '',
    variant_type: rawProduct.variant_type || '',
    drawer_count: rawProduct.drawer_count || 0,
    cabinet_class: rawProduct.cabinet_class || 'standard',
    product_code: rawProduct.product_code || '',
    mounting_type: rawProduct.mounting_type || '',
    mixing_type: rawProduct.mixing_type || '',
    handle_type: rawProduct.handle_type || '',
    emergency_shower_type: rawProduct.emergency_shower_type || '',
    company_tags: rawProduct.company_tags || [],
    product_series: rawProduct.product_series || '',
    parent_series_id: rawProduct.parent_series_id || '',
    is_series_parent: rawProduct.is_series_parent || false,
    is_active: rawProduct.is_active !== undefined ? rawProduct.is_active : true,
    series_model_path: rawProduct.series_model_path || '',
    series_thumbnail_path: rawProduct.series_thumbnail_path || '',
    series_overview_image_path: rawProduct.series_overview_image_path || '',
    overview_image_path: rawProduct.overview_image_path || '',
    series_order: rawProduct.series_order || 0,
    variant_order: rawProduct.variant_order || 0,
    created_at: rawProduct.created_at || '',
    updated_at: rawProduct.updated_at || '',
    editable_title: rawProduct.editable_title || rawProduct.name || '',
    editable_description: rawProduct.editable_description || rawProduct.description || ''
  };
};

// Transform DatabaseProduct to ProductType with preference for series assets
const transformDatabaseProduct = (dbProduct: DatabaseProduct): ProductType => {
  return {
    id: dbProduct.id,
    name: dbProduct.editable_title || dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    // Prefer series assets when available
    modelPath: dbProduct.series_model_path || dbProduct.model_path || '',
    thumbnail: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.editable_description || dbProduct.description || '',
    fullDescription: dbProduct.editable_description || dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path,
    model_path: dbProduct.series_model_path || dbProduct.model_path,
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    cabinet_class: dbProduct.cabinet_class || 'standard',
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    editable_title: dbProduct.editable_title,
    editable_description: dbProduct.editable_description,
    is_active: dbProduct.is_active || false,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    // Add new image fields
    overviewImage: dbProduct.overview_image_path,
    seriesOverviewImage: dbProduct.series_overview_image_path,
    // Compatibility fields
    finishes: [],
    variants: [],
    baseProductId: dbProduct.parent_series_id
  };
};

class ProductService {
  async getAllProducts(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<ProductType | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return transformDatabaseProduct(ensureDatabaseProduct(data));
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async getProductsByCategory(category: string): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) throw error;

      return (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const categories = [...new Set((data || []).map(item => item.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategoriesFromSeries(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_series_parent', true)
        .not('category', 'is', null);

      if (error) throw error;

      const categories = [...new Set((data || []).map(item => item.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error('Error fetching series categories:', error);
      throw error;
    }
  }

  async searchProducts(query: string): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,product_code.ilike.%${query}%`)
        .order('name');

      if (error) throw error;

      return (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async searchProductSeries(query: string): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_series_parent', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,product_code.ilike.%${query}%,editable_title.ilike.%${query}%,editable_description.ilike.%${query}%,product_series.ilike.%${query}%`)
        .order('series_order');

      if (error) throw error;

      return (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
    } catch (error) {
      console.error('Error searching product series:', error);
      throw error;
    }
  }

  async getProductSeries(): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_series_parent', true)
        .order('series_order');

      if (error) throw error;

      return (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
    } catch (error) {
      console.error('Error fetching product series:', error);
      throw error;
    }
  }

  async getVariantsBySeriesId(seriesId: string): Promise<ProductType[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('parent_series_id', seriesId)
        .order('variant_order');

      if (error) throw error;

      return (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
    } catch (error) {
      console.error('Error fetching variants:', error);
      throw error;
    }
  }
}

const productService = new ProductService();

// Named exports for backwards compatibility and new series-focused functions
export const fetchProductsFromDatabase = () => productService.getAllProducts();
export const fetchCategoriesFromDatabase = () => productService.getCategoriesFromSeries();
export const fetchProductSeriesFromDatabase = () => productService.getProductSeries();
export const searchProductSeries = (query: string) => productService.searchProductSeries(query);
export const subscribeToProductUpdates = (callback: () => void) => {
  const subscription = supabase
    .channel('product-updates')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, 
      callback
    )
    .subscribe();
  
  return () => subscription.unsubscribe();
};

export default productService;
