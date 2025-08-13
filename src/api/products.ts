
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProduct } from '@/types/supabase';

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

export const updateProduct = async (productId: string, updates: Partial<DatabaseProduct>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return data;
};

export const createProduct = async (productData: Partial<DatabaseProduct>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return data;
};

export const deleteProduct = async (productId: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  return true;
};
