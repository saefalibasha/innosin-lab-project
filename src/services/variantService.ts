import { supabase } from '@/integrations/supabase/client';

interface ProductVariant {
  id: string;
  name: string;
  product_code: string;
  category: string;
  dimensions: string;
  description: string;
  full_description: string;
  specifications: any;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
  finish_type: string;
  orientation: string;
  door_type: string;
  variant_type: string;
  drawer_count?: number;
  parent_series_id: string;
}

interface SeriesWithVariants {
  id: string;
  name: string;
  category: string;
  description: string;
  series_thumbnail_path?: string;
  series_overview_image_path?: string;
  product_series: string;
  series_slug?: string;
  variants: ProductVariant[];
}

export const fetchSeriesWithVariants = async (seriesSlug?: string): Promise<SeriesWithVariants[]> => {
  try {
    // Fetch series parents
    let seriesQuery = supabase
      .from('products')
      .select('*')
      .eq('is_series_parent', true)
      .eq('is_active', true);

    if (seriesSlug) {
      seriesQuery = seriesQuery.eq('series_slug', seriesSlug);
    }

    const { data: seriesData, error: seriesError } = await seriesQuery;
    if (seriesError) throw seriesError;

    if (!seriesData || seriesData.length === 0) {
      return [];
    }

    // Fetch variants for each series
    const seriesWithVariants = await Promise.all(
      seriesData.map(async (series) => {
        const { data: variants, error: variantsError } = await supabase
          .from('products')
          .select('*')
          .eq('parent_series_id', series.id)
          .eq('is_active', true)
          .order('variant_order', { ascending: true });

        if (variantsError) {
          console.error('Error fetching variants for series:', series.id, variantsError);
          return {
            ...series,
            variants: []
          };
        }

        return {
          ...series,
          variants: (variants || []).map(v => ({
            ...v,
            specifications: Array.isArray(v.specifications) ? v.specifications : 
                           v.specifications ? [v.specifications] : []
          }))
        };
      })
    );

    return seriesWithVariants;
  } catch (error) {
    console.error('Error fetching series with variants:', error);
    return [];
  }
};

export const fetchVariantsByDimensions = async (seriesId: string): Promise<{
  [dimensions: string]: ProductVariant[]
}> => {
  try {
    const { data: variants, error } = await supabase
      .from('products')
      .select('*')
      .eq('parent_series_id', seriesId)
      .eq('is_active', true)
      .order('variant_order', { ascending: true });

    if (error) throw error;

    // Group variants by dimensions
    const variantsByDimensions: { [dimensions: string]: ProductVariant[] } = {};
    
    variants?.forEach(variant => {
      const dimensions = variant.dimensions || 'Default';
      if (!variantsByDimensions[dimensions]) {
        variantsByDimensions[dimensions] = [];
      }
      const processedVariant = {
        ...variant,
        specifications: Array.isArray(variant.specifications) ? variant.specifications : 
                       variant.specifications ? [variant.specifications] : []
      };
      variantsByDimensions[dimensions].push(processedVariant);
    });

    return variantsByDimensions;
  } catch (error) {
    console.error('Error fetching variants by dimensions:', error);
    return {};
  }
};

export const getVariantDisplayName = (variant: ProductVariant): string => {
  const parts = [];
  
  if (variant.dimensions) parts.push(variant.dimensions);
  if (variant.finish_type && variant.finish_type !== 'PC') {
    parts.push(variant.finish_type === 'SS' ? 'Stainless Steel' : variant.finish_type);
  }
  if (variant.orientation && variant.orientation !== 'None') {
    parts.push(variant.orientation);
  }
  if (variant.door_type) parts.push(variant.door_type);
  if (variant.drawer_count) parts.push(`${variant.drawer_count} Drawer${variant.drawer_count > 1 ? 's' : ''}`);
  
  return parts.length > 0 ? parts.join(' - ') : variant.name;
};

export const getVariantAssetUrls = (variant: ProductVariant) => {
  const getAssetUrl = (path: string | null) => {
    if (!path) return null;
    
    // If it's already a full URL, return as is
    if (path.startsWith('http') || path.startsWith('//')) {
      return path;
    }
    
    // If it's a Supabase storage path, construct the full URL
    if (path.startsWith('products/')) {
      return supabase.storage.from('documents').getPublicUrl(path).data.publicUrl;
    }
    
    // For legacy paths, assume they're in public folder
    return path.startsWith('/') ? path : `/${path}`;
  };

  return {
    thumbnail: getAssetUrl(variant.thumbnail_path),
    model: getAssetUrl(variant.model_path),
    images: variant.additional_images?.map(img => getAssetUrl(img)).filter(Boolean) || []
  };
};