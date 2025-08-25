
import { supabase } from '@/integrations/supabase/client';
import { ProductSeries } from '@/types/product-series';

export const updateProductSeries = async (series: ProductSeries) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: series.name,
      product_code: series.series_code,
      description: series.description,
      updated_at: new Date().toISOString()
    })
    .eq('id', series.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
