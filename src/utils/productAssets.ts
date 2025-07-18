import { Product, ProductVariant, ProductFinish } from '@/types/product';
import { discoverProductAssets, getAssetUrl, batchDiscoverAssets } from './dynamicAssetDiscovery';
import { extractProductCode, isInnosinLabProduct, getProductBaseName } from './productCodeUtils';

// Keep existing static products for non-Innosin Lab products
const staticProducts: Product[] = [
  // Broen Lab products
  {
    id: 'bl-hes-bench-001',
    name: 'HES Bench Mount Emergency Shower',
    category: 'Broen Lab',
    dimensions: '1200×300×2300 mm',
    modelPath: '/products/bl-hes-bench-001/model.glb',
    thumbnail: '/products/bl-hes-bench-001/images/front.jpg',
    images: ['/products/bl-hes-bench-001/images/front.jpg'],
    description: 'Bench-mounted emergency shower system with stainless steel construction',
    fullDescription: 'Professional bench-mounted emergency shower designed for laboratory safety compliance. Features corrosion-resistant stainless steel construction, ergonomic activation, and meets international safety standards.',
    specifications: ['Stainless steel construction', 'Bench mounting system', 'Emergency activation', 'Corrosion resistant']
  },
  {
    id: 'bl-hes-wall-001',
    name: 'HES Wall Mount Emergency Shower',
    category: 'Broen Lab',
    dimensions: '300×300×2300 mm',
    modelPath: '/products/bl-hes-wall-001/model.glb',
    thumbnail: '/products/bl-hes-wall-001/images/front.jpg',
    images: ['/products/bl-hes-wall-001/images/front.jpg'],
    description: 'Wall-mounted emergency shower with quick activation',
    fullDescription: 'Compact wall-mounted emergency shower system designed for space-efficient installation. Features quick-activation handle and meets all safety regulations.',
    specifications: ['Wall mounting', 'Quick activation', 'Space efficient', 'Safety compliant']
  },
  {
    id: 'bl-ews-combo-001',
    name: 'EWS Emergency Wash Station',
    category: 'Broen Lab',
    dimensions: '600×400×1500 mm',
    modelPath: '/products/bl-ews-combo-001/model.glb',
    thumbnail: '/products/bl-ews-combo-001/images/front.jpg',
    images: ['/products/bl-ews-combo-001/images/front.jpg'],
    description: 'Combined emergency shower and eyewash station',
    fullDescription: 'Comprehensive emergency safety station combining shower and eyewash functionality. Ideal for laboratories requiring complete emergency response capabilities.',
    specifications: ['Dual functionality', 'Emergency shower', 'Eyewash station', 'Stainless steel']
  },

  // Oriental Giken products
  {
    id: 'og-fh-standard-001',
    name: 'Standard Fume Hood 1200mm',
    category: 'Oriental Giken',
    dimensions: '1200×750×2350 mm',
    modelPath: '/products/og-fh-standard-001/model.glb',
    thumbnail: '/products/og-fh-standard-001/images/front.jpg',
    images: ['/products/og-fh-standard-001/images/front.jpg'],
    description: 'Standard laboratory fume hood with excellent containment',
    fullDescription: 'Professional-grade fume hood designed for general laboratory applications. Features advanced airflow management and safety systems.',
    specifications: ['1200mm width', 'Variable air volume', 'Safety glass sash', 'Chemical resistant work surface']
  },
  {
    id: 'og-fh-standard-002',
    name: 'Standard Fume Hood 1500mm',
    category: 'Oriental Giken',
    dimensions: '1500×750×2350 mm',
    modelPath: '/products/og-fh-standard-002/model.glb',
    thumbnail: '/products/og-fh-standard-002/images/front.jpg',
    images: ['/products/og-fh-standard-002/images/front.jpg'],
    description: 'Large capacity fume hood for extensive laboratory work',
    fullDescription: 'Spacious fume hood providing maximum working area for complex laboratory procedures. Advanced containment technology ensures operator safety.',
    specifications: ['1500mm width', 'High-volume airflow', 'Advanced safety features', 'Ergonomic design']
  },
  {
    id: 'og-fh-walkthrough-001',
    name: 'Walk-Through Fume Hood',
    category: 'Oriental Giken',
    dimensions: '2400×750×2350 mm',
    modelPath: '/products/og-fh-walkthrough-001/model.glb',
    thumbnail: '/products/og-fh-walkthrough-001/images/front.jpg',
    images: ['/products/og-fh-walkthrough-001/images/front.jpg'],
    description: 'Walk-through fume hood for shared laboratory spaces',
    fullDescription: 'Innovative walk-through design allows access from both sides, perfect for shared laboratory environments and collaborative work.',
    specifications: ['Walk-through design', 'Dual access', 'Shared workspace', 'Advanced containment']
  },

  // Hamilton Lab products
  {
    id: 'hl-bench-standard-001',
    name: 'Standard Laboratory Bench',
    category: 'Hamilton Lab',
    dimensions: '3000×750×900 mm',
    modelPath: '/products/hl-bench-standard-001/model.glb',
    thumbnail: '/products/hl-bench-standard-001/images/front.jpg',
    images: ['/products/hl-bench-standard-001/images/front.jpg'],
    description: 'Durable laboratory bench with chemical-resistant surface',
    fullDescription: 'Professional laboratory bench designed for daily use in demanding environments. Features chemical-resistant work surface and integrated storage.',
    specifications: ['Chemical resistant surface', 'Integrated storage', 'Adjustable height', 'Modular design']
  },
  {
    id: 'hl-bench-island-001',
    name: 'Island Laboratory Bench',
    category: 'Hamilton Lab',
    dimensions: '3000×1500×900 mm',
    modelPath: '/products/hl-bench-island-001/model.glb',
    thumbnail: '/products/hl-bench-island-001/images/front.jpg',
    images: ['/products/hl-bench-island-001/images/front.jpg'],
    description: 'Island bench configuration for collaborative work',
    fullDescription: 'Spacious island bench design promoting collaborative laboratory work. Features access from all sides and integrated utility distribution.',
    specifications: ['Island configuration', 'Multi-user access', 'Integrated utilities', 'Collaborative design']
  },
  {
    id: 'hl-storage-wall-001',
    name: 'Wall Storage System',
    category: 'Hamilton Lab',
    dimensions: '2400×400×2100 mm',
    modelPath: '/products/hl-storage-wall-001/model.glb',
    thumbnail: '/products/hl-storage-wall-001/images/front.jpg',
    images: ['/products/hl-storage-wall-001/images/front.jpg'],
    description: 'Comprehensive wall-mounted storage solution',
    fullDescription: 'Efficient wall-mounted storage system maximizing laboratory space utilization. Features adjustable shelving and secure storage compartments.',
    specifications: ['Wall mounted', 'Adjustable shelving', 'Space efficient', 'Secure storage']
  }
];

