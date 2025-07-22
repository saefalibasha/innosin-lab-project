
import { Product, ProductVariant } from '@/types/product';

// Supabase storage base URL
const SUPABASE_STORAGE_URL = 'https://wfdbqfbodppniqzoxnyf.supabase.co/storage/v1/object/public/documents';

// Enhanced function to get Supabase asset URL
const getSupabaseAssetUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path; // Already a full URL
  }
  // Remove leading slash if present and construct Supabase URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${SUPABASE_STORAGE_URL}/${cleanPath}`;
};

// Function to enhance variants with proper asset URLs
const enhanceVariantWithAssets = (variant: ProductVariant, productFolder: string): ProductVariant => {
  return {
    ...variant,
    modelPath: getSupabaseAssetUrl(`${productFolder}/${variant.id}.glb`),
    thumbnail: getSupabaseAssetUrl(`${productFolder}/${variant.id}.jpg`),
    images: [getSupabaseAssetUrl(`${productFolder}/${variant.id}.jpg`)]
  };
};

// Function to enhance product with proper asset URLs
const enhanceProductWithAssets = (product: Product): Product => {
  const productFolder = `products/${product.id}`;
  
  // Enhanced main product assets with proper fallbacks
  const enhancedProduct: Product = {
    ...product,
    modelPath: product.modelPath || getSupabaseAssetUrl(`${productFolder}/${product.name}.glb`),
    thumbnail: product.thumbnail || getSupabaseAssetUrl(`${productFolder}/${product.name}.jpg`),
    images: product.images && product.images.length > 0 ? product.images : [getSupabaseAssetUrl(`${productFolder}/${product.name}.jpg`)],
    overviewImage: product.overviewImage || getSupabaseAssetUrl(`${productFolder}/overview.jpg`),
    seriesOverviewImage: product.seriesOverviewImage || product.overviewImage
  };

  // Enhance variants if they exist
  if (product.variants && product.variants.length > 0) {
    enhancedProduct.variants = product.variants.map(variant => 
      enhanceVariantWithAssets(variant, `products/${product.id}/variants`)
    );
  }

  return enhancedProduct;
};

// Updated KS Series data with actual asset paths
const kneeSpaceSeriesProducts: Product[] = [
  {
    id: 'laboratory-bench-knee-space-series',
    name: 'Laboratory Bench Knee Space Series',
    category: 'Innosin Lab',
    description: 'Ergonomic knee space units providing comfortable leg room for laboratory workstations',
    fullDescription: 'The Laboratory Bench Knee Space Series offers ergonomic solutions designed to provide optimal comfort for laboratory personnel during extended work periods. Available in multiple width configurations to accommodate various laboratory setups.',
    dimensions: 'Variable (700-1200mm width)',
    modelPath: '',
    thumbnail: '',
    images: [],
    specifications: [
      'Ergonomic design for extended comfort',
      'Durable construction materials', 
      'Easy integration with bench systems',
      'Professional laboratory finish',
      'Available in powder coat and stainless steel'
    ],
    variants: [
      {
        id: 'KS700',
        size: 'KS700',
        dimensions: '700×550×880 mm',
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'KS750', 
        size: 'KS750',
        dimensions: '750×550×880 mm',
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'KS800',
        size: 'KS800', 
        dimensions: '800×550×880 mm',
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'KS850',
        size: 'KS850',
        dimensions: '850×550×880 mm', 
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'KS900',
        size: 'KS900',
        dimensions: '900×550×880 mm',
        type: 'Knee Space', 
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'KS1000',
        size: 'KS1000',
        dimensions: '1000×550×880 mm',
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'KS1200',
        size: 'KS1200', 
        dimensions: '1200×550×880 mm',
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      }
    ],
    finishes: [
      {
        type: 'powder-coat',
        name: 'PC (Powder Coat)',
        price: 'Standard'
      },
      {
        type: 'stainless-steel', 
        name: 'SS (Stainless Steel)',
        price: 'Premium'
      }
    ]
  }
];

