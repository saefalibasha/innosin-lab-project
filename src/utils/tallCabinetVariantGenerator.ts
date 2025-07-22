
// Utility to generate missing Stainless Steel variants for Tall Cabinet Series
export interface TallCabinetVariant {
  product_code: string;
  name: string;
  dimensions: string;
  door_type: string;
  finish_type: string;
  category: string;
  product_series: string;
  variant_type: string;
  orientation: string;
  description: string;
  full_description: string;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
  is_active: boolean;
  parent_series_id: string;
}

export const generateTallCabinetSSVariants = (
  existingVariants: any[],
  seriesId: string
): TallCabinetVariant[] => {
  const pcVariants = existingVariants.filter(v => v.finish_type === 'PC');
  const ssVariants: TallCabinetVariant[] = [];

  pcVariants.forEach(pcVariant => {
    // Generate corresponding SS variant
    const ssProductCode = pcVariant.product_code.replace('-PC-', '-SS-');
    
    // Check if SS variant already exists
    const ssExists = existingVariants.some(v => 
      v.product_code === ssProductCode || 
      (v.finish_type === 'SS' && v.dimensions === pcVariant.dimensions && v.door_type === pcVariant.door_type)
    );

    if (!ssExists) {
      const ssVariant: TallCabinetVariant = {
        product_code: ssProductCode,
        name: pcVariant.name.replace('Powder Coat', 'Stainless Steel'),
        dimensions: pcVariant.dimensions,
        door_type: pcVariant.door_type,
        finish_type: 'SS',
        category: pcVariant.category,
        product_series: pcVariant.product_series,
        variant_type: pcVariant.variant_type || 'standard',
        orientation: pcVariant.orientation || 'None',
        description: pcVariant.description?.replace('Powder Coat', 'Stainless Steel') || 
                    `Tall cabinet with ${pcVariant.door_type?.toLowerCase() || 'solid'} door - Stainless Steel finish`,
        full_description: pcVariant.full_description?.replace('Powder Coat', 'Stainless Steel') || 
                         `Professional tall cabinet with ${pcVariant.door_type?.toLowerCase() || 'solid'} door featuring stainless steel construction for superior durability and chemical resistance.`,
        thumbnail_path: pcVariant.thumbnail_path?.replace('-PC-', '-SS-') || '',
        model_path: pcVariant.model_path?.replace('-PC-', '-SS-') || '',
        additional_images: (pcVariant.additional_images || []).map((img: string) => img.replace('-PC-', '-SS-')),
        is_active: true,
        parent_series_id: seriesId
      };

      ssVariants.push(ssVariant);
    }
  });

  return ssVariants;
};

export const tallCabinetDimensions = [
  '600×400×1800 mm',
  '750×400×1800 mm',
  '900×400×1800 mm',
  '1200×400×1800 mm',
  '600×500×1800 mm',
  '750×500×1800 mm',
  '900×500×1800 mm',
  '1200×500×1800 mm'
];

export const doorTypes = ['Solid', 'Glass'];
export const finishTypes = ['PC', 'SS'];

// Generate standardized product codes
export const generateTallCabinetProductCode = (
  dimensions: string,
  doorType: string,
  finishType: string
): string => {
  // Extract width from dimensions (e.g., "750×400×1800 mm" -> "750")
  const width = dimensions.split('×')[0];
  const depth = dimensions.split('×')[1];
  
  // Create door type code
  const doorCode = doorType === 'Glass' ? 'G' : 'S';
  
  // Create unique identifier from dimensions
  const dimensionCode = `${width}${depth}`;
  
  return `TC${doorCode}-${finishType}-${dimensionCode}`;
};
