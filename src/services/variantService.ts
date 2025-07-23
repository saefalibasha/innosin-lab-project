import { supabase } from '@/integrations/supabase/client';

export interface WallCabinetVariant {
  id: string;
  product_code: string;
  name: string;
  dimensions: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
}

export const getWallCabinetVariants = async (seriesId: string): Promise<WallCabinetVariant[]> => {
  console.log('🔍 Fetching wall cabinet variants for series:', seriesId);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('parent_series_id', seriesId)
    .eq('is_active', true)
    .order('product_code');

  if (error) {
    console.error('❌ Error fetching variants:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ No variants found for series:', seriesId);
    return [];
  }

  // Filter out the parent series record and only keep actual variants
  const actualVariants = data.filter(variant => 
    variant.dimensions && // Must have dimensions
    variant.dimensions.trim() !== '' && // Not empty
    variant.dimensions !== 'null' && // Not null string
    variant.product_code !== variant.name // Product code should be different from name
  );

  console.log(`✅ Found ${actualVariants.length} actual variants out of ${data.length} total records`);

  const variants: WallCabinetVariant[] = actualVariants.map(variant => ({
    id: variant.id,
    product_code: variant.product_code,
    name: variant.name,
    dimensions: variant.dimensions,
    finish_type: variant.finish_type || 'PC',
    orientation: variant.orientation || 'None',
    door_type: variant.door_type || 'Solid',
    thumbnail_path: variant.thumbnail_path || '',
    model_path: variant.model_path || '',
    additional_images: variant.additional_images || []
  }));

  // Debug log to verify we have the right data
  console.log('🔧 Processed variants:', variants.map(v => ({
    code: v.product_code,
    dimensions: v.dimensions,
    door_type: v.door_type,
    orientation: v.orientation,
    finish: v.finish_type
  })));

  return variants;
};
