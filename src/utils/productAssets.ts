
import { Product, ProductVariant, ProductFinish } from '@/types/product';

// Define the base URL for Supabase storage
const STORAGE_BASE_URL = 'https://wfdbqfbodppniqzoxnyf.supabase.co/storage/v1/object/public/documents';

// Real uploaded assets mapping - Remove all placeholder references
const uploadedAssets: Record<string, {
  modelPath?: string;
  imagePath?: string;
  overviewPath?: string;
  variants?: Record<string, { modelPath?: string; imagePath?: string; }>;
}> = {
  // KS Series (Fume Hoods) - Real assets available
  'innosin-ks-700': {
    modelPath: `${STORAGE_BASE_URL}/products/innosin-ks-700/KS700.glb`,
    imagePath: `${STORAGE_BASE_URL}/products/innosin-ks-700/KS700.jpg`
  },
  'innosin-ks-750': {
    modelPath: `${STORAGE_BASE_URL}/products/innosin-ks-750/KS750.glb`,
    imagePath: `${STORAGE_BASE_URL}/products/innosin-ks-750/KS750.jpg`
  },
  'innosin-ks-800': {
    modelPath: `${STORAGE_BASE_URL}/products/innosin-ks-800/KS800.glb`,
    imagePath: `${STORAGE_BASE_URL}/products/innosin-ks-800/KS800.jpg`
  },
  'innosin-ks-850': {
    modelPath: `${STORAGE_BASE_URL}/products/innosin-ks-850/KS850.glb`,
    imagePath: `${STORAGE_BASE_URL}/products/innosin-ks-850/KS850.jpg`
  },
  'innosin-ks-900': {
    modelPath: `${STORAGE_BASE_URL}/products/innosin-ks-900/KS900.glb`,
    imagePath: `${STORAGE_BASE_URL}/products/innosin-ks-900/KS900.jpg`
  },
  'innosin-ks-1000': {
    modelPath: `${STORAGE_BASE_URL}/products/innosin-ks-1000/KS1000.glb`,
    imagePath: `${STORAGE_BASE_URL}/products/innosin-ks-1000/KS1000.jpg`
  },
  'innosin-ks-1200': {
    modelPath: `${STORAGE_BASE_URL}/products/innosin-ks-1200/KS1200.glb`,
    imagePath: `${STORAGE_BASE_URL}/products/innosin-ks-1200/KS1200.jpg`
  },

  // Open Rack Series - Real assets available
  'innosin-or-pc-3838': {
    modelPath: `${STORAGE_BASE_URL}/products/innosin-or-pc-3838/OR-PC-3838.glb`,
    imagePath: `${STORAGE_BASE_URL}/products/innosin-or-pc-3838/OR-PC-3838.jpg`
  }
};

// Overview images mapping
const overviewImages: Record<string, string> = {
  'mobile-cabinet-750': `${STORAGE_BASE_URL}/products/mobile-cabinet-overview/750mm-overview.jpg`,
  'mobile-cabinet-900': `${STORAGE_BASE_URL}/products/mobile-cabinet-overview/900mm-overview.jpg`
};

