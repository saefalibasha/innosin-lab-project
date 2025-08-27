
import { useState, useCallback } from 'react';
import { Point, PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { mmToCanvas } from '@/utils/measurements';

export interface CollisionResult {
  hasCollision: boolean;
  type: 'wall' | 'furniture' | 'boundary' | null;
  collisionObject?: PlacedProduct | WallSegment;
}

export const useCollisionDetection = (
  wallSegments: WallSegment[],
  placedProducts: PlacedProduct[],
  canvasWidth: number,
  canvasHeight: number,
  scale: number
) => {
  const [collisionState, setCollisionState] = useState<CollisionResult>({
    hasCollision: false,
    type: null
  });

  const checkProductCollision = useCallback((
    draggedProduct: PlacedProduct,
    position: Point
  ): CollisionResult => {
    const productWidth = mmToCanvas(draggedProduct.dimensions.length, scale);
    const productHeight = mmToCanvas(draggedProduct.dimensions.width, scale);
    
    // Check boundary collision
    const margin = 10;
    if (position.x - productWidth/2 < margin || 
        position.x + productWidth/2 > canvasWidth - margin ||
        position.y - productHeight/2 < margin || 
        position.y + productHeight/2 > canvasHeight - margin) {
      return { hasCollision: true, type: 'boundary' };
    }

    // Check wall collisions
    for (const wall of wallSegments) {
      if (checkProductWallCollision(draggedProduct, position, wall, scale)) {
        return { hasCollision: true, type: 'wall', collisionObject: wall };
      }
    }

    // Check furniture collisions
    for (const product of placedProducts) {
      if (product.id === draggedProduct.id) continue;
      
      if (checkProductProductCollision(draggedProduct, position, product, scale)) {
        return { hasCollision: true, type: 'furniture', collisionObject: product };
      }
    }

    return { hasCollision: false, type: null };
  }, [wallSegments, placedProducts, canvasWidth, canvasHeight, scale]);

  const updateCollisionState = useCallback((result: CollisionResult) => {
    setCollisionState(result);
  }, []);

  return {
    checkProductCollision,
    collisionState,
    updateCollisionState,
    clearCollision: () => setCollisionState({ hasCollision: false, type: null })
  };
};

// Helper functions
const checkProductWallCollision = (
  product: PlacedProduct,
  position: Point,
  wall: WallSegment,
  scale: number
): boolean => {
  const productWidth = mmToCanvas(product.dimensions.length, scale);
  const productHeight = mmToCanvas(product.dimensions.width, scale);
  const wallThickness = mmToCanvas(wall.thickness || 100, scale);

  const productBounds = {
    left: position.x - productWidth/2,
    right: position.x + productWidth/2,
    top: position.y - productHeight/2,
    bottom: position.y + productHeight/2
  };

  // Check if product intersects with wall line (with thickness)
  const distance = distanceToLineSegment(position, wall.start, wall.end);
  return distance < (Math.max(productWidth, productHeight)/2 + wallThickness/2);
};

const checkProductProductCollision = (
  product1: PlacedProduct,
  position1: Point,
  product2: PlacedProduct,
  scale: number
): boolean => {
  const product1Width = mmToCanvas(product1.dimensions.length, scale);
  const product1Height = mmToCanvas(product1.dimensions.width, scale);
  const product2Width = mmToCanvas(product2.dimensions.length, scale);
  const product2Height = mmToCanvas(product2.dimensions.width, scale);

  const bounds1 = {
    left: position1.x - product1Width/2,
    right: position1.x + product1Width/2,
    top: position1.y - product1Height/2,
    bottom: position1.y + product1Height/2
  };

  const bounds2 = {
    left: product2.position.x - product2Width/2,
    right: product2.position.x + product2Width/2,
    top: product2.position.y - product2Height/2,
    bottom: product2.position.y + product2Height/2
  };

  // Add small buffer to prevent items from touching
  const buffer = 5;
  
  return !(bounds1.right + buffer < bounds2.left || 
           bounds1.left - buffer > bounds2.right || 
           bounds1.bottom + buffer < bounds2.top || 
           bounds1.top - buffer > bounds2.bottom);
};

const distanceToLineSegment = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));
  
  const xx = lineStart.x + param * C;
  const yy = lineStart.y + param * D;
  
  const dx = point.x - xx;
  const dy = point.y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
};
