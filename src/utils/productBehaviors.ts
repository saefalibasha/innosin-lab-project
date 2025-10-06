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
  const productCode = (product as any).product_code?.toLowerCase() || '';
  const name = product.name?.toLowerCase() || '';
  const category = product.category?.toLowerCase() || '';
  const productSeries = (product as any).product_series?.toLowerCase() || '';
  
  // Combine all identifiers for flexible matching
  const allIds = `${productId} ${productCode} ${name} ${category} ${productSeries}`.toLowerCase();
  
  // Detect series from productId, product_code, name, category, or product_series for Innosin products
  if (allIds.includes('mc-pc') || allIds.includes('mobile cabinet') || allIds.includes('mobile')) {
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
  
  if (allIds.includes('mcc-pc') || allIds.includes('combination cabinet') || allIds.includes('modular')) {
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
  
  if (allIds.includes('wcg-pc') || allIds.includes('wall cabinet') || allIds.includes('wall')) {
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
  
  if (allIds.includes('tcg-pc') || allIds.includes('tall cabinet') || allIds.includes('tall')) {
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
    allIds.includes('worktop') || 
    allIds.includes('work-top') ||
    allIds.includes('work top') ||
    allIds.includes('ep-wt');

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