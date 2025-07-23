import { supabase } from '@/integrations/supabase/client';

export const fetchProductById = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) {
    throw new Error(`Product not found: ${error.message}`);
  }

  return data;
};

export const fetchProductsByParentSeriesId = async (parentSeriesId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('parent_series_id', parentSeriesId)
    .eq('is_series_parent', false)
    .eq('is_active', true)
    .order('dimensions');

  if (error) {
    throw new Error(`Failed to fetch variants: ${error.message}`);
  }

  return data || [];
};