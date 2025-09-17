import { useState, useCallback } from 'react';
import { PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { canvasTo3DWorld, worldTo2DCanvas } from '@/utils/coordinateUtils';
import { wallsToPolygon, pointInPolygon } from '@/utils/polygonUtils';
import * as THREE from 'three';

interface Enhanced3DSnapResult {
  snapped: boolean;
  position: [number, number, number];
  snapType: 'wall' | 'product' | 'grid' | 'none';
  confidence: number;
}

interface SnapGuide3D {
  type: 'line' | 'point' | 'grid' | 'surface';
  position: [number, number, number];
  direction?: [number, number, number];
  color: string;
  opacity: number;
}

export const useEnhanced3DSnapping = (
  wallSegments: WallSegment[],
  placedProducts: PlacedProduct[],
  scale: number
) => {
  const [snapGuides, setSnapGuides] = useState<SnapGuide3D[]>([]);
  const [activeSnap, setActiveSnap] = useState<Enhanced3DSnapResult | null>(null);

  const snapToProducts = (
    position3D: [number, number, number],
    draggedProduct: PlacedProduct,
    products: PlacedProduct[]
  ): { snapped: boolean; position: [number, number, number]; type: string; confidence: number } => {
    const PRODUCT_SNAP_DISTANCE = 0.3;
    let bestSnap = { snapped: false, position: position3D, type: 'none', confidence: 0 };

    // Simplified product snapping for now
    products.forEach(product => {
      if (product.id === draggedProduct.id) return;
      
      const productPos3D = canvasTo3DWorld(product.position, scale);
      const distance = Math.sqrt(
        Math.pow(position3D[0] - productPos3D[0], 2) +
        Math.pow(position3D[2] - productPos3D[2], 2)
      );

      if (distance < PRODUCT_SNAP_DISTANCE) {
        const confidence = 1 - (distance / PRODUCT_SNAP_DISTANCE);
        if (confidence > bestSnap.confidence) {
          bestSnap = {
            snapped: true,
            position: [productPos3D[0] + 0.6, position3D[1], productPos3D[2]],
            type: 'product-edge',
            confidence
          };
        }
      }
    });

    return bestSnap;
  };
      const productRotation = product.rotation || 0;
      
      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(position3D[0] - productPos3D[0], 2) +
        Math.pow(position3D[2] - productPos3D[2], 2)
      );

      if (distance < PRODUCT_SNAP_DISTANCE) {
        // Enhanced corner/edge snapping for seamless connection
        const snapPositions: Array<{ pos: [number, number, number]; type: string }> = [];
        
        // Calculate offsets considering rotation
        const cos1 = Math.cos(productRotation);
        const sin1 = Math.sin(productRotation);
        const cos2 = Math.cos(draggedRotation);
        const sin2 = Math.sin(draggedRotation);
        
        // Right edge of existing product (for left edge of dragged product)
        snapPositions.push({
          pos: [
            productPos3D[0] + (productWidth/2 * cos1 - 0 * sin1) + (draggedWidth/2 * cos2 - 0 * sin2),
            position3D[1],
            productPos3D[2] + (productWidth/2 * sin1 + 0 * cos1) + (draggedWidth/2 * sin2 + 0 * cos2)
          ],
          type: 'edge-right'
        });
        
        // Left edge of existing product (for right edge of dragged product)
        snapPositions.push({
          pos: [
            productPos3D[0] - (productWidth/2 * cos1 - 0 * sin1) - (draggedWidth/2 * cos2 - 0 * sin2),
            position3D[1],
            productPos3D[2] - (productWidth/2 * sin1 + 0 * cos1) - (draggedWidth/2 * sin2 + 0 * cos2)
          ],
          type: 'edge-left'
        });
        
        // Top edge (for bottom edge)
        snapPositions.push({
          pos: [
            productPos3D[0] + (0 * cos1 - productDepth/2 * sin1) + (0 * cos2 + draggedDepth/2 * sin2),
            position3D[1],
            productPos3D[2] + (0 * sin1 + productDepth/2 * cos1) + (0 * sin2 + draggedDepth/2 * cos2)
          ],
          type: 'edge-top'
        });
        
        // Bottom edge (for top edge)
        snapPositions.push({
          pos: [
            productPos3D[0] - (0 * cos1 - productDepth/2 * sin1) - (0 * cos2 + draggedDepth/2 * sin2),
            position3D[1],
            productPos3D[2] - (0 * sin1 + productDepth/2 * cos1) - (0 * sin2 + draggedDepth/2 * cos2)
          ],
          type: 'edge-bottom'
        });

        // Find the closest snap position
        snapPositions.forEach(snap => {
          const snapDistance = Math.sqrt(
            Math.pow(position3D[0] - snap.pos[0], 2) +
            Math.pow(position3D[2] - snap.pos[2], 2)
          );
          
          if (snapDistance < PRODUCT_SNAP_DISTANCE) {
            const confidence = 1 - (snapDistance / PRODUCT_SNAP_DISTANCE);
            if (confidence > bestSnap.confidence) {
              bestSnap = {
                snapped: true,
                position: snap.pos,
                type: `product-${snap.type}`,
                confidence
              };
            }
          }
        });
      }
    });

    return bestSnap;
  };

