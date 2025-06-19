import { Product } from '@/types/product';

// Product configuration - easy to maintain without touching React code
export const productConfigs: Omit<Product, 'modelPath' | 'thumbnail' | 'images'>[] = [
  // Ready for Broen Lab products to be added here
];

// Check if asset exists (simplified for now, in production you'd use proper asset detection)
const checkAssetExists = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Generate full product data with asset paths
export const generateProducts = async (): Promise<Product[]> => {
  const products: Product[] = [];
  
  for (const config of productConfigs) {
    const basePath = `/products/${config.id}`;
    
    // Try to find GLB model
    const modelPath = `${basePath}/model.glb`;
    
    // Try to find thumbnail
    const possibleThumbnails = [
      `${basePath}/thumbnail.jpg`,
      `${basePath}/thumbnail.png`,
      `${basePath}/thumbnail.webp`,
      '/placeholder.svg' // fallback
    ];
    
    let thumbnail = '/placeholder.svg';
    for (const thumbPath of possibleThumbnails) {
      if (await checkAssetExists(thumbPath)) {
        thumbnail = thumbPath;
        break;
      }
    }
    
    // Try to find additional images
    const possibleImages = [
      `${basePath}/images/front.jpg`,
      `${basePath}/images/side.jpg`,
      `${basePath}/images/detail.jpg`,
      `${basePath}/images/front.png`,
      `${basePath}/images/side.png`,
      `${basePath}/images/detail.png`
    ];
    
    const images: string[] = [];
    for (const imgPath of possibleImages) {
      if (await checkAssetExists(imgPath)) {
        images.push(imgPath);
      }
    }
    
    products.push({
      ...config,
      modelPath,
      thumbnail,
      images
    });
  }
  
  return products;
};

// Synchronous version for immediate use (uses fallbacks)
export const getProductsSync = (): Product[] => {
  return productConfigs.map(config => ({
    ...config,
    modelPath: `/products/${config.id}/model.glb`,
    thumbnail: `/products/${config.id}/thumbnail.jpg`,
    images: [
      `/products/${config.id}/images/front.jpg`,
      `/products/${config.id}/images/side.jpg`,
      `/products/${config.id}/images/detail.jpg`
    ]
  }));
};

// Generate unique categories from products
export const getCategories = (): string[] => {
  const uniqueCategories = [...new Set(productConfigs.map(product => product.category))];
  return ['all', ...uniqueCategories];
};
