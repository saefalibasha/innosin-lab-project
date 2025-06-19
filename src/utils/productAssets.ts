
import { Product } from '@/types/product';

// Product configuration - easy to maintain without touching React code
export const productConfigs: Omit<Product, 'modelPath' | 'thumbnail' | 'images'>[] = [
  {
    id: 'fh-001',
    name: 'Chemical Fume Hood - Standard',
    category: 'Broen-Lab',
    dimensions: '1500 × 750 × 2400mm',
    description: 'Standard chemical fume hood with variable air volume control and energy-efficient design.',
    specifications: ['VAV Control', 'Energy Efficient', 'ASHRAE 110 Compliant']
  },
  {
    id: 'lb-001',
    name: 'Epoxy Resin Lab Bench',
    category: 'Hamilton Laboratory Solutions',
    dimensions: '3000 × 750 × 850mm',
    description: 'Chemical-resistant epoxy resin lab bench with integrated utilities.',
    specifications: ['Chemical Resistant', 'Integrated Utilities', 'Modular Design']
  },
  {
    id: 'ew-001',
    name: 'Emergency Eye Wash Station',
    category: 'Oriental Giken Inc.',
    dimensions: '600 × 400 × 1200mm',
    description: 'ANSI Z358.1 compliant emergency eye wash station with stainless steel construction.',
    specifications: ['ANSI Z358.1', 'Stainless Steel', 'Hands-Free Operation']
  },
  {
    id: 'ss-001',
    name: 'Emergency Safety Shower',
    category: 'Oriental Giken Inc.',
    dimensions: '900 × 900 × 2300mm',
    description: 'Emergency safety shower with thermostatic mixing valve and freeze protection.',
    specifications: ['Thermostatic Valve', 'Freeze Protection', 'Easy Maintenance']
  },
  {
    id: 'sc-001',
    name: 'Chemical Storage Cabinet',
    category: 'Innosin Lab',
    dimensions: '1200 × 600 × 1800mm',
    description: 'Fire-resistant chemical storage cabinet with ventilation system.',
    specifications: ['Fire Resistant', 'Ventilated', 'Multiple Shelves']
  },
  {
    id: 'fh-002',
    name: 'Perchloric Acid Fume Hood',
    category: 'Broen-Lab',
    dimensions: '1800 × 750 × 2400mm',
    description: 'Specialized fume hood for perchloric acid applications with wash-down system.',
    specifications: ['Wash-down System', 'Specialized Design', 'Corrosion Resistant']
  }
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
