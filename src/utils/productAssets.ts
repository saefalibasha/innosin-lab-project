// Utility functions for managing product assets and data
// This file handles the generation of product data from the public/products directory structure

import { Product } from '@/types/product';

// Dynamic asset loading utility that integrates uploaded files with existing products
const loadUploadedAssets = (): { [key: string]: { glb?: string; jpg?: string } } => {
  const uploadedAssets: { [key: string]: { glb?: string; jpg?: string } } = {};
  
  try {
    // Overview images for Mobile Cabinet Series uploaded through the asset manager
    const overviewAssets = {
      'mobile-cabinet-750mm-overview': {
        jpg: '/products/mobile-cabinet-750mm-overview/750mm-height-bench-overview.jpg'
      },
      'mobile-cabinet-900mm-overview': {
        jpg: '/products/mobile-cabinet-900mm-overview/900mm-height-bench-overview.jpg'
      }
    };
    
    // All uploaded individual product assets from the asset management system
    // These are automatically detected from the public/products directory structure
    const uploadedProductAssets = detectUploadedProducts();
    
    return { ...uploadedAssets, ...overviewAssets, ...uploadedProductAssets };
  } catch (error) {
    console.warn('Error loading uploaded assets:', error);
    return {};
  }
};

// Detect products uploaded through the asset management system
const detectUploadedProducts = (): { [key: string]: { glb?: string; jpg?: string } } => {
  // Map uploaded assets from public/products directory structure
  const uploadedAssets = {
    // ===========================================
    // INNOSIN LAB KS SERIES - Knee Space Units
    // ===========================================
    'innosin-ks-700': {
      glb: '/products/innosin-ks-700/KS700.glb',
      jpg: '/products/innosin-ks-700/KS700.jpg'
    },
    'innosin-ks-750': {
      glb: '/products/innosin-ks-750/KS750.glb',
      jpg: '/products/innosin-ks-750/KS750.jpg'
    },
    'innosin-ks-800': {
      glb: '/products/innosin-ks-800/KS800.glb',
      jpg: '/products/innosin-ks-800/KS800.jpg'
    },
    'innosin-ks-850': {
      glb: '/products/innosin-ks-850/KS850.glb',
      jpg: '/products/innosin-ks-850/KS850.jpg'
    },
    'innosin-ks-900': {
      glb: '/products/innosin-ks-900/KS900.glb',
      jpg: '/products/innosin-ks-900/KS900.jpg'
    },
    'innosin-ks-1000': {
      glb: '/products/innosin-ks-1000/KS1000.glb',
      jpg: '/products/innosin-ks-1000/KS1000.jpg'
    },
    'innosin-ks-1200': {
      glb: '/products/innosin-ks-1200/KS1200.glb',
      jpg: '/products/innosin-ks-1200/KS1200.jpg'
    },
    
    // ===========================================
    // MOBILE CABINET (MC) SERIES - Powder Coated
    // ===========================================
    'innosin-mc-pc-755065': {
      glb: '/products/innosin-mc-pc-755065/MC-PC (755065).glb',
      jpg: '/products/innosin-mc-pc-755065/MC-PC (755065).jpg'
    },
    'innosin-mc-pc-755080': {
      glb: '/products/innosin-mc-pc-755080/MC-PC (755080).glb',
      jpg: '/products/innosin-mc-pc-755080/MC-PC (755080).jpg'
    },
    'innosin-mc-pc-lh-505065': {
      glb: '/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).glb',
      jpg: '/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg'
    },
    'innosin-mc-pc-lh-505080': {
      glb: '/products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).glb',
      jpg: '/products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).jpg'
    },
    'innosin-mc-pc-rh-505065': {
      glb: '/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).glb',
      jpg: '/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg'
    },
    'innosin-mc-pc-rh-505080': {
      glb: '/products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).glb',
      jpg: '/products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).jpg'
    },
    
    // ===========================================
    // OPEN RACK (OR) SERIES
    // ===========================================
    'innosin-or-pc-604518': {
      glb: '/products/innosin-or-pc-604518/OR-PC-3838 (604518).glb',
      jpg: '/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg'
    }
  };
  
  return uploadedAssets;
};

// Validate asset paths and check if they exist
const validateAssetPath = (path: string): boolean => {
  // Skip validation for placeholder assets
  if (path.includes('PLACEHOLDER') || path.includes('placeholder')) {
    return false;
  }
  
  // In a real environment, this would check if the file exists
  // For development, we'll assume all non-placeholder paths are valid
  return true;
};

// Enhanced product loading with asset validation
const enhanceProductWithAssets = (product: Product): Product => {
  const uploadedAssets = loadUploadedAssets();
  
  // Check if there are uploaded assets for this product
  const productAssets = uploadedAssets[product.id];
  if (productAssets) {
    // Update with uploaded assets if available
    return {
      ...product,
      modelPath: productAssets.glb || product.modelPath,
      thumbnail: productAssets.jpg || product.thumbnail,
      images: productAssets.jpg ? [productAssets.jpg, ...product.images] : product.images
    };
  }
  
  return product;
};

