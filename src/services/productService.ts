
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

class ProductService {
  async getProductById(id: string): Promise<Product | null> {
    console.log('ProductService - Fetching product with ID:', id);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      if (!data) {
        console.log('No product found with ID:', id);
        return null;
      }

      console.log('Raw product data from Supabase:', data);

      // Transform the database product to our Product type
      const product: Product = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        fullDescription: data.full_description || data.description || '',
        category: data.category || 'Innosin Lab',
        product_code: data.product_code,
        product_series: data.product_series,
        dimensions: data.dimensions,
        finish_type: data.finish_type,
        orientation: data.orientation,
        door_type: data.door_type,
        is_active: data.is_active ?? true,
        company_tags: data.company_tags || [],
        thumbnail: data.thumbnail_url,
        thumbnail_path: data.thumbnail_url,
        modelPath: data.model_url,
        model_path: data.model_url,
        images: data.images || [],
        // Add missing properties that components expect
        editable_title: data.name,
        editable_description: data.description || '',
        specifications: data.specifications || {},
        mounting_type: data.mounting_type,
        mixing_type: data.mixing_type,
        handle_type: data.handle_type,
        emergency_shower_type: data.emergency_shower_type,
        cabinet_class: data.cabinet_class,
        drawer_count: data.drawer_count,
        number_of_drawers: data.number_of_drawers,
        overviewImage: data.thumbnail_url,
        finishes: data.finishes || [],
        variants: data.variants || []
      };

      console.log('Transformed product:', product);
      return product;
    } catch (error) {
      console.error('ProductService error:', error);
      throw error;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    console.log('ProductService - Fetching all products');
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      console.log('Raw products data from Supabase:', data);

      const products: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        fullDescription: item.full_description || item.description || '',
        category: item.category || 'Innosin Lab',
        product_code: item.product_code,
        product_series: item.product_series,
        dimensions: item.dimensions,
        finish_type: item.finish_type,
        orientation: item.orientation,
        door_type: item.door_type,
        is_active: item.is_active ?? true,
        company_tags: item.company_tags || [],
        thumbnail: item.thumbnail_url,
        thumbnail_path: item.thumbnail_url,
        modelPath: item.model_url,
        model_path: item.model_url,
        images: item.images || [],
        // Add missing properties that components expect
        editable_title: item.name,
        editable_description: item.description || '',
        specifications: item.specifications || {},
        mounting_type: item.mounting_type,
        mixing_type: item.mixing_type,
        handle_type: item.handle_type,
        emergency_shower_type: item.emergency_shower_type,
        cabinet_class: item.cabinet_class,
        drawer_count: item.drawer_count,
        number_of_drawers: item.number_of_drawers,
        overviewImage: item.thumbnail_url,
        finishes: item.finishes || [],
        variants: item.variants || []
      }));

      console.log('Transformed products:', products);
      return products;
    } catch (error) {
      console.error('ProductService error:', error);
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      const categories = [...new Set(data?.map(item => item.category).filter(Boolean) || [])];
      return categories;
    } catch (error) {
      console.error('Categories fetch error:', error);
      throw error;
    }
  }
}

const productService = new ProductService();

// Export the service instance and individual methods
export default productService;

// Export individual methods for compatibility
export const fetchProductSeriesFromDatabase = () => productService.getAllProducts();
export const fetchCompanyTagsFromDatabase = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('company_tags')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch company tags: ${error.message}`);
    }

    const allTags = data?.flatMap(item => item.company_tags || []) || [];
    const uniqueTags = [...new Set(allTags)].filter(Boolean);
    return uniqueTags;
  } catch (error) {
    console.error('Company tags fetch error:', error);
    throw error;
  }
};

export const searchProductSeries = async (searchTerm: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%`);

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      fullDescription: item.full_description || item.description || '',
      category: item.category || 'Innosin Lab',
      product_code: item.product_code,
      product_series: item.product_series,
      dimensions: item.dimensions,
      finish_type: item.finish_type,
      orientation: item.orientation,
      door_type: item.door_type,
      is_active: item.is_active ?? true,
      company_tags: item.company_tags || [],
      thumbnail: item.thumbnail_url,
      thumbnail_path: item.thumbnail_url,
      modelPath: item.model_url,
      model_path: item.model_url,
      images: item.images || [],
      editable_title: item.name,
      editable_description: item.description || '',
      specifications: item.specifications || {},
      mounting_type: item.mounting_type,
      mixing_type: item.mixing_type,
      handle_type: item.handle_type,
      emergency_shower_type: item.emergency_shower_type,
      cabinet_class: item.cabinet_class,
      drawer_count: item.drawer_count,
      number_of_drawers: item.number_of_drawers,
      overviewImage: item.thumbnail_url,
      finishes: item.finishes || [],
      variants: item.variants || []
    }));
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const subscribeToProductUpdates = (callback: () => void) => {
  const subscription = supabase
    .channel('products')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