// Innosin Lab product definitions (structure only - assets loaded dynamically)
const innosinLabProducts: Omit<Product, 'modelPath' | 'thumbnail' | 'images' | 'overviewImage'>[] = [
  // KS Series - Fume Hoods
  {
    id: 'innosin-ks-700',
    name: 'KS700',
    category: 'Innosin Lab',
    dimensions: '700×750×2350 mm',
    description: 'Compact fume hood for small laboratory spaces',
    fullDescription: 'The KS700 is a compact yet efficient fume hood designed for smaller laboratory environments where space optimization is crucial.',
    specifications: ['700mm width', 'Energy efficient airflow', 'Safety glass sash', 'Chemical resistant work surface']
  },
  {
    id: 'innosin-ks-1200',
    name: 'KS1200',
    category: 'Innosin Lab',
    dimensions: '1200×750×2350 mm',
    description: 'Large capacity fume hood for high-volume laboratory work',
    fullDescription: 'The KS1200 provides maximum working space for complex laboratory procedures requiring extensive equipment setup.',
    specifications: ['1200mm width', 'High-volume airflow', 'Advanced safety features', 'Ergonomic design']
  },
  // Mobile Cabinet Series
  {
    id: 'innosin-mc-pc-755065',
    name: 'MC-PC (755065)',
    category: 'Innosin Lab',
    dimensions: '750×500×650 mm',
    description: 'Mobile laboratory cabinet with single door storage',
    fullDescription: 'Mobile cabinet designed for 750mm height benches with single door configuration providing easy access to internal shelving.',
    specifications: ['750mm bench compatibility', 'Single door', 'Mobile casters', 'Chemical resistant finish']
  },
  // Open Rack Series
  {
    id: 'innosin-or-pc-604518',
    name: 'OR-PC-3838 (604518)',
    category: 'Innosin Lab',
    dimensions: '380×380×1800 mm',
    description: 'Open rack storage system providing flexible storage solutions',
    fullDescription: 'Versatile open rack system offering maximum accessibility and visibility for laboratory equipment and supplies.',
    specifications: ['Open design', 'Adjustable shelving', 'Chemical resistant coating', 'Easy integration']
  }
];