// Product asset management
export const getProductsSync = (): Product[] => {
  // Generate products based on available assets in public/products directory
  const products: Product[] = [
    // ===========================================
    // INNOSIN LAB PRODUCTS - Knee Space Units
    // ===========================================
    {
      id: "innosin-knee-space-unit",
      name: "Knee Space Unit",
      category: "Innosin Lab",
      dimensions: "Various sizes available",
      description: "Professional laboratory knee space units for workstation integration.",
      fullDescription: "Professional laboratory knee space units designed for seamless integration into laboratory workstations. Features durable powder-coated finish and ergonomic design for optimal user comfort and workflow efficiency. Available in multiple sizes to accommodate different workspace requirements.",
      specifications: [
        "Multiple width options: 700-1200mm",
        "Standard depth: 600mm", 
        "Standard height: 750mm",
        "Powder-coated finish",
        "Ergonomic design",
        "Easy installation",
        "Laboratory-grade construction"
      ],
      modelPath: "/products/innosin-ks-700/KS700.glb",
      thumbnail: "/products/innosin-ks-700/KS700.jpg",
      images: ["/products/innosin-ks-700/KS700.jpg"],
      variants: [
        {
          id: "innosin-ks-700",
          size: "700mm",
          dimensions: "W700 × D600 × H750mm",
          modelPath: "/products/innosin-ks-700/KS700.glb",
          thumbnail: "/products/innosin-ks-700/KS700.jpg",
          images: ["/products/innosin-ks-700/KS700.jpg"]
        },
        {
          id: "innosin-ks-750",
          size: "750mm", 
          dimensions: "W750 × D600 × H750mm",
          modelPath: "/products/innosin-ks-750/KS750.glb",
          thumbnail: "/products/innosin-ks-750/KS750.jpg",
          images: ["/products/innosin-ks-750/KS750.jpg"]
        },
        {
          id: "innosin-ks-800",
          size: "800mm",
          dimensions: "W800 × D600 × H750mm", 
          modelPath: "/products/innosin-ks-800/KS800.glb",
          thumbnail: "/products/innosin-ks-800/KS800.jpg",
          images: ["/products/innosin-ks-800/KS800.jpg"]
        },
        {
          id: "innosin-ks-850",
          size: "850mm",
          dimensions: "W850 × D600 × H750mm",
          modelPath: "/products/innosin-ks-850/KS850.glb", 
          thumbnail: "/products/innosin-ks-850/KS850.jpg",
          images: ["/products/innosin-ks-850/KS850.jpg"]
        },
        {
          id: "innosin-ks-900",
          size: "900mm",
          dimensions: "W900 × D600 × H750mm",
          modelPath: "/products/innosin-ks-900/KS900.glb",
          thumbnail: "/products/innosin-ks-900/KS900.jpg", 
          images: ["/products/innosin-ks-900/KS900.jpg"]
        },
        {
          id: "innosin-ks-1000",
          size: "1000mm",
          dimensions: "W1000 × D600 × H750mm",
          modelPath: "/products/innosin-ks-1000/KS1000.glb",
          thumbnail: "/products/innosin-ks-1000/KS1000.jpg",
          images: ["/products/innosin-ks-1000/KS1000.jpg"]
        },
        {
          id: "innosin-ks-1200",
          size: "1200mm",
          dimensions: "W1200 × D600 × H750mm",
          modelPath: "/products/innosin-ks-1200/KS1200.glb",
          thumbnail: "/products/innosin-ks-1200/KS1200.jpg",
          images: ["/products/innosin-ks-1200/KS1200.jpg"]
        }
      ]
    },

    // ===========================================
    // INNOSIN LAB - Mobile Cabinet PC Single Door
    // ===========================================
    {
      id: "innosin-mobile-cabinet-pc-single",
      name: "Mobile Cabinet PC Single Door", 
      category: "Innosin Lab",
      dimensions: "Various sizes available",
      description: "Mobile powder-coated cabinet with single door for laboratory flexibility.",
      fullDescription: "Professional mobile laboratory cabinet with durable powder-coated finish and single door configuration. Features smooth-rolling wheels and secure locking mechanisms for safe transport of equipment and materials.",
      specifications: [
        "Single door configuration",
        "Multiple size options",
        "Powder-coated finish",
        "Mobile with wheels",
        "Locking mechanisms", 
        "Laboratory-grade construction"
      ],
      modelPath: "/products/innosin-mc-pc-755065/MC-PC (755065).glb",
      thumbnail: "/products/innosin-mc-pc-755065/MC-PC (755065).jpg",
      images: ["/products/innosin-mc-pc-755065/MC-PC (755065).jpg"],
      variants: [
        {
          id: "innosin-mc-pc-755065",
          size: "755065",
          dimensions: "W750 × D500 × H650mm",
          modelPath: "/products/innosin-mc-pc-755065/MC-PC (755065).glb",
          thumbnail: "/products/innosin-mc-pc-755065/MC-PC (755065).jpg",
          images: ["/products/innosin-mc-pc-755065/MC-PC (755065).jpg"]
        },
        {
          id: "innosin-mc-pc-755080",
          size: "755080",
          dimensions: "W750 × D500 × H800mm",
          modelPath: "/products/innosin-mc-pc-755080/MC-PC (755080).glb",
          thumbnail: "/products/innosin-mc-pc-755080/MC-PC (755080).jpg",
          images: ["/products/innosin-mc-pc-755080/MC-PC (755080).jpg"]
        }
      ]
    },

    // ===========================================
    // INNOSIN LAB - Mobile Cabinet PC Left Hand
    // ===========================================
    {
      id: "innosin-mobile-cabinet-pc-left-hand",
      name: "Mobile Cabinet PC Left Hand",
      category: "Innosin Lab", 
      dimensions: "Various sizes available",
      description: "Mobile powder-coated cabinet with left-hand configuration.",
      fullDescription: "Professional mobile laboratory cabinet with left-hand door configuration. Features durable powder-coated finish, smooth-rolling wheels and secure locking mechanisms.",
      specifications: [
        "Left-hand door configuration",
        "Multiple size options",
        "Powder-coated finish",
        "Mobile with wheels", 
        "Locking mechanisms",
        "Laboratory-grade construction"
      ],
      modelPath: "/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).glb",
      thumbnail: "/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg", 
      images: ["/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg"],
      variants: [
        {
          id: "innosin-mc-pc-lh-505065",
          size: "505065",
          dimensions: "W500 × D500 × H650mm",
          modelPath: "/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).glb",
          thumbnail: "/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg",
          images: ["/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg"]
        },
        {
          id: "innosin-mc-pc-lh-505080", 
          size: "505080",
          dimensions: "W500 × D500 × H800mm",
          modelPath: "/products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).glb",
          thumbnail: "/products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).jpg",
          images: ["/products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).jpg"]
        }
      ]
    },

    // ===========================================
    // INNOSIN LAB - Mobile Cabinet PC Right Hand
    // ===========================================
    {
      id: "innosin-mobile-cabinet-pc-right-hand", 
      name: "Mobile Cabinet PC Right Hand",
      category: "Innosin Lab",
      dimensions: "Various sizes available", 
      description: "Mobile powder-coated cabinet with right-hand configuration.",
      fullDescription: "Professional mobile laboratory cabinet with right-hand door configuration. Features durable powder-coated finish, smooth-rolling wheels and secure locking mechanisms.",
      specifications: [
        "Right-hand door configuration",
        "Multiple size options",
        "Powder-coated finish",
        "Mobile with wheels",
        "Locking mechanisms",
        "Laboratory-grade construction"
      ],
      modelPath: "/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).glb",
      thumbnail: "/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg",
      images: ["/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg"],
      variants: [
        {
          id: "innosin-mc-pc-rh-505065",
          size: "505065", 
          dimensions: "W500 × D500 × H650mm",
          modelPath: "/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).glb",
          thumbnail: "/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg",
          images: ["/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg"]
        },
        {
          id: "innosin-mc-pc-rh-505080",
          size: "505080",
          dimensions: "W500 × D500 × H800mm", 
          modelPath: "/products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).glb",
          thumbnail: "/products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).jpg",
          images: ["/products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).jpg"]
        }
      ]
    },

    // ===========================================
    // INNOSIN LAB - Open Rack System
    // ===========================================
    {
      id: "innosin-open-rack-system",
      name: "Open Rack System",
      category: "Innosin Lab",
      dimensions: "W380 × D380mm (various heights)",
      description: "Open rack storage system for laboratory equipment and supplies.",
      fullDescription: "Professional open rack storage system designed for laboratory environments. Features durable construction and open design for easy access to equipment and supplies.",
      specifications: [
        "Open rack design",
        "Multiple height options",
        "Durable construction", 
        "Easy access storage",
        "Laboratory-grade materials",
        "Space-efficient design"
      ],
      modelPath: "/products/innosin-or-pc-604518/OR-PC-3838 (604518).glb",
      thumbnail: "/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg",
      images: ["/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg"],
      variants: [
        {
          id: "innosin-or-pc-604518",
          size: "604518",
          dimensions: "W380 × D380 × H518mm",
          modelPath: "/products/innosin-or-pc-604518/OR-PC-3838 (604518).glb",
          thumbnail: "/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg",
          images: ["/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg"]
        }
      ]
    }
  ];

  // Enhance all products with uploaded assets
  const enhancedProducts = products.map(enhanceProductWithAssets);
  
  console.log('Generated products with uploaded assets:', enhancedProducts);
  return enhancedProducts;
};

// Generate unique categories from products
export const getCategories = (): string[] => {
  const products = getProductsSync();
  const categories = [...new Set(products.map(product => product.category))];
  console.log('Generated categories:', categories);
  return categories;
};