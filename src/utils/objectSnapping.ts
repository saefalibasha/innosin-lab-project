
import { Point, PlacedProduct } from '@/types/floorPlanTypes';

export interface SnapResult {
  position: Point;
  snappedToGrid: boolean;
  snappedToObject: boolean;
}

export interface SnapGuide {
  type: 'grid' | 'object' | 'edge';
  position: Point;
  direction: 'horizontal' | 'vertical';
  color: string;
}

export const calculateSnapPosition = (
  product: PlacedProduct,
  existingProducts: PlacedProduct[],
  position: Point,
  scale: number,
  gridSize: number
): SnapResult => {
  const snapThreshold = 10; // pixels
  
  // Grid snapping
  const gridSizePx = gridSize * scale;
  const snappedX = Math.round(position.x / gridSizePx) * gridSizePx;
  const snappedY = Math.round(position.y / gridSizePx) * gridSizePx;
  
  const gridSnappedPosition = { x: snappedX, y: snappedY };
  
  // Check if close enough to grid
  const distanceToGrid = Math.sqrt(
    Math.pow(position.x - snappedX, 2) + Math.pow(position.y - snappedY, 2)
  );
  
  if (distanceToGrid <= snapThreshold) {
    return {
      position: gridSnappedPosition,
      snappedToGrid: true,
      snappedToObject: false
    };
  }
  
  return {
    position,
    snappedToGrid: false,
    snappedToObject: false
  };
};
