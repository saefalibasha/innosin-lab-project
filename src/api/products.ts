import { supabase } from '@/integrations/supabase/client';
import { DatabaseProduct } from '@/types/supabase';

// UUID v4-ish detector — used to decide whether a route param is a slug or an id.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value);

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

export const fetchProductBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_series_parent', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Product not found: ${error.message}`);
  }
  if (!data) {
    throw new Error('Product not found');
  }

  return data;
};

// Accepts either a slug or a UUID; useful for backward-compat with legacy /products/:id URLs.
export const fetchProductBySlugOrId = async (slugOrId: string) => {
  if (isUuid(slugOrId)) {
    return fetchProductById(slugOrId);
  }
  return fetchProductBySlug(slugOrId);
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
