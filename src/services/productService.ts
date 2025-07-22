
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/product';

export const fetchProductsFromDatabase = async (): Promise<Product[]> => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('product_series', { ascending: true })
    .order('series_order', { ascending: true })
    .order('variant_order', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return products?.map(product => ({
    id: product.id,
    name: product.name,
    product_code: product.product_code,
    category: product.category,
    dimensions: product.dimensions || '',
    description: product.description || '',
    fullDescription: product.full_description || product.description || '',
    specifications: Array.isArray(product.specifications) ? 
      product.specifications.map((spec: any) => String(spec)) : [],
    keywords: product.keywords || [],
    thumbnail: product.thumbnail_path || '',
    modelPath: product.model_path || '',
    images: product.additional_images || [],
    overviewImage: product.overview_image_path || '',
    // Improved series image fallback logic
    seriesOverviewImage: product.series_overview_image_path || 
                        product.series_thumbnail_path || 
                        product.overview_image_path || 
                        product.thumbnail_path || '',
    productSeries: product.product_series || '',
    finishType: product.finish_type || 'PC',
    orientation: product.orientation || 'None',
    doorType: product.door_type || '',
    drawerCount: product.drawer_count || 0,
    companyTags: product.company_tags || [],
    isSeriesParent: product.is_series_parent || false,
    seriesSlug: product.series_slug || '',
    variantType: product.variant_type || 'standard'
  })) || [];
};

export const fetchCategoriesFromDatabase = async (): Promise<string[]> => {
  const { data: products, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  const categories = [...new Set(products?.map(p => p.category).filter(Boolean) || [])];
  return categories.sort();
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    product_code: product.product_code,
    category: product.category,
    dimensions: product.dimensions || '',
    description: product.description || '',
    fullDescription: product.full_description || product.description || '',
    specifications: Array.isArray(product.specifications) ? 
      product.specifications.map((spec: any) => String(spec)) : [],
    keywords: product.keywords || [],
    thumbnail: product.thumbnail_path || '',
    modelPath: product.model_path || '',
    images: product.additional_images || [],
    overviewImage: product.overview_image_path || '',
    // Improved series image fallback logic
    seriesOverviewImage: product.series_overview_image_path || 
                        product.series_thumbnail_path || 
                        product.overview_image_path || 
                        product.thumbnail_path || '',
    productSeries: product.product_series || '',
    finishType: product.finish_type || 'PC',
    orientation: product.orientation || 'None',
    doorType: product.door_type || '',
    drawerCount: product.drawer_count || 0,
    companyTags: product.company_tags || [],
    isSeriesParent: product.is_series_parent || false,
    seriesSlug: product.series_slug || '',
    variantType: product.variant_type || 'standard'
  };
};
