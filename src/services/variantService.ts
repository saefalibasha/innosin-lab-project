
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
    console.log('🚀 fetchSeriesWithVariants called with seriesSlug:', seriesSlug);
    
    // Fetch series parents with enhanced error handling
    let seriesQuery = supabase
      .from('products')
      .select('*')
      .eq('is_series_parent', true)
      .eq('is_active', true);

    if (seriesSlug) {
      seriesQuery = seriesQuery.eq('series_slug', seriesSlug);
    }

    const { data: seriesData, error: seriesError } = await seriesQuery;
    
    if (seriesError) {
      console.error('❌ Error fetching series:', seriesError);
      throw seriesError;
    }

    if (!seriesData || seriesData.length === 0) {
      console.warn('⚠️ No series found for slug:', seriesSlug);
      return [];
    }

    console.log('📦 Found series data:', seriesData);

    // Fetch variants for each series with enhanced querying
    const seriesWithVariants = await Promise.all(
      seriesData.map(async (series) => {
        console.log('🔍 Fetching variants for series:', series.id, series.name);
        
        const { data: variants, error: variantsError } = await supabase
          .from('products')
          .select('*')
          .eq('parent_series_id', series.id)
          .eq('is_active', true)
          .order('variant_order', { ascending: true });

        if (variantsError) {
          console.error('❌ Error fetching variants for series:', series.id, variantsError);
          return {
            ...series,
            variants: []
          };
        }

        const processedVariants = (variants || []).map(v => ({
          ...v,
          specifications: Array.isArray(v.specifications) ? v.specifications : 
                         v.specifications ? [v.specifications] : []
        }));

        console.log('✅ Processed variants for series:', series.id, {
          total: processedVariants.length,
          glass: processedVariants.filter(v => v.door_type === 'Glass').length,
          solid: processedVariants.filter(v => v.door_type === 'Solid').length,
          doorTypes: [...new Set(processedVariants.map(v => v.door_type))],
          dimensions: [...new Set(processedVariants.map(v => v.dimensions))],
          orientations: [...new Set(processedVariants.map(v => v.orientation))]
        });

        return {
          ...series,
          variants: processedVariants
        };
      })
    );

    console.log('🎯 Final series with variants:', seriesWithVariants);
    return seriesWithVariants;
  } catch (error) {
    console.error('❌ Error in fetchSeriesWithVariants:', error);
    return [];
  }
};

export const fetchVariantsByDimensions = async (seriesId: string): Promise<{
  [dimensions: string]: ProductVariant[]
}> => {
  try {
    console.log('🚀 fetchVariantsByDimensions called with seriesId:', seriesId);
    
    const { data: variants, error } = await supabase
      .from('products')
      .select('*')
      .eq('parent_series_id', seriesId)
      .eq('is_active', true)
      .order('variant_order', { ascending: true });

    if (error) {
      console.error('❌ Error fetching variants by dimensions:', error);
      throw error;
    }

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

    console.log('✅ Variants grouped by dimensions:', variantsByDimensions);
    return variantsByDimensions;
  } catch (error) {
    console.error('❌ Error in fetchVariantsByDimensions:', error);
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

// Enhanced variant validation
export const validateVariantCompleteness = (variants: ProductVariant[]): {
  isComplete: boolean;
  missingGlassVariants: string[];
  missingSolidVariants: string[];
  missingOrientations: string[];
} => {
  const expectedDimensions = [
    '450x330x750mm', '500x330x750mm', '550x330x750mm', '600x330x750mm',
    '750x330x750mm', '800x330x750mm', '900x330x750mm', '1000x330x750mm'
  ];
  
  const expectedOrientations = ['LH', 'RH'];
  const expectedDoorTypes = ['Glass', 'Solid'];
  
  const missingGlassVariants: string[] = [];
  const missingSolidVariants: string[] = [];
  const missingOrientations: string[] = [];
  
  expectedDimensions.forEach(dimension => {
    expectedDoorTypes.forEach(doorType => {
      const dimensionWidth = parseInt(dimension.split('x')[0]);
      
      if (dimensionWidth < 750) {
        // Small dimensions need orientations
        expectedOrientations.forEach(orientation => {
          const exists = variants.some(v => 
            v.dimensions === dimension && 
            v.door_type === doorType && 
            (v.orientation === orientation || 
             (orientation === 'LH' && v.orientation === 'Left-Handed') ||
             (orientation === 'RH' && v.orientation === 'Right-Handed'))
          );
          
          if (!exists) {
            const key = `${dimension}-${doorType}-${orientation}`;
            if (doorType === 'Glass') {
              missingGlassVariants.push(key);
            } else {
              missingSolidVariants.push(key);
            }
          }
        });
      } else {
        // Large dimensions don't need orientations
        const exists = variants.some(v => 
          v.dimensions === dimension && 
          v.door_type === doorType &&
          (!v.orientation || v.orientation === 'None' || v.orientation === '')
        );
        
        if (!exists) {
          const key = `${dimension}-${doorType}`;
          if (doorType === 'Glass') {
            missingGlassVariants.push(key);
          } else {
            missingSolidVariants.push(key);
          }
        }
      }
    });
  });
  
  return {
    isComplete: missingGlassVariants.length === 0 && missingSolidVariants.length === 0,
    missingGlassVariants,
    missingSolidVariants,
    missingOrientations
  };
};
