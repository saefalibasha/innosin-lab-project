
import { supabase } from '@/integrations/supabase/client';
import { Variant } from '@/types';

export const createVariant = async (variant: Partial<Variant>) => {
  const { data, error } = await supabase
    .from('variants')
    .insert(variant)
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteVariant = async (params: { id: string }) => {
  const { error } = await supabase
    .from('variants')
    .delete()
    .eq('id', params.id);
  
  if (error) throw error;
};
