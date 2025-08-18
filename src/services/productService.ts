
import { supabase } from '@/integrations/supabase/client';

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
      price: data.price || 0,
      category: data.category,
      details: data.specifications || {},
      assets: {
        thumbnail: data.thumbnail_path,
        model: data.model_path,
        images: data.additional_images || []
      }
    };
  }
}

export const productService = new ProductService();
export default productService;
