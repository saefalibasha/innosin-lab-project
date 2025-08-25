
import { supabase } from '@/integrations/supabase/client';
import { Variant } from '@/types';

export const createVariant = async (variant: Partial<Variant>) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: variant.name,
      product_code: variant.product_code,
      description: variant.description,
      parent_series_id: variant.product_series_id,
      is_series_parent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteVariant = async (params: { id: string }) => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', params.id);
  
  if (error) throw error;
};
