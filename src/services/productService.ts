
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
        modelPath: data.model_url,
        images: data.images || []
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
        modelPath: item.model_url,
        images: item.images || []
      }));

      console.log('Transformed products:', products);
      return products;
    } catch (error) {
      console.error('ProductService error:', error);
      throw error;
    }
  }
}

const productService = new ProductService();
export default productService;
