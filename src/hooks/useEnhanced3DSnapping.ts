import { useState, useCallback } from 'react';
import { PlacedProduct, WallSegment } from '@/types/floorPlanTypes';

// Enhanced snap result with better type safety
interface Enhanced3DSnapResult {
  snapped: boolean;
  position: [number, number, number];
  snapType: 'wall' | 'product' | 'grid' | null;
  confidence: number;
}

// Enhanced visual snap guides
interface SnapGuide3D {
  type: 'line' | 'point' | 'ring';
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

  const snapToPosition = useCallback((
    position3D: [number, number, number],
    draggedProduct: PlacedProduct,
    allowedSnapTypes: string[] = ['wall', 'product', 'grid']
  ): Enhanced3DSnapResult => {
    const snapDistance = 0.2; // 200mm snap distance
    let bestSnap: Enhanced3DSnapResult = {
      snapped: false,
      position: position3D,
      snapType: null,
      confidence: 0
    };

    // Priority 1: Wall snapping
    if (allowedSnapTypes.includes('wall')) {
      for (const wall of wallSegments) {
        if (!wall.visible) continue;

        // Convert wall coordinates to 3D
        const wallStart = [
          wall.start.x * scale * 0.001,
          0,
          wall.start.y * scale * 0.001
        ] as [number, number, number];
        
        const wallEnd = [
          wall.end.x * scale * 0.001,
          0,
          wall.end.y * scale * 0.001
        ] as [number, number, number];

        // Calculate distance to wall line
        const distance = distanceToLineSegment3D(position3D, wallStart, wallEnd);
        
        if (distance < snapDistance) {
          // Snap to wall with offset based on product dimensions
          const productOffset = (draggedProduct.dimensions?.width || 400) * 0.001 * 0.5;
          const wallVector = [
            wallEnd[0] - wallStart[0],
            0,
            wallEnd[2] - wallStart[2]
          ];
          const wallLength = Math.sqrt(wallVector[0] ** 2 + wallVector[2] ** 2);
          const wallNormal = [-wallVector[2] / wallLength, 0, wallVector[0] / wallLength];
          
          const snapPos = [
            position3D[0] + wallNormal[0] * productOffset,
            position3D[1],
            position3D[2] + wallNormal[2] * productOffset
          ] as [number, number, number];

          const confidence = 1 - (distance / snapDistance);
          if (confidence > bestSnap.confidence) {
            bestSnap = {
              snapped: true,
              position: snapPos,
              snapType: 'wall',
              confidence
            };
          }
        }
      }
    }

    // Priority 2: Product-to-product snapping
    if (allowedSnapTypes.includes('product') && bestSnap.confidence < 0.8) {
      for (const product of placedProducts) {
        if (product.id === draggedProduct.id) continue;

        const productPos = [
          product.position.x * scale * 0.001,
          0,
          product.position.y * scale * 0.001
        ] as [number, number, number];

        const distance = Math.sqrt(
          (position3D[0] - productPos[0]) ** 2 +
          (position3D[2] - productPos[2]) ** 2
        );

        if (distance < snapDistance * 1.5) {
          // Edge-to-edge snapping
          const productWidth = (product.dimensions?.width || 400) * 0.001;
          const draggedWidth = (draggedProduct.dimensions?.width || 400) * 0.001;
          
          const snapDistance2D = productWidth * 0.5 + draggedWidth * 0.5;
          
          // Snap to product edge
          const direction = [
            position3D[0] - productPos[0],
            0,
            position3D[2] - productPos[2]
          ];
          const dirLength = Math.sqrt(direction[0] ** 2 + direction[2] ** 2);
          
          if (dirLength > 0) {
            const snapPos = [
              productPos[0] + (direction[0] / dirLength) * snapDistance2D,
              position3D[1],
              productPos[2] + (direction[2] / dirLength) * snapDistance2D
            ] as [number, number, number];

            const confidence = 1 - (distance / (snapDistance * 1.5));
            if (confidence > bestSnap.confidence) {
              bestSnap = {
                snapped: true,
                position: snapPos,
                snapType: 'product',
                confidence
              };
            }
          }
        }
      }
    }

    // Priority 3: Grid snapping
    if (allowedSnapTypes.includes('grid') && bestSnap.confidence < 0.6) {
      const gridSize = 0.5; // 500mm grid
      const gridX = Math.round(position3D[0] / gridSize) * gridSize;
      const gridZ = Math.round(position3D[2] / gridSize) * gridSize;
      
      const gridDistance = Math.sqrt(
        (position3D[0] - gridX) ** 2 + (position3D[2] - gridZ) ** 2
      );

      if (gridDistance < snapDistance * 0.5) {
        const confidence = 1 - (gridDistance / (snapDistance * 0.5));
        if (confidence > bestSnap.confidence) {
          bestSnap = {
            snapped: true,
            position: [gridX, position3D[1], gridZ],
            snapType: 'grid',
            confidence
          };
        }
      }
    }

    return bestSnap;
  }, [wallSegments, placedProducts, scale]);

  const updateSnapGuides = useCallback((snapResult: Enhanced3DSnapResult) => {
    setActiveSnap(snapResult);
    
    if (!snapResult.snapped) {
      setSnapGuides([]);
      return;
    }

    const guides: SnapGuide3D[] = [];

    switch (snapResult.snapType) {
      case 'wall':
        guides.push({
          type: 'line',
          position: snapResult.position,
          direction: [0, 1, 0],
          color: '#00ff00',
          opacity: 0.8
        });
        break;
      
      case 'product':
        guides.push({
          type: 'ring',
          position: snapResult.position,
          color: '#ffff00',
          opacity: 0.6
        });
        break;
      
      case 'grid':
        guides.push({
          type: 'point',
          position: snapResult.position,
          color: '#00ffff',
          opacity: 0.4
        });
        break;
    }

    setSnapGuides(guides);
  }, []);

  const clearSnapGuides = useCallback(() => {
    setSnapGuides([]);
    setActiveSnap(null);
  }, []);

  return {
    snapToPosition,
    snapGuides,
    activeSnap,
    updateSnapGuides,
    clearSnapGuides
  };
};

// Helper function for distance to line segment in 3D
function distanceToLineSegment3D(
  point: [number, number, number],
  lineStart: [number, number, number],
  lineEnd: [number, number, number]
): number {
  const dx = lineEnd[0] - lineStart[0];
  const dz = lineEnd[2] - lineStart[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  
  if (length === 0) {
    return Math.sqrt(
      (point[0] - lineStart[0]) ** 2 + (point[2] - lineStart[2]) ** 2
    );
  }
  
  const t = Math.max(0, Math.min(1, 
    ((point[0] - lineStart[0]) * dx + (point[2] - lineStart[2]) * dz) / (length * length)
  ));
  
  const projection = [
    lineStart[0] + t * dx,
    lineStart[1],
    lineStart[2] + t * dz
  ];
  
  return Math.sqrt(
    (point[0] - projection[0]) ** 2 + (point[2] - projection[2]) ** 2
  );
}