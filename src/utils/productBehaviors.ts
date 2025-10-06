import { PlacedProduct } from '@/types/floorPlanTypes';

interface ProductBehavior {
  snapToWalls: boolean;
  snapToProducts: boolean;
  snapToFloor: boolean;
  canMountOnWall: boolean;
  allowStacking: boolean;
  defaultMountHeight: number; // in mm
  series: string;
  category: string;
  canBePlacedOnTop?: boolean; // For worktops
  requiresBaseProduct?: boolean; // Worktops need a base
  canSupportWorktop?: boolean; // For base cabinets that can support worktops
}

/**
 * Get behavior configuration for a product
 */
export function getProductBehavior(product: PlacedProduct): ProductBehavior {
  const productId = product.productId || '';
  const name = product.name?.toLowerCase() || '';
  const category = product.category?.toLowerCase() || '';
  const productSeries = (product as any).product_series?.toLowerCase() || '';
  
  // Detect series from productId, name, category, or product_series for Innosin products
  if (productId.includes('mc-pc') || name.includes('mobile cabinet') || category.includes('mobile')) {
    return {
      snapToWalls: true,
      snapToProducts: true,
      snapToFloor: true,
      canMountOnWall: false,
      allowStacking: false,
      defaultMountHeight: 0,
      canSupportWorktop: true,
      series: 'mobile-cabinet',
      category: 'mobile'
    };
  }
  
  if (productId.includes('mcc-pc') || name.includes('combination cabinet') || category.includes('modular')) {
    return {
      snapToWalls: true,
      snapToProducts: true,
      snapToFloor: true,
      canMountOnWall: false,
      allowStacking: true,
      defaultMountHeight: 0,
      canSupportWorktop: true,
      series: 'modular-cabinet',
      category: 'modular'
    };
  }
  
  if (productId.includes('wcg-pc') || name.includes('wall cabinet') || category.includes('wall')) {
    return {
      snapToWalls: true,
      snapToProducts: true,
      snapToFloor: false,
      canMountOnWall: true,
      allowStacking: false,
      defaultMountHeight: 1200,
      canSupportWorktop: false,
      series: 'wall-cabinet',
      category: 'wall'
    };
  }
  
  if (productId.includes('tcg-pc') || name.includes('tall cabinet') || category.includes('tall')) {
    return {
      snapToWalls: true,
      snapToProducts: true,
      snapToFloor: true,
      canMountOnWall: false,
      allowStacking: false,
      defaultMountHeight: 0,
      canSupportWorktop: false,
      series: 'tall-cabinet',
      category: 'tall'
    };
  }
  
  // Worktop detection - check multiple fields
  const isWorktop = 
    productId.includes('worktop') || 
    productId.includes('work-top') ||
    productId.toLowerCase().includes('ep-wt') || // Your specific worktop code
    name.includes('work top') || 
    name.includes('worktop') ||
    category.includes('worktop') ||
    category.toLowerCase() === 'worktop' ||
    productSeries.includes('work top') ||
    productSeries.includes('worktop');

  if (isWorktop) {
    return {
      snapToWalls: false,
      snapToProducts: true,
      snapToFloor: false,
      canMountOnWall: false,
      allowStacking: false,
      canBePlacedOnTop: true,
      requiresBaseProduct: true,
      defaultMountHeight: 850, // Height of typical base cabinet
      series: 'worktop',
      category: 'worktop'
    };
  }
  
  // Default behavior for unknown products (can support worktops if floor-based)
  return {
    snapToWalls: true,
    snapToProducts: true,
    snapToFloor: true,
    canMountOnWall: false,
    allowStacking: false,
    defaultMountHeight: 0,
    canSupportWorktop: true,
    series: 'unknown',
    category: 'general'
  };
}

/**
 * Check if two products can connect/snap together
 */
export function canProductsConnect(product1: PlacedProduct, product2: PlacedProduct): boolean {
  const behavior1 = getProductBehavior(product1);
  const behavior2 = getProductBehavior(product2);
  
  // Same series products can always connect
  if (behavior1.series === behavior2.series) {
    return true;
  }
  
  // Mobile cabinets can connect to each other
  if (behavior1.category === 'mobile' && behavior2.category === 'mobile') {
    return true;
  }
  
  // Modular cabinets can stack and connect
  if (behavior1.category === 'modular' && behavior2.category === 'modular') {
    return true;
  }
  
  return false;
}

/**
 * Calculate optimal snap distance for a product
 */
export function calculateOptimalSnapDistance(product: PlacedProduct): number {
  const behavior = getProductBehavior(product);
  
  switch (behavior.category) {
    case 'mobile':
      return 200; // 200mm snap distance for mobile cabinets
    case 'modular':
      return 150; // 150mm for modular cabinets (tighter snapping)
    case 'wall':
      return 100; // 100mm for wall cabinets
    case 'tall':
      return 250; // 250mm for tall cabinets
    default:
      return 200;
  }
}