export const useEnhanced3DSnapping = (
  wallSegments: WallSegment[],
  placedProducts: PlacedProduct[],
  scale: number
) => {
  const [snapGuides, setSnapGuides] = useState<SnapGuide3D[]>([]);
  const [activeSnap, setActiveSnap] = useState<Enhanced3DSnapResult | null>(null);

  const snapToPosition = useCallback((
    position3D: [number, number, number],
    draggedProduct: PlacedProduct,
    allowedSnapTypes: string[] = ['product', 'grid']
  ): Enhanced3DSnapResult => {
    const SNAP_DISTANCE = 0.3; // 30cm

    let bestSnap: Enhanced3DSnapResult = {
      snapped: false,
      position: position3D,
      snapType: 'none',
      confidence: 0,
    };

    // Product snapping
    if (allowedSnapTypes.includes('product')) {
      const productSnap = snapToProducts(position3D, draggedProduct, placedProducts);
      if (productSnap.snapped && productSnap.confidence > bestSnap.confidence) {
        bestSnap = {
          snapped: true,
          position: productSnap.position,
          snapType: 'product',
          confidence: productSnap.confidence
        };
      }
    }

    // Grid snapping
    if (allowedSnapTypes.includes('grid') && !bestSnap.snapped) {
      const gridSize = 0.5; // 50cm grid
      const gx = Math.round(position3D[0] / gridSize) * gridSize;
      const gz = Math.round(position3D[2] / gridSize) * gridSize;
      const gridDistance = Math.sqrt(
        Math.pow(position3D[0] - gx, 2) + Math.pow(position3D[2] - gz, 2)
      );
      
      if (gridDistance < SNAP_DISTANCE) {
        const confidence = 1 - (gridDistance / SNAP_DISTANCE);
        if (confidence > bestSnap.confidence) {
          bestSnap = {
            snapped: true,
            position: [gx, position3D[1], gz],
            snapType: 'grid',
            confidence: confidence * 0.5 // Lower priority
          };
        }
      }
    }

    return bestSnap;
  }, [placedProducts, scale]);

  const updateSnapGuides = useCallback((snapResult: Enhanced3DSnapResult) => {
    const guides: SnapGuide3D[] = [];
    if (snapResult.snapped) {
      switch (snapResult.snapType) {
        case 'product':
          guides.push({ type: 'point', position: [snapResult.position[0], 0.1, snapResult.position[2]], color: '#4ecdc4', opacity: 0.9 });
          break;
        case 'grid':
          guides.push({ type: 'grid', position: snapResult.position, color: '#95a5a6', opacity: 0.4 });
          break;
      }
    }
    setSnapGuides(guides);
    setActiveSnap(snapResult);
  }, []);

  const clearSnapGuides = useCallback(() => {
    setSnapGuides([]);
    setActiveSnap(null);
  }, []);

  return { snapToPosition, snapGuides, activeSnap, updateSnapGuides, clearSnapGuides };
};
