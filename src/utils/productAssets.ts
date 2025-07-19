

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
  
  // Enhance main product assets
  const enhancedProduct: Product = {
    ...product,
    modelPath: getSupabaseAssetUrl(`${productFolder}/${product.name}.glb`),
    thumbnail: getSupabaseAssetUrl(`${productFolder}/${product.name}.jpg`),
    images: [getSupabaseAssetUrl(`${productFolder}/${product.name}.jpg`)],
    overviewImage: product.overviewImage ? getSupabaseAssetUrl(`${productFolder}/overview.jpg`) : undefined
  };

  // Enhance variants if they exist
  if (product.variants && product.variants.length > 0) {
    enhancedProduct.variants = product.variants.map(variant => 
      enhanceVariantWithAssets(variant, `products/${product.name}/variants`)
    );
  }

  return enhancedProduct;
};

// Updated Knee Space Series data with correct naming and specifications
const kneeSpaceSeriesProducts: Product[] = [
  {
    id: 'innosin-laboratory-bench-knee-space',
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
        id: 'innosin-ks-700',
        size: 'KS700',
        dimensions: '700×550×880 mm',
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-ks-750', 
        size: 'KS750',
        dimensions: '750×550×880 mm',
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-ks-800',
        size: 'KS800', 
        dimensions: '800×550×880 mm',
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-ks-850',
        size: 'KS850',
        dimensions: '850×550×880 mm', 
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-ks-900',
        size: 'KS900',
        dimensions: '900×550×880 mm',
        type: 'Knee Space', 
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-ks-1000',
        size: 'KS1000',
        dimensions: '1000×550×880 mm',
        type: 'Knee Space',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-ks-1200',
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

// Mobile Cabinet Series with proper variant structure
const mobileCabinetProducts: Product[] = [
  {
    id: 'innosin-mobile-cabinet-750mm',
    name: 'Mobile Cabinet Series for 750mm Bench',
    category: 'Innosin Lab',
    description: 'Mobile storage solutions designed for 750mm height laboratory benches',
    fullDescription: 'Comprehensive mobile cabinet series offering various configurations for 750mm bench height applications.',
    dimensions: 'Variable',
    modelPath: '',
    thumbnail: '',
    images: [],
    specifications: ['Mobile Design', 'Locking Casters', 'Chemical Resistant'],
    variants: [
      {
        id: 'innosin-mc-pc-755065',
        size: '750×500×650 mm',
        dimensions: '750×500×650 mm',
        type: 'Single Door',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-mc-pc-lh-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm', 
        type: 'Hand Configuration',
        orientation: 'LH',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-mc-pc-rh-505065',
        size: '500×500×650 mm',
        dimensions: '500×500×650 mm',
        type: 'Hand Configuration', 
        orientation: 'RH',
        modelPath: '',
        thumbnail: '',
        images: []
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
    modelPath: '',
    thumbnail: '',
    images: [],
    specifications: ['Enhanced Height', 'Mobile Design', 'Locking Casters'],
    variants: [
      {
        id: 'innosin-mc-pc-755080',
        size: '750×500×800 mm',
        dimensions: '750×500×800 mm',
        type: 'Single Door',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-mc-pc-lh-505080',
        size: '500×500×800 mm', 
        dimensions: '500×500×800 mm',
        type: 'Hand Configuration',
        orientation: 'LH',
        modelPath: '',
        thumbnail: '',
        images: []
      },
      {
        id: 'innosin-mc-pc-rh-505080',
        size: '500×500×800 mm',
        dimensions: '500×500×800 mm',
        type: 'Hand Configuration',
        orientation: 'RH', 
        modelPath: '',
        thumbnail: '',
        images: []
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

// Other cabinet products
const otherCabinetProducts: Product[] = [
  {
    id: 'innosin-wall-cabinet',
    name: 'Wall Cabinet Series',
    category: 'Innosin Lab',
    description: 'Space-efficient wall-mounted storage solutions',
    fullDescription: 'Professional wall-mounted cabinets designed to maximize laboratory storage while minimizing floor space usage.',
    dimensions: '750×330×750 mm',
    modelPath: '',
    thumbnail: '',
    images: [],
    specifications: ['Wall Mounted', 'Space Efficient', 'Glass Door Options'],
    variants: [
      {
        id: 'innosin-wcg-pc-753375',
        size: '750×330×750 mm',
        dimensions: '750×330×750 mm',
        type: 'Glass Door',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
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
    modelPath: '',
    thumbnail: '',
    images: [],
    specifications: ['Maximum Height', 'Glass Door', 'Secure Storage'],
    variants: [
      {
        id: 'innosin-tcg-pc-754018',
        size: '750×400×1800 mm',
        dimensions: '750×400×1800 mm',
        type: 'Glass Door',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
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
    modelPath: '',
    thumbnail: '',
    images: [], 
    specifications: ['Open Design', 'Maximum Accessibility', 'Adjustable Shelves'],
    variants: [
      {
        id: 'innosin-or-pc-604518',
        size: '380×380×1800 mm',
        dimensions: '380×380×1800 mm',
        type: 'Standard',
        orientation: 'None',
        modelPath: '',
        thumbnail: '',
        images: []
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

// Combine all products and enhance with assets
const allInnosinProducts = [
  ...kneeSpaceSeriesProducts,
  ...mobileCabinetProducts, 
  ...otherCabinetProducts
];

// Export enhanced products
export const getProductsSync = (): Product[] => {
  return allInnosinProducts.map(enhanceProductWithAssets);
};

// Get unique categories
export const getCategories = (): string[] => {
  const categories = allInnosinProducts.map(product => product.category);
  return [...new Set(categories)];
};

// Debug function to log asset URLs
export const debugAssetUrls = (productId: string) => {
  const product = allInnosinProducts.find(p => p.id === productId);
  if (product) {
    const enhanced = enhanceProductWithAssets(product);
    console.log(`🔍 Debug assets for ${productId}:`);
    console.log('Main product:', {
      modelPath: enhanced.modelPath,
      thumbnail: enhanced.thumbnail,
      images: enhanced.images
    });
    if (enhanced.variants) {
      enhanced.variants.forEach(variant => {
        console.log(`Variant ${variant.id}:`, {
          modelPath: variant.modelPath,
          thumbnail: variant.thumbnail,
          images: variant.images
        });
      });
    }
  }
};

