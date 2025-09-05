import { useState, useCallback, useMemo } from 'react';
import { Point, PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { canvasTo3D, threeDToCanvas } from '@/utils/coordinateTransform';
import { getProductBehavior, canProductsConnect, calculateOptimalSnapDistance } from '@/utils/productBehaviors';
import * as THREE from 'three';

interface Enhanced3DSnapResult {
  snapped: boolean;
  position: Point;
  snapType: 'wall' | 'floor' | 'product' | 'grid' | 'stack' | null;
  target?: PlacedProduct | WallSegment;
  snapHeight?: number; // For wall-mounted items
  stackTarget?: PlacedProduct; // For stacking
  confidence: number; // 0-1, how confident we are in this snap
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

  const snapToPosition = useCallback((
    position3D: [number, number, number],
    draggedProduct: PlacedProduct,
    allowedSnapTypes: string[] = ['wall', 'product', 'floor', 'grid']
  ): Enhanced3DSnapResult => {
    const [x, y, z] = position3D;
    const position2D = threeDToCanvas(x, z);
    const behavior = getProductBehavior(draggedProduct);
    const snapDistance = calculateOptimalSnapDistance(draggedProduct);
    const snapRadius = snapDistance * scale * 0.001;

    let bestSnap: Enhanced3DSnapResult = {
      snapped: false,
      position: position2D,
      snapType: null,
      confidence: 0
    };

    // 1. Wall Snapping (highest priority for floor items)
    if (allowedSnapTypes.includes('wall') && behavior.snapToWalls) {
      for (const wall of wallSegments) {
        const wallStart = canvasTo3D(wall.start);
        const wallEnd = canvasTo3D(wall.end);
        
        const lineVec = new THREE.Vector3(
          wallEnd[0] - wallStart[0], 
          0, 
          wallEnd[2] - wallStart[2]
        );
        const pointVec = new THREE.Vector3(x - wallStart[0], 0, z - wallStart[2]);
        
        const lineLength = lineVec.length();
        if (lineLength === 0) continue;
        
        const t = Math.max(0, Math.min(1, pointVec.dot(lineVec) / (lineLength * lineLength)));
        const closestPoint = new THREE.Vector3(
          wallStart[0] + t * lineVec.x,
          0,
          wallStart[2] + t * lineVec.z
        );
        
        const distance = new THREE.Vector3(x, 0, z).distanceTo(closestPoint);
        
        if (distance <= snapRadius) {
          const wallNormal = new THREE.Vector3(-lineVec.z, 0, lineVec.x).normalize();
          const productWidth = (draggedProduct.dimensions?.width || 600) * scale * 0.001 / 2;
          
          let snapPos: THREE.Vector3;
          let snapHeight = 0;
          
          if (behavior.canMountOnWall) {
            // Wall-mounted: position against wall at mount height
            snapPos = closestPoint.clone().add(wallNormal.multiplyScalar(0.05)); // 5cm from wall
            snapHeight = behavior.defaultMountHeight;
          } else {
            // Floor-based: offset from wall by product width
            snapPos = closestPoint.clone().add(wallNormal.multiplyScalar(productWidth + 0.05));
            snapHeight = 0;
          }
          
          const confidence = 1 - (distance / snapRadius);
          if (confidence > bestSnap.confidence) {
            bestSnap = {
              snapped: true,
              position: threeDToCanvas(snapPos.x, snapPos.z),
              snapType: 'wall',
              target: wall,
              snapHeight,
              confidence
            };
          }
        }
      }
    }

    // 2. Product-to-Product Snapping
    if (allowedSnapTypes.includes('product') && behavior.snapToProducts) {
      for (const product of placedProducts) {
        if (product.id === draggedProduct.id) continue;
        
        const productPos = canvasTo3D(product.position);
        const productCenter = new THREE.Vector3(productPos[0], 0, productPos[2]);
        const currentPos = new THREE.Vector3(x, 0, z);
        const distance = currentPos.distanceTo(productCenter);
        
        const productBehavior = getProductBehavior(product);
        const productWidth = (product.dimensions?.width || 600) * scale * 0.001;
        const productLength = (product.dimensions?.length || 600) * scale * 0.001;
        const draggedWidth = (draggedProduct.dimensions?.width || 600) * scale * 0.001;
        const draggedLength = (draggedProduct.dimensions?.length || 600) * scale * 0.001;
        
        // Edge-to-edge snapping
        const snapDistanceX = (productWidth + draggedWidth) / 2 + 0.02; // 2cm gap
        const snapDistanceZ = (productLength + draggedLength) / 2 + 0.02;
        
        // Check for side-by-side alignment
        if (Math.abs(distance - snapDistanceX) <= snapRadius) {
          const direction = currentPos.clone().sub(productCenter).normalize();
          const snapPos = productCenter.clone().add(direction.multiplyScalar(snapDistanceX));
          
          const confidence = 1 - (Math.abs(distance - snapDistanceX) / snapRadius);
          
          // Bonus confidence for same-series products
          if (canProductsConnect(draggedProduct, product)) {
            confidence * 1.2;
          }
          
          if (confidence > bestSnap.confidence) {
            bestSnap = {
              snapped: true,
              position: threeDToCanvas(snapPos.x, snapPos.z),
              snapType: 'product',
              target: product,
              confidence
            };
          }
        }
        
        // Stacking (for modular cabinets)
        if (behavior.allowStacking && productBehavior.allowStacking && 
            canProductsConnect(draggedProduct, product)) {
          if (distance <= snapRadius * 0.5) { // Closer tolerance for stacking
            const confidence = 1 - (distance / (snapRadius * 0.5));
            if (confidence > bestSnap.confidence) {
              bestSnap = {
                snapped: true,
                position: threeDToCanvas(productCenter.x, productCenter.z),
                snapType: 'stack',
                target: product,
                stackTarget: product,
                snapHeight: (product.dimensions?.height || 850) * scale * 0.001,
                confidence
              };
            }
          }
        }
      }
    }

    // 3. Floor Grid Snapping (lowest priority)
    if (allowedSnapTypes.includes('grid') && behavior.snapToFloor) {
      const gridSize = 0.5; // 500mm grid in 3D units
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedZ = Math.round(z / gridSize) * gridSize;
      
      const gridDistance = Math.sqrt((x - snappedX) ** 2 + (z - snappedZ) ** 2);
      const confidence = 1 - (gridDistance / snapRadius);
      
      if (gridDistance <= snapRadius && confidence > bestSnap.confidence * 0.5) {
        bestSnap = {
          snapped: true,
          position: threeDToCanvas(snappedX, snappedZ),
          snapType: 'grid',
          confidence: confidence * 0.5 // Lower priority
        };
      }
    }

    // 4. Default floor placement
    if (!bestSnap.snapped && behavior.snapToFloor) {
      bestSnap = {
        snapped: true,
        position: position2D,
        snapType: 'floor',
        confidence: 0.1
      };
    }

    return bestSnap;
  }, [wallSegments, placedProducts, scale]);

  const updateSnapGuides = useCallback((snapResult: Enhanced3DSnapResult) => {
    const guides: SnapGuide3D[] = [];
    
    if (snapResult.snapped) {
      const pos3D = canvasTo3D(snapResult.position);
      const height = snapResult.snapHeight || 0;
      
      switch (snapResult.snapType) {
        case 'wall':
          guides.push({
            type: 'line',
            position: [pos3D[0], height * 0.001, pos3D[2]],
            direction: [0, 1, 0],
            color: '#ff6b6b',
            opacity: 0.8
          });
          break;
          
        case 'product':
          guides.push({
            type: 'point',
            position: [pos3D[0], 0.1, pos3D[2]],
            color: '#4ecdc4',
            opacity: 0.9
          });
          break;
          
        case 'stack':
          guides.push({
            type: 'surface',
            position: [pos3D[0], height * 0.001, pos3D[2]],
            color: '#f39c12',
            opacity: 0.7
          });
          break;
          
        case 'grid':
          guides.push({
            type: 'grid',
            position: pos3D,
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

  return {
    snapToPosition,
    snapGuides,
    activeSnap,
    updateSnapGuides,
    clearSnapGuides
  };
};