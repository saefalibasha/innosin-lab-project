
import { supabase } from '@/integrations/supabase/client';
import { ProductSeries } from '@/types/product-series';

export const updateProductSeries = async (series: ProductSeries) => {
  const { data, error } = await supabase
    .from('product_series')
    .update(series)
    .eq('id', series.id)
    .single();
  
  if (error) throw error;
  return data;
};