// Mobile Cabinet Series with proper asset paths and fixed series overview images
const mobileCabinetProducts: Product[] = [
  {
    id: 'innosin-mobile-cabinet-750mm',
    name: 'Mobile Cabinet Series for 750mm Bench',
    category: 'Innosin Lab',
    description: 'Mobile storage solutions designed for 750mm height laboratory benches',
    fullDescription: 'Comprehensive mobile cabinet series offering various configurations for 750mm bench height applications.',
    dimensions: 'Variable',
    modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-755065/MC-PC (755065).glb'),
    thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-755065/MC-PC (755065).jpg'),
    images: [getSupabaseAssetUrl('products/innosin-mc-pc-755065/MC-PC (755065).jpg')],
    overviewImage: getSupabaseAssetUrl('products/innosin-mc-pc-755065/MC-PC (755065).jpg'),
    seriesOverviewImage: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
    specifications: ['Mobile Design', 'Locking Casters', 'Chemical Resistant'],
    variants: [
      {
        id: 'innosin-mc-pc-755065',
        size: '750×500×650 mm',
        dimensions: '750×500×650 mm',
        type: 'Single Door',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-755065/MC-PC (755065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-755065/MC-PC (755065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-755065/MC-PC (755065).jpg')]
      },
      {
        id: 'innosin-mc-pc-lh-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm', 
        type: 'Hand Configuration',
        orientation: 'LH',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg')]
      },
      {
        id: 'innosin-mc-pc-rh-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm',
        type: 'Hand Configuration', 
        orientation: 'RH',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg')]
      },
      {
        id: 'innosin-mc-pc-dwr2-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm',
        type: '2 Drawers',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-dwr2-505065/MC-PC-DWR2 (505065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-dwr2-505065/MC-PC-DWR2 (505065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-dwr2-505065/MC-PC-DWR2 (505065).jpg')]
      },
      {
        id: 'innosin-mc-pc-dwr3-1-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm',
        type: '3 Drawers Config 1',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-dwr3-1-505065/MC-PC-DRW3-1 (505065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-dwr3-1-505065/MC-PC-DRW3-1 (505065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-dwr3-1-505065/MC-PC-DRW3-1 (505065).jpg')]
      },
      {
        id: 'innosin-mc-pc-dwr3-2-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm',
        type: '3 Drawers Config 2',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-dwr3-2-505065/MC-PC-DRW3-2 (505065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-dwr3-2-505065/MC-PC-DRW3-2 (505065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-dwr3-2-505065/MC-PC-DRW3-2 (505065).jpg')]
      },
      {
        id: 'innosin-mc-pc-dwr6-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm',
        type: '6 Drawers',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-dwr6-505065/MC-PC-DWR6 (505065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-dwr6-505065/MC-PC-DWR6 (505065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-dwr6-505065/MC-PC-DWR6 (505065).jpg')]
      },
      {
        id: 'innosin-mcc-pc-755065',
        size: '750×500×650 mm',
        dimensions: '750×500×650 mm',
        type: 'Combination Cabinet',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mcc-pc-755065/MCC-PC (755065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mcc-pc-755065/MCC-PC (755065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mcc-pc-755065/MCC-PC (755065).jpg')]
      },
      {
        id: 'innosin-mcc-pc-lh-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm',
        type: 'Combination LH',
        orientation: 'LH',
        modelPath: getSupabaseAssetUrl('products/innosin-mcc-pc-lh-505065/MCC-PC-LH (505065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mcc-pc-lh-505065/MCC-PC-LH (505065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mcc-pc-lh-505065/MCC-PC-LH (505065).jpg')]
      },
      {
        id: 'innosin-mcc-pc-rh-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm',
        type: 'Combination RH',
        orientation: 'RH',
        modelPath: getSupabaseAssetUrl('products/innosin-mcc-pc-rh-505065/MCC-PC-RH (505065).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mcc-pc-rh-505065/MCC-PC-RH (505065).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mcc-pc-rh-505065/MCC-PC-RH (505065).jpg')]
      }
    ],
    finishes: [
      {
        type: 'powder-coat',
        name: 'Powder Coat'
      },
      {
        type: 'stainless-steel',
        name: 'Stainless Steel'
      }
    ]
  },
  {
    id: 'innosin-mobile-cabinet-900mm',
    name: 'Mobile Cabinet Series for 900mm Bench', 
    category: 'Innosin Lab',
    description: 'Mobile storage solutions designed for 900mm height laboratory benches',
    fullDescription: 'Enhanced mobile cabinet series offering increased storage capacity for 900mm bench height applications.',
    dimensions: 'Variable',
    modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-755080/MC-PC (755080).glb'),
    thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-755080/MC-PC (755080).jpg'),
    images: [getSupabaseAssetUrl('products/innosin-mc-pc-755080/MC-PC (755080).jpg')],
    overviewImage: getSupabaseAssetUrl('products/innosin-mc-pc-755080/MC-PC (755080).jpg'),
    seriesOverviewImage: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
    specifications: ['Enhanced Height', 'Mobile Design', 'Locking Casters'],
    variants: [
      {
        id: 'innosin-mc-pc-755080',
        size: '750×500×800 mm',
        dimensions: '750×500×800 mm',
        type: 'Single Door',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-755080/MC-PC (755080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-755080/MC-PC (755080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-755080/MC-PC (755080).jpg')]
      },
      {
        id: 'innosin-mc-pc-lh-505080',
        size: '500×500×800 mm', 
        dimensions: '500×500×800 mm',
        type: 'Hand Configuration',
        orientation: 'LH',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).jpg')]
      },
      {
        id: 'innosin-mc-pc-rh-505080',
        size: '500×500×800 mm',
        dimensions: '500×500×800 mm',
        type: 'Hand Configuration',
        orientation: 'RH',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).jpg')]
      },
      {
        id: 'innosin-mc-pc-dwr2-505080',
        size: '500×500×800 mm',
        dimensions: '500×500×800 mm',
        type: '2 Drawers',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-dwr2-505080/MC-PC-DWR2 (505080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-dwr2-505080/MC-PC-DWR2 (505080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-dwr2-505080/MC-PC-DWR2 (505080).jpg')]
      },
      {
        id: 'innosin-mc-pc-dwr3-505080',
        size: '500×500×800 mm',
        dimensions: '500×500×800 mm',
        type: '3 Drawers',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-dwr3-505080/MC-PC-DWR3 (505080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-dwr3-505080/MC-PC-DWR3 (505080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-dwr3-505080/MC-PC-DWR3 (505080).jpg')]
      },
      {
        id: 'innosin-mc-pc-dwr4-505080',
        size: '500×500×800 mm',
        dimensions: '500×500×800 mm',
        type: '4 Drawers',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-dwr4-505080/MC-PC-DWR4 (505080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-dwr4-505080/MC-PC-DWR4 (505080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-dwr4-505080/MC-PC-DWR4 (505080).jpg')]
      },
      {
        id: 'innosin-mc-pc-dwr6-905080',
        size: '900×500×800 mm',
        dimensions: '900×500×800 mm',
        type: '6 Drawers Wide',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).jpg')]
      },
      {
        id: 'innosin-mc-pc-dwr8-905080',
        size: '900×500×800 mm',
        dimensions: '900×500×800 mm',
        type: '8 Drawers Wide',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-dwr8-905080/MC-PC-DWR8 (905080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-dwr8-905080/MC-PC-DWR8 (905080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-dwr8-905080/MC-PC-DWR8 (905080).jpg')]
      },
      {
        id: 'innosin-mcc-pc-755080',
        size: '750×500×800 mm',
        dimensions: '750×500×800 mm',
        type: 'Combination Cabinet',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-mcc-pc-755080/MCC-PC (755080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mcc-pc-755080/MCC-PC (755080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mcc-pc-755080/MCC-PC (755080).jpg')]
      },
      {
        id: 'innosin-mcc-pc-lh-505080',
        size: '500×500×800 mm',
        dimensions: '500×500×800 mm',
        type: 'Combination LH',
        orientation: 'LH',
        modelPath: getSupabaseAssetUrl('products/innosin-mcc-pc-lh-505080/MCC-PC-LH (505080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mcc-pc-lh-505080/MCC-PC-LH (505080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mcc-pc-lh-505080/MCC-PC-LH (505080).jpg')]
      },
      {
        id: 'innosin-mcc-pc-rh-505080',
        size: '500×500×800 mm',
        dimensions: '500×500×800 mm',
        type: 'Combination RH',
        orientation: 'RH',
        modelPath: getSupabaseAssetUrl('products/innosin-mcc-pc-rh-505080/MCC-PC-RH (505080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mcc-pc-rh-505080/MCC-PC-RH (505080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mcc-pc-rh-505080/MCC-PC-RH (505080).jpg')]
      },
      {
        id: 'innosin-mc-pc-lh-905080',
        size: '900×500×800 mm',
        dimensions: '900×500×800 mm',
        type: 'Hand Configuration Wide',
        orientation: 'LH',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-lh-905080/MC-PC-LH (905080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-lh-905080/MC-PC-LH (905080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-lh-905080/MC-PC-LH (905080).jpg')]
      },
      {
        id: 'innosin-mc-pc-rh-905080',
        size: '900×500×800 mm',
        dimensions: '900×500×800 mm',
        type: 'Hand Configuration Wide',
        orientation: 'RH',
        modelPath: getSupabaseAssetUrl('products/innosin-mc-pc-rh-905080/MC-PC-RH (905080).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-mc-pc-rh-905080/MC-PC-RH (905080).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-mc-pc-rh-905080/MC-PC-RH (905080).jpg')]
      }
    ],
    finishes: [
      {
        type: 'powder-coat',
        name: 'Powder Coat'
      },
      {
        type: 'stainless-steel',
        name: 'Stainless Steel'
      }
    ]
  }
];

// Other cabinet products with proper asset paths
const otherCabinetProducts: Product[] = [
  {
    id: 'innosin-wall-cabinet',
    name: 'Wall Cabinet Series',
    category: 'Innosin Lab',
    description: 'Space-efficient wall-mounted storage solutions',
    fullDescription: 'Professional wall-mounted cabinets designed to maximize laboratory storage while minimizing floor space usage.',
    dimensions: '750×330×750 mm',
    modelPath: getSupabaseAssetUrl('products/innosin-wcg-pc-753375/WCG-PC (753375).glb'),
    thumbnail: getSupabaseAssetUrl('products/innosin-wcg-pc-753375/WCG-PC (753375).jpg'),
    images: [getSupabaseAssetUrl('products/innosin-wcg-pc-753375/WCG-PC (753375).jpg')],
    specifications: ['Wall Mounted', 'Space Efficient', 'Glass Door Options'],
    variants: [
      {
        id: 'innosin-wcg-pc-753375',
        size: '750×330×750 mm',
        dimensions: '750×330×750 mm',
        type: 'Glass Door',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-wcg-pc-753375/WCG-PC (753375).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-wcg-pc-753375/WCG-PC (753375).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-wcg-pc-753375/WCG-PC (753375).jpg')]
      }
    ],
    finishes: [
      {
        type: 'powder-coat',
        name: 'Powder Coat'
      },
      {
        type: 'stainless-steel',
        name: 'Stainless Steel'
      }
    ]
  },
  {
    id: 'innosin-tall-cabinet',
    name: 'Tall Cabinet Glass Door Series',
    category: 'Innosin Lab',
    description: 'Tall storage cabinets with glass doors for maximum visibility',
    fullDescription: 'High-capacity tall cabinets featuring glass doors for easy content identification and secure storage.',
    dimensions: '750×400×1800 mm',
    modelPath: getSupabaseAssetUrl('products/innosin-tcg-pc-754018/TCG-PC (754018).glb'),
    thumbnail: getSupabaseAssetUrl('products/innosin-tcg-pc-754018/TCG-PC (754018).jpg'),
    images: [getSupabaseAssetUrl('products/innosin-tcg-pc-754018/TCG-PC (754018).jpg')],
    specifications: ['Maximum Height', 'Glass Door', 'Secure Storage'],
    variants: [
      {
        id: 'innosin-tcg-pc-754018',
        size: '750×400×1800 mm',
        dimensions: '750×400×1800 mm',
        type: 'Glass Door',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-tcg-pc-754018/TCG-PC (754018).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-tcg-pc-754018/TCG-PC (754018).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-tcg-pc-754018/TCG-PC (754018).jpg')]
      }
    ],
    finishes: [
      {
        type: 'powder-coat',
        name: 'Powder Coat'
      },
      {
        type: 'stainless-steel', 
        name: 'Stainless Steel'
      }
    ]
  },
  {
    id: 'innosin-open-rack',
    name: 'Open Rack Series',
    category: 'Innosin Lab',
    description: 'Open rack storage system for maximum accessibility',
    fullDescription: 'Versatile open rack design providing maximum accessibility and flexibility for laboratory equipment storage.',
    dimensions: '380×380×1800 mm',
    modelPath: getSupabaseAssetUrl('products/innosin-or-pc-604518/OR-PC-3838 (604518).glb'),
    thumbnail: getSupabaseAssetUrl('products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg'),
    images: [getSupabaseAssetUrl('products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg')],
    specifications: ['Open Design', 'Maximum Accessibility', 'Adjustable Shelves'],
    variants: [
      {
        id: 'innosin-or-pc-604518',
        size: '380×380×1800 mm',
        dimensions: '380×380×1800 mm',
        type: 'Standard',
        orientation: 'None',
        modelPath: getSupabaseAssetUrl('products/innosin-or-pc-604518/OR-PC-3838 (604518).glb'),
        thumbnail: getSupabaseAssetUrl('products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg'),
        images: [getSupabaseAssetUrl('products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg')]
      }
    ],
    finishes: [
      {
        type: 'powder-coat',
        name: 'Powder Coat'
      }
    ]
  }
];

// Combine all products - no enhancement needed as URLs are already proper
const allInnosinProducts = [
  ...kneeSpaceSeriesProducts,
  ...mobileCabinetProducts, 
  ...otherCabinetProducts
];

// Export products without unnecessary enhancement
export const getProductsSync = (): Product[] => {
  return allInnosinProducts;
};

// Get unique categories
export const getCategories = (): string[] => {
  const categories = allInnosinProducts.map(product => product.category);
  return [...new Set(categories)];
};

// Simplified debug function
export const debugAssetUrls = (productId: string) => {
  const product = allInnosinProducts.find(p => p.id === productId);
  if (product) {
    console.log(`🔍 Debug assets for ${productId}:`, {
      modelPath: product.modelPath,
      thumbnail: product.thumbnail,
      images: product.images,
      overviewImage: product.overviewImage
    });
  }
};