/**
 * Enhanced product loading with dynamic asset discovery
 */
export const getProductsSync = (): Product[] => {
  // Return static products immediately (non-Innosin Lab)
  const nonInnosinProducts = staticProducts.filter(p => p.category !== 'Innosin Lab');
  
  // For Innosin Lab products, we'll enhance them with dynamic assets
  const innosinProducts = innosinLabProducts.map(product => ({
    ...product,
    // Placeholder paths that will be replaced by dynamic discovery
    modelPath: '/products/placeholder-model.glb',
    thumbnail: '/products/placeholder.jpg',
    images: ['/products/placeholder.jpg']
  })) as Product[];

  return [...nonInnosinProducts, ...innosinProducts];
};

/**
 * Enhanced product loading with dynamic asset discovery (async version)
 */
export const getProductsAsync = async (): Promise<Product[]> => {
  const baseProducts = getProductsSync();
  const innosinProducts = baseProducts.filter(p => p.category === 'Innosin Lab');
  const otherProducts = baseProducts.filter(p => p.category !== 'Innosin Lab');

  if (innosinProducts.length === 0) {
    return baseProducts;
  }

  // Discover assets for Innosin Lab products
  const productNames = innosinProducts.map(p => p.name);
  const assetMap = await batchDiscoverAssets(productNames);

  // Enhanced Innosin products with real assets
  const enhancedInnosinProducts = innosinProducts.map(product => {
    const assetInfo = assetMap.get(product.name);
    if (!assetInfo) return product;

    return {
      ...product,
      modelPath: assetInfo.hasModel && assetInfo.modelPath ? getAssetUrl(assetInfo.modelPath) : product.modelPath,
      thumbnail: assetInfo.hasImage && assetInfo.imagePath ? getAssetUrl(assetInfo.imagePath) : product.thumbnail,
      images: assetInfo.hasImage && assetInfo.imagePath ? [getAssetUrl(assetInfo.imagePath)] : product.images,
      overviewImage: assetInfo.overviewImagePath ? getAssetUrl(assetInfo.overviewImagePath) : undefined
    };
  });

  return [...otherProducts, ...enhancedInnosinProducts];
};

/**
 * Enhanced individual product loading with dynamic variants
 */
export const enhanceProductWithAssets = async (product: Product): Promise<Product> => {
  if (!isInnosinLabProduct(product.name)) {
    return product;
  }

  const assetInfo = await discoverProductAssets(product.name);
  
  const enhancedProduct: Product = {
    ...product,
    modelPath: assetInfo.hasModel && assetInfo.modelPath ? getAssetUrl(assetInfo.modelPath) : product.modelPath,
    thumbnail: assetInfo.hasImage && assetInfo.imagePath ? getAssetUrl(assetInfo.imagePath) : product.thumbnail,
    images: assetInfo.hasImage && assetInfo.imagePath ? [getAssetUrl(assetInfo.imagePath)] : product.images,
    overviewImage: assetInfo.overviewImagePath ? getAssetUrl(assetInfo.overviewImagePath) : product.overviewImage
  };

  return enhancedProduct;
};

/**
 * Get categories from enhanced products
 */
export const getCategories = (): string[] => {
  const products = getProductsSync();
  const categories = [...new Set(products.map(p => p.category))];
  return categories.sort();
};

/**
 * Find product by ID with asset enhancement
 */
export const findProductById = async (id: string): Promise<Product | undefined> => {
  const products = getProductsSync();
  const product = products.find(p => p.id === id);
  
  if (!product) return undefined;
  
  return await enhanceProductWithAssets(product);
};

/**
 * Get variant assets for a specific product variant
 */
export const getVariantAssets = async (productCode: string): Promise<{ imagePath?: string; modelPath?: string }> => {
  const assetInfo = await discoverProductAssets(productCode);
  
  return {
    imagePath: assetInfo.hasImage && assetInfo.imagePath ? getAssetUrl(assetInfo.imagePath) : undefined,
    modelPath: assetInfo.hasModel && assetInfo.modelPath ? getAssetUrl(assetInfo.modelPath) : undefined
  };
};
