import { PlacedProduct, Point } from '@/types/floorPlanTypes';
import { getProductBehavior } from './productBehaviors';

/**
 * Find all cabinets that are underneath a worktop position
 */
export function findCabinetsUnderWorktop(
  worktopPosition: Point,
  worktopDimensions: { length: number; width: number },
  allProducts: PlacedProduct[]
): PlacedProduct[] {
  const cabinets: PlacedProduct[] = [];
  const OVERLAP_THRESHOLD = 50; // mm - minimum overlap to consider cabinet as supporting

  allProducts.forEach(product => {
    const behavior = getProductBehavior(product);
    
    // Only consider floor-based products that can support worktops
    if (!behavior.canSupportWorktop || behavior.canMountOnWall) return;
    if (product.isWorktop) return; // Skip other worktops

    // Check if product is underneath worktop (overlap check)
    const productLeft = product.position.x - (product.dimensions.width / 2);
    const productRight = product.position.x + (product.dimensions.width / 2);
    const productFront = product.position.y - (product.dimensions.length / 2);
    const productBack = product.position.y + (product.dimensions.length / 2);

    const worktopLeft = worktopPosition.x - (worktopDimensions.width / 2);
    const worktopRight = worktopPosition.x + (worktopDimensions.width / 2);
    const worktopFront = worktopPosition.y - (worktopDimensions.length / 2);
    const worktopBack = worktopPosition.y + (worktopDimensions.length / 2);

    // Check for overlap
    const overlapX = Math.min(productRight, worktopRight) - Math.max(productLeft, worktopLeft);
    const overlapY = Math.min(productBack, worktopBack) - Math.max(productFront, worktopFront);

    if (overlapX > OVERLAP_THRESHOLD && overlapY > OVERLAP_THRESHOLD) {
      cabinets.push(product);
    }
  });

  return cabinets;
}

/**
 * Calculate optimal worktop length based on underlying cabinets
 */
export function calculateWorktopLength(
  cabinets: PlacedProduct[],
  worktopWidth: number = 600
): { length: number; width: number; overhang: number } {
  if (cabinets.length === 0) {
    return { length: 600, width: worktopWidth, overhang: 25 };
  }

  const OVERHANG = 25; // mm overhang on each side

  // Find min/max positions along the cabinet row
  let minX = Infinity;
  let maxX = -Infinity;

  cabinets.forEach(cabinet => {
    const left = cabinet.position.x - (cabinet.dimensions.width / 2);
    const right = cabinet.position.x + (cabinet.dimensions.width / 2);
    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
  });

  const totalLength = (maxX - minX) + (OVERHANG * 2);

  return {
    length: Math.max(600, totalLength), // Minimum 600mm
    width: worktopWidth,
    overhang: OVERHANG
  };
}

/**
 * Calculate the height offset for a worktop based on the tallest cabinet underneath
 */
export function calculateWorktopHeightOffset(cabinets: PlacedProduct[]): number {
  if (cabinets.length === 0) return 850; // Default cabinet height

  // Find the tallest cabinet
  const maxHeight = Math.max(...cabinets.map(c => c.dimensions?.height || 850));
  return maxHeight;
}

/**
 * Adjust worktop dimensions to match a new length
 */
export function adjustWorktopDimensions(
  worktop: PlacedProduct,
  newLength: number
): PlacedProduct {
  return {
    ...worktop,
    dimensions: {
      ...worktop.dimensions,
      width: newLength, // Width = left-right dimension
    }
  };
}

/**
 * Check if a worktop placement is valid
 */
export function isValidWorktopPlacement(
  worktopPosition: Point,
  worktopDimensions: { length: number; width: number },
  allProducts: PlacedProduct[]
): { valid: boolean; reason?: string } {
  const cabinets = findCabinetsUnderWorktop(worktopPosition, worktopDimensions, allProducts);

  if (cabinets.length === 0) {
    return { 
      valid: false, 
      reason: 'Worktop must be placed on top of at least one cabinet' 
    };
  }

  return { valid: true };
}