// Product definitions with real assets only
const productDefinitions: Product[] = [
  // KS Series (Fume Hoods) - Complete series with real assets
  {
    id: 'innosin-ks-700',
    name: 'KS700 Fume Hood',
    category: 'Innosin Lab',
    dimensions: '700×750×2350 mm',
    modelPath: uploadedAssets['innosin-ks-700'].modelPath!,
    thumbnail: uploadedAssets['innosin-ks-700'].imagePath!,
    images: [uploadedAssets['innosin-ks-700'].imagePath!],
    description: 'Compact laboratory fume hood with 700mm working width, ideal for smaller lab spaces.',
    fullDescription: 'The KS700 provides reliable containment and ventilation for chemical processes in a compact 700mm width design. Features advanced airflow control and safety monitoring systems.',
    specifications: [
      'Working width: 700mm',
      'Internal dimensions: 700×750×1200mm',
      'Sash opening: 800mm max',
      'Airflow velocity: 0.5 m/s',
      'Construction: Chemical-resistant materials'
    ]
  },
  {
    id: 'innosin-ks-750',
    name: 'KS750 Fume Hood',
    category: 'Innosin Lab',
    dimensions: '750×750×2350 mm',
    modelPath: uploadedAssets['innosin-ks-750'].modelPath!,
    thumbnail: uploadedAssets['innosin-ks-750'].imagePath!,
    images: [uploadedAssets['innosin-ks-750'].imagePath!],
    description: 'Standard laboratory fume hood with 750mm working width, perfect for routine applications.',
    fullDescription: 'The KS750 offers optimal balance of workspace and containment for standard laboratory operations. Equipped with variable air volume control and energy-efficient design.',
    specifications: [
      'Working width: 750mm',
      'Internal dimensions: 750×750×1200mm',
      'Sash opening: 800mm max',
      'Airflow velocity: 0.5 m/s',
      'VAV control system included'
    ]
  },
  {
    id: 'innosin-ks-800',
    name: 'KS800 Fume Hood',
    category: 'Innosin Lab',
    dimensions: '800×750×2350 mm',
    modelPath: uploadedAssets['innosin-ks-800'].modelPath!,
    thumbnail: uploadedAssets['innosin-ks-800'].imagePath!,
    images: [uploadedAssets['innosin-ks-800'].imagePath!],
    description: 'Wide laboratory fume hood with 800mm working width for enhanced workspace.',
    fullDescription: 'The KS800 provides expanded working area while maintaining excellent containment performance. Ideal for applications requiring additional lateral space.',
    specifications: [
      'Working width: 800mm',
      'Internal dimensions: 800×750×1200mm',
      'Sash opening: 800mm max',
      'Airflow velocity: 0.5 m/s',
      'Enhanced workspace design'
    ]
  },
  {
    id: 'innosin-ks-850',
    name: 'KS850 Fume Hood',
    category: 'Innosin Lab',
    dimensions: '850×750×2350 mm',
    modelPath: uploadedAssets['innosin-ks-850'].modelPath!,
    thumbnail: uploadedAssets['innosin-ks-850'].imagePath!,
    images: [uploadedAssets['innosin-ks-850'].imagePath!],
    description: 'Spacious laboratory fume hood with 850mm working width for complex procedures.',
    fullDescription: 'The KS850 delivers superior workspace flexibility for complex chemical procedures. Features advanced monitoring and control systems for maximum safety.',
    specifications: [
      'Working width: 850mm',
      'Internal dimensions: 850×750×1200mm',
      'Sash opening: 800mm max',
      'Airflow velocity: 0.5 m/s',
      'Advanced safety monitoring'
    ]
  },
  {
    id: 'innosin-ks-900',
    name: 'KS900 Fume Hood',
    category: 'Innosin Lab',
    dimensions: '900×750×2350 mm',
    modelPath: uploadedAssets['innosin-ks-900'].modelPath!,
    thumbnail: uploadedAssets['innosin-ks-900'].imagePath!,
    images: [uploadedAssets['innosin-ks-900'].imagePath!],
    description: 'Large laboratory fume hood with 900mm working width for extensive operations.',
    fullDescription: 'The KS900 offers maximum working space for extensive laboratory operations. Incorporates state-of-the-art containment technology and user-friendly controls.',
    specifications: [
      'Working width: 900mm',
      'Internal dimensions: 900×750×1200mm',
      'Sash opening: 800mm max',
      'Airflow velocity: 0.5 m/s',
      'Maximum workspace capacity'
    ]
  },
  {
    id: 'innosin-ks-1000',
    name: 'KS1000 Fume Hood',
    category: 'Innosin Lab',
    dimensions: '1000×750×2350 mm',
    modelPath: uploadedAssets['innosin-ks-1000'].modelPath!,
    thumbnail: uploadedAssets['innosin-ks-1000'].imagePath!,
    images: [uploadedAssets['innosin-ks-1000'].imagePath!],
    description: 'Extra-wide laboratory fume hood with 1000mm working width for specialized applications.',
    fullDescription: 'The KS1000 provides exceptional workspace for specialized applications requiring maximum lateral access. Designed for high-performance containment and energy efficiency.',
    specifications: [
      'Working width: 1000mm',
      'Internal dimensions: 1000×750×1200mm',
      'Sash opening: 800mm max',
      'Airflow velocity: 0.5 m/s',
      'Specialized application design'
    ]
  },
  {
    id: 'innosin-ks-1200',
    name: 'KS1200 Fume Hood',
    category: 'Innosin Lab',
    dimensions: '1200×750×2350 mm',
    modelPath: uploadedAssets['innosin-ks-1200'].modelPath!,
    thumbnail: uploadedAssets['innosin-ks-1200'].imagePath!,
    images: [uploadedAssets['innosin-ks-1200'].imagePath!],
    description: 'Premium extra-large laboratory fume hood with 1200mm working width.',
    fullDescription: 'The KS1200 represents the pinnacle of fume hood design, offering maximum workspace and advanced safety features for demanding laboratory environments.',
    specifications: [
      'Working width: 1200mm',
      'Internal dimensions: 1200×750×1200mm',
      'Sash opening: 800mm max',
      'Airflow velocity: 0.5 m/s',
      'Premium safety features'
    ]
  },

  // Open Rack Series - Real assets available
  {
    id: 'innosin-or-pc-3838',
    name: 'OR-PC-3838 Open Rack',
    category: 'Innosin Lab',
    dimensions: '380×380×1800 mm',
    modelPath: uploadedAssets['innosin-or-pc-3838'].modelPath!,
    thumbnail: uploadedAssets['innosin-or-pc-3838'].imagePath!,
    images: [uploadedAssets['innosin-or-pc-3838'].imagePath!],
    description: 'Versatile open rack storage system for laboratory equipment organization.',
    fullDescription: 'The OR-PC-3838 provides flexible storage solutions with adjustable shelving configuration. Perfect for organizing laboratory equipment and supplies with easy access.',
    specifications: [
      'Dimensions: 380×380×1800mm',
      'Adjustable shelving',
      'Open design for maximum accessibility',
      'Powder coat finish standard',
      'Load capacity: 50kg per shelf'
    ],
    finishes: [
      {
        type: 'powder-coat',
        name: 'Powder Coat (Standard)',
        modelPath: uploadedAssets['innosin-or-pc-3838'].modelPath!
      }
    ]
  },

  // Mobile Cabinet Series for 750mm height benches - Using overview image
  {
    id: 'innosin-mobile-cabinet-750',
    name: 'Mobile Cabinet Series (750mm Bench Height)',
    category: 'Innosin Lab',
    dimensions: 'Various sizes for 750mm benches',
    modelPath: `${STORAGE_BASE_URL}/products/mobile-cabinet-750/overview-model.glb`,
    thumbnail: overviewImages['mobile-cabinet-750'],
    overviewImage: overviewImages['mobile-cabinet-750'],
    images: [overviewImages['mobile-cabinet-750']],
    description: 'Complete mobile cabinet series designed for 750mm height laboratory benches.',
    fullDescription: 'Comprehensive range of mobile storage solutions specifically designed for 750mm height laboratory benches. Available in various configurations including single door, left/right hand orientations, drawer combinations, and specialized storage options.',
    specifications: [
      'Designed for 750mm bench height',
      'Multiple size configurations available',
      'Left and right hand orientations',
      'Drawer and door combinations',
      'Mobile design with locking casters',
      'Chemical-resistant finishes'
    ],
    variants: [
      {
        id: 'mc-pc-lh-505065',
        size: '500×500×650mm (LH)',
        dimensions: '500×500×650 mm',
        type: 'Single Door',
        orientation: 'LH',
        modelPath: `${STORAGE_BASE_URL}/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).glb`,
        thumbnail: `${STORAGE_BASE_URL}/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg`,
        images: [`${STORAGE_BASE_URL}/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg`]
      },
      {
        id: 'mc-pc-rh-505065',
        size: '500×500×650mm (RH)',
        dimensions: '500×500×650 mm',
        type: 'Single Door',
        orientation: 'RH',
        modelPath: `${STORAGE_BASE_URL}/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).glb`,
        thumbnail: `${STORAGE_BASE_URL}/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg`,
        images: [`${STORAGE_BASE_URL}/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg`]
      },
      {
        id: 'mc-pc-755065',
        size: '750×500×650mm',
        dimensions: '750×500×650 mm',
        type: 'Standard Cabinet',
        orientation: 'None',
        modelPath: `${STORAGE_BASE_URL}/products/innosin-mc-pc-755065/MC-PC (755065).glb`,
        thumbnail: `${STORAGE_BASE_URL}/products/innosin-mc-pc-755065/MC-PC (755065).jpg`,
        images: [`${STORAGE_BASE_URL}/products/innosin-mc-pc-755065/MC-PC (755065).jpg`]
      }
    ],
    finishes: [
      {
        type: 'powder-coat',
        name: 'Powder Coat (Standard)'
      },
      {
        type: 'stainless-steel',
        name: 'Stainless Steel (Premium)'
      }
    ]
  },

  // Mobile Cabinet Series for 900mm height benches - Using overview image
  {
    id: 'innosin-mobile-cabinet-900',
    name: 'Mobile Cabinet Series (900mm Bench Height)',
    category: 'Innosin Lab',
    dimensions: 'Various sizes for 900mm benches',
    modelPath: `${STORAGE_BASE_URL}/products/mobile-cabinet-900/overview-model.glb`,
    thumbnail: overviewImages['mobile-cabinet-900'],
    overviewImage: overviewImages['mobile-cabinet-900'],
    images: [overviewImages['mobile-cabinet-900']],
    description: 'Complete mobile cabinet series designed for 900mm height laboratory benches.',
    fullDescription: 'Comprehensive range of mobile storage solutions specifically designed for 900mm height laboratory benches. Available in various configurations including drawer combinations, door options, and specialized storage compartments.',
    specifications: [
      'Designed for 900mm bench height',
      'Multiple drawer configurations',
      'Combination storage options',
      'Heavy-duty construction',
      'Mobile design with locking casters',
      'Chemical-resistant finishes'
    ],
    variants: [
      {
        id: 'mc-pc-dwr6-905080',
        size: '900×500×800mm (6 Drawers)',
        dimensions: '900×500×800 mm',
        type: '6 Drawers',
        orientation: 'None',
        modelPath: `${STORAGE_BASE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).glb`,
        thumbnail: `${STORAGE_BASE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).jpg`,
        images: [`${STORAGE_BASE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).jpg`]
      },
      {
        id: 'mc-pc-dwr8-905080',
        size: '900×500×800mm (8 Drawers)',
        dimensions: '900×500×800 mm',
        type: '8 Drawers',
        orientation: 'None',
        modelPath: `${STORAGE_BASE_URL}/products/innosin-mc-pc-dwr8-905080/MC-PC-DWR8 (905080).glb`,
        thumbnail: `${STORAGE_BASE_URL}/products/innosin-mc-pc-dwr8-905080/MC-PC-DWR8 (905080).jpg`,
        images: [`${STORAGE_BASE_URL}/products/innosin-mc-pc-dwr8-905080/MC-PC-DWR8 (905080).jpg`]
      }
    ],
    finishes: [
      {
        type: 'powder-coat',
        name: 'Powder Coat (Standard)'
      },
      {
        type: 'stainless-steel',
        name: 'Stainless Steel (Premium)'
      }
    ]
  }
];

// Detection functions for real uploaded products only
export function detectUploadedProducts(): Product[] {
  return productDefinitions.filter(product => {
    // Only include products that have real assets (not placeholders)
    const hasRealAssets = uploadedAssets[product.id] && 
                         (uploadedAssets[product.id].modelPath || uploadedAssets[product.id].imagePath);
    const hasOverviewImage = product.overviewImage && !product.overviewImage.includes('placeholder');
    
    return hasRealAssets || hasOverviewImage;
  });
}

function enhanceProductWithAssets(product: Product): Product {
  const assets = uploadedAssets[product.id];
  
  if (!assets) {
    return product;
  }

  const enhanced: Product = {
    ...product,
    modelPath: assets.modelPath || product.modelPath,
    thumbnail: assets.imagePath || product.thumbnail,
    images: assets.imagePath ? [assets.imagePath, ...product.images.filter(img => img !== assets.imagePath)] : product.images
  };

  // Enhance variants if they exist
  if (product.variants && assets.variants) {
    enhanced.variants = product.variants.map(variant => {
      const variantAssets = assets.variants?.[variant.id];
      if (variantAssets) {
        return {
          ...variant,
          modelPath: variantAssets.modelPath || variant.modelPath,
          thumbnail: variantAssets.imagePath || variant.thumbnail,
          images: variantAssets.imagePath ? [variantAssets.imagePath, ...variant.images.filter(img => img !== variantAssets.imagePath)] : variant.images
        };
      }
      return variant;
    });
  }

  return enhanced;
}

// Main export functions - only return products with real assets
export function getProductsSync(): Product[] {
  const detectedProducts = detectUploadedProducts();
  return detectedProducts.map(enhanceProductWithAssets);
}

export function getCategories(): string[] {
  const products = getProductsSync();
  const categories = new Set(products.map(p => p.category));
  return Array.from(categories).sort();
}

export function getProductById(id: string): Product | undefined {
  const products = getProductsSync();
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  const products = getProductsSync();
  return products.filter(p => p.category === category);
}
