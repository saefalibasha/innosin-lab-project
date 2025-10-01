import { useState, useCallback } from 'react';
import { PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { canvasTo3DWorld, worldTo2DCanvas } from '@/utils/coordinateUtils';
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
  scale: number,
  origin?: { minX: number; minY: number }
) => {
  const [snapGuides, setSnapGuides] = useState<SnapGuide3D[]>([]);
  const [activeSnap, setActiveSnap] = useState<Enhanced3DSnapResult | null>(null);

  const snapToProducts = useCallback((
    position3D: [number, number, number],
    draggedProduct: PlacedProduct,
    products: PlacedProduct[]
  ): { snapped: boolean; position: [number, number, number]; type: string; confidence: number } => {
    const PRODUCT_SNAP_DISTANCE = 0.2; // 20cm in 3D world units - tighter for precise snapping
    let bestSnap = { snapped: false, position: position3D, type: 'none', confidence: 0 };

    // Get dimensions of dragged product: length=X-axis (depth), width=Z-axis (width)
    const draggedLengthM = (draggedProduct.dimensions?.length || 600) * 0.001; // X-axis in meters
    const draggedWidthM = (draggedProduct.dimensions?.width || 600) * 0.001; // Z-axis in meters
    const draggedRotation = THREE.MathUtils.degToRad(draggedProduct.rotation || 0); // Convert to radians

    products.forEach(product => {
      if (product.id === draggedProduct.id) return;

      // Convert product position to 3D
      const productPos3D = canvasTo3DWorld(product.position, scale, origin);
      
      // Get existing product dimensions: length=X-axis, width=Z-axis
      const productLengthM = (product.dimensions?.length || 600) * 0.001; // X-axis
      const productWidthM = (product.dimensions?.width || 600) * 0.001; // Z-axis
      const productRotation = THREE.MathUtils.degToRad(product.rotation || 0); // Convert to radians
      
      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(position3D[0] - productPos3D[0], 2) +
        Math.pow(position3D[2] - productPos3D[2], 2)
      );

      if (distance < PRODUCT_SNAP_DISTANCE) {
        // Enhanced corner/edge snapping for seamless connection
        const snapPositions: Array<{ pos: [number, number, number]; type: string }> = [];
        
        // Calculate offsets considering rotation (length=X, width=Z)
        const cos1 = Math.cos(productRotation);
        const sin1 = Math.sin(productRotation);
        const cos2 = Math.cos(draggedRotation);
        const sin2 = Math.sin(draggedRotation);
        
        // Right edge (+Z direction) of existing product aligns with left edge of dragged product
        snapPositions.push({
          pos: [
            productPos3D[0] + (productLengthM/2 * cos1) + (draggedLengthM/2 * cos2),
            position3D[1],
            productPos3D[2] + (productWidthM/2) + (draggedWidthM/2)
          ],
          type: 'edge-right'
        });
        
        // Left edge (-Z direction) of existing product aligns with right edge of dragged product
        snapPositions.push({
          pos: [
            productPos3D[0] + (productLengthM/2 * cos1) - (draggedLengthM/2 * cos2),
            position3D[1],
            productPos3D[2] - (productWidthM/2) - (draggedWidthM/2)
          ],
          type: 'edge-left'
        });
        
        // Front edge (+X direction) of existing product aligns with back edge of dragged product
        snapPositions.push({
          pos: [
            productPos3D[0] + (productLengthM/2) + (draggedLengthM/2),
            position3D[1],
            productPos3D[2] + (productWidthM/2 * sin1) + (draggedWidthM/2 * sin2)
          ],
          type: 'edge-front'
        });
        
        // Back edge (-X direction) of existing product aligns with front edge of dragged product
        snapPositions.push({
          pos: [
            productPos3D[0] - (productLengthM/2) - (draggedLengthM/2),
            position3D[1],
            productPos3D[2] + (productWidthM/2 * sin1) + (draggedWidthM/2 * sin2)
          ],
          type: 'edge-back'
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
  }, [scale]);

  const snapToPosition = useCallback((
    position3D: [number, number, number],
    draggedProduct: PlacedProduct,
    allowedSnapTypes: string[] = ['product', 'grid']
  ): Enhanced3DSnapResult => {
    const SNAP_DISTANCE = 0.2; // 20cm - tighter for precise alignment

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
  }, [placedProducts, snapToProducts]);

  const updateSnapGuides = useCallback((snapResult: Enhanced3DSnapResult) => {
    const guides: SnapGuide3D[] = [];
    if (snapResult.snapped) {
      switch (snapResult.snapType) {
        case 'product':
          guides.push({ 
            type: 'point', 
            position: [snapResult.position[0], 0.1, snapResult.position[2]], 
            color: '#4ecdc4', 
            opacity: 0.9 
          });
          break;
        case 'grid':
          guides.push({ 
            type: 'grid', 
            position: snapResult.position, 
            color: '#95a5a6', 
            opacity: 0.4 
          });
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