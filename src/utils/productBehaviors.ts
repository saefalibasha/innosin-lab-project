import { PlacedProduct } from '@/types/floorPlanTypes';

export enum ProductSeries {
  SINK_CABINET = 'Sink Cabinet Series',
  MODULAR_CABINET = 'Modular Cabinet Series', 
  WALL_CABINET = 'Wall Cabinet Series',
  OTHER = 'Other'
}

export interface ProductBehavior {
  canAttachTableTop: boolean;
  canMountOnWall: boolean;
  defaultMountHeight: number; // mm from floor
  snapToFloor: boolean;
  snapToWalls: boolean;
  snapToProducts: boolean;
  allowStacking: boolean;
  stackHeight?: number;
}

const DEFAULT_BEHAVIORS: ProductBehavior = {
  canAttachTableTop: false,
  canMountOnWall: false,
  defaultMountHeight: 0,
  snapToFloor: true,
  snapToWalls: true,
  snapToProducts: true,
  allowStacking: false
};

const SERIES_BEHAVIORS: Record<ProductSeries, ProductBehavior> = {
  [ProductSeries.SINK_CABINET]: {
    canAttachTableTop: true,
    canMountOnWall: false,
    defaultMountHeight: 0,
    snapToFloor: true,
    snapToWalls: true,
    snapToProducts: true,
    allowStacking: false
  },
  [ProductSeries.MODULAR_CABINET]: {
    canAttachTableTop: true,
    canMountOnWall: false,
    defaultMountHeight: 0,
    snapToFloor: true,
    snapToWalls: true,
    snapToProducts: true,
    allowStacking: true,
    stackHeight: 850 // Standard cabinet height
  },
  [ProductSeries.WALL_CABINET]: {
    canAttachTableTop: false,
    canMountOnWall: true,
    defaultMountHeight: 1500, // 1.5m from floor
    snapToFloor: false,
    snapToWalls: true,
    snapToProducts: true,
    allowStacking: false
  },
  [ProductSeries.OTHER]: DEFAULT_BEHAVIORS
};

export function getProductSeries(product: PlacedProduct): ProductSeries {
  const category = product.category?.toLowerCase() || '';
  const name = product.name?.toLowerCase() || '';
  
  if (category.includes('sink') || name.includes('sink')) {
    return ProductSeries.SINK_CABINET;
  }
  if (category.includes('modular') || name.includes('modular')) {
    return ProductSeries.MODULAR_CABINET;
  }
  if (category.includes('wall') || name.includes('wall')) {
    return ProductSeries.WALL_CABINET;
  }
  
  return ProductSeries.OTHER;
}

export function getProductBehavior(product: PlacedProduct): ProductBehavior {
  const series = getProductSeries(product);
  return SERIES_BEHAVIORS[series];
}

export function canProductsConnect(product1: PlacedProduct, product2: PlacedProduct): boolean {
  const series1 = getProductSeries(product1);
  const series2 = getProductSeries(product2);
  
  // Products from the same series can connect
  return series1 === series2 && series1 !== ProductSeries.OTHER;
}

export function calculateOptimalSnapDistance(product: PlacedProduct): number {
  const behavior = getProductBehavior(product);
  const series = getProductSeries(product);
  
  switch (series) {
    case ProductSeries.WALL_CABINET:
      return 100; // Tighter snapping for wall-mounted items
    case ProductSeries.MODULAR_CABINET:
    case ProductSeries.SINK_CABINET:
      return 200; // Standard snapping distance
    default:
      return 150;
  }
}

export function getDefaultPlacementHeight(product: PlacedProduct): number {
  const behavior = getProductBehavior(product);
  return behavior.defaultMountHeight;
}