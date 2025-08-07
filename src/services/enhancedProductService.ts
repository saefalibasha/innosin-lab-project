
import { supabase } from '@/integrations/supabase/client';
import { Product as ProductType } from '@/types/product';
import productService from './productService';

export class EnhancedProductService {
  async getAllProducts(): Promise<ProductType[]> {
    return await productService.getAllProducts();
  }

  async getCategories(): Promise<string[]> {
    return await productService.getCategories();
  }

  async searchProducts(query: string): Promise<ProductType[]> {
    return await productService.searchProducts(query);
  }

  async subscribeToUpdates(callback: () => void) {
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
  }
}

export default new EnhancedProductService();
