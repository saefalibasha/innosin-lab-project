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
    
    // Enhanced performance monitoring
    const startTime = performance.now();
    
    // Fetch series parents with optimized query
    let seriesQuery = supabase
      .from('products')
      .select('*')
      .eq('is_series_parent', true)
      .eq('is_active', true)
      .order('series_order', { ascending: true });

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

    // Enhanced variant fetching with performance optimization
    const seriesWithVariants = await Promise.all(
      seriesData.map(async (series) => {
        console.log('🔍 Fetching variants for series:', series.id, series.name);
        
        const variantStartTime = performance.now();
        
        const { data: variants, error: variantsError } = await supabase
          .from('products')
          .select('*')
          .eq('parent_series_id', series.id)
          .eq('is_active', true)
          .order('variant_order', { ascending: true });

        const variantEndTime = performance.now();
        console.log(`⏱️ Variant fetch for series ${series.id} took ${variantEndTime - variantStartTime}ms`);

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

        // Enhanced variant analysis with validation
        const glassVariants = processedVariants.filter(v => v.door_type === 'Glass');
        const solidVariants = processedVariants.filter(v => v.door_type === 'Solid');
        
        console.log('✅ Processed variants for series:', series.id, {
          total: processedVariants.length,
          glass: glassVariants.length,
          solid: solidVariants.length,
          doorTypes: [...new Set(processedVariants.map(v => v.door_type))],
          dimensions: [...new Set(processedVariants.map(v => v.dimensions))],
          orientations: [...new Set(processedVariants.map(v => v.orientation))],
          finishes: [...new Set(processedVariants.map(v => v.finish_type))]
        });

        // Validate expected variants are present
        if (series.name.toLowerCase().includes('wall cabinet')) {
          validateWallCabinetVariants(processedVariants);
        }

        return {
          ...series,
          variants: processedVariants
        };
      })
    );

    const endTime = performance.now();
    console.log(`🎯 Total fetchSeriesWithVariants took ${endTime - startTime}ms`);
    console.log('🎯 Final series with variants:', seriesWithVariants);
    
    return seriesWithVariants;
  } catch (error) {
    console.error('❌ Error in fetchSeriesWithVariants:', error);
    return [];
  }
};

// Enhanced wall cabinet variant validation
const validateWallCabinetVariants = (variants: ProductVariant[]) => {
  console.log('🔍 Validating wall cabinet variants...');
  
  const expectedSmallDimensions = ['450x330x750mm', '500x330x750mm', '550x330x750mm', '600x330x750mm'];
  const expectedLargeDimensions = ['750x330x750mm', '800x330x750mm', '900x330x750mm', '1000x330x750mm'];
  const expectedOrientations = ['Left-Handed', 'Right-Handed'];
  const expectedDoorTypes = ['Glass', 'Solid'];
  const expectedFinishes = ['PC', 'SS'];
  
  let missingVariants = 0;
  
  // Check small dimensions (need orientations)
  expectedSmallDimensions.forEach(dimension => {
    expectedDoorTypes.forEach(doorType => {
      expectedOrientations.forEach(orientation => {
        expectedFinishes.forEach(finish => {
          const exists = variants.some(v => 
            v.dimensions === dimension && 
            v.door_type === doorType && 
            v.orientation === orientation &&
            v.finish_type === finish
          );
          if (!exists) {
            console.warn(`⚠️ Missing variant: ${dimension} ${doorType} ${orientation} ${finish}`);
            missingVariants++;
          }
        });
      });
    });
  });
  
  // Check large dimensions (no orientations needed)
  expectedLargeDimensions.forEach(dimension => {
    expectedDoorTypes.forEach(doorType => {
      expectedFinishes.forEach(finish => {
        const exists = variants.some(v => 
          v.dimensions === dimension && 
          v.door_type === doorType && 
          (v.orientation === 'None' || v.orientation === '' || !v.orientation) &&
          v.finish_type === finish
        );
        if (!exists) {
          console.warn(`⚠️ Missing variant: ${dimension} ${doorType} ${finish} (no orientation)`);
          missingVariants++;
        }
      });
    });
  });
  
  if (missingVariants > 0) {
    console.error(`❌ Found ${missingVariants} missing wall cabinet variants`);
  } else {
    console.log('✅ All expected wall cabinet variants are present');
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

// Get variants grouped by configuration (excluding finish)
export const getVariantsByConfiguration = (variants: ProductVariant[]) => {
  const configurationMap = new Map<string, ProductVariant[]>();
  
  variants.forEach(variant => {
    const dimensionWidth = extractDimensionWidth(variant.dimensions);
    const orientation = dimensionWidth < 750 ? variant.orientation : 'None';
    
    // Create configuration key (dimension + door type + orientation, NO FINISH)
    const configKey = `${variant.dimensions}|${variant.door_type}|${orientation}`;
    
    if (!configurationMap.has(configKey)) {
      configurationMap.set(configKey, []);
    }
    
    configurationMap.get(configKey)!.push(variant);
  });
  
  console.log('📊 Variants grouped by configuration:', configurationMap);
  return configurationMap;
};

// Enhanced dimension width extraction
const extractDimensionWidth = (dimensions: string): number => {
  if (!dimensions) return 0;
  
  // Handle formats like "450x330x750mm", "450×330×750mm", "450 x 330 x 750 mm"
  const cleanDimensions = dimensions.replace(/[^\d×x]/g, '');
  const match = cleanDimensions.match(/(\d+)/);
  
  if (!match) return 0;
  
  return parseInt(match[1]);
};

// Validate that glass and solid dimensions match
export const validateDimensionParity = (variants: ProductVariant[]): {
  isValid: boolean;
  mismatches: string[];
} => {
  const dimensionDoorTypeMap = new Map<string, Set<string>>();
  
  variants.forEach(variant => {
    const key = `${variant.dimensions}|${variant.orientation || 'None'}`;
    if (!dimensionDoorTypeMap.has(key)) {
      dimensionDoorTypeMap.set(key, new Set());
    }
    dimensionDoorTypeMap.get(key)!.add(variant.door_type);
  });
  
  const mismatches: string[] = [];
  
  dimensionDoorTypeMap.forEach((doorTypes, key) => {
    if (!doorTypes.has('Glass') || !doorTypes.has('Solid')) {
      mismatches.push(`${key}: Missing ${doorTypes.has('Glass') ? 'Solid' : 'Glass'} variant`);
    }
  });
  
  return {
    isValid: mismatches.length === 0,
    mismatches
  };
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

// Updated variant validation for new flow
export const validateVariantCompleteness = (variants: ProductVariant[]): {
  isComplete: boolean;
  missingGlassVariants: string[];
  missingSolidVariants: string[];
  missingOrientations: string[];
  dimensionParity: { isValid: boolean; mismatches: string[] };
} => {
  const expectedDimensions = [
    '450x330x750mm', '500x330x750mm', '550x330x750mm', '600x330x750mm',
    '750x330x750mm', '800x330x750mm', '900x330x750mm', '1000x330x750mm'
  ];
  
  const expectedOrientations = ['Left-Handed', 'Right-Handed'];
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
            v.orientation === orientation
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
  
  // Validate dimension parity
  const dimensionParity = validateDimensionParity(variants);
  
  return {
    isComplete: missingGlassVariants.length === 0 && missingSolidVariants.length === 0,
    missingGlassVariants,
    missingSolidVariants,
    missingOrientations,
    dimensionParity
  };
};
