import { useState, useCallback, useMemo } from 'react';
import { Point, PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { canvasTo3D, threeDToCanvas } from '@/utils/coordinateTransform';
import * as THREE from 'three';

interface SnapResult {
  snapped: boolean;
  position: Point;
  snapType: 'wall' | 'floor' | 'product' | 'grid' | null;
  target?: PlacedProduct | WallSegment;
  distance?: number;
}

interface SnapGuide {
  type: 'line' | 'point' | 'grid';
  position: [number, number, number];
  direction?: [number, number, number];
  color: string;
}

export const use3DSnapping = (
  wallSegments: WallSegment[],
  placedProducts: PlacedProduct[],
  scale: number,
  snapDistance: number = 200 // mm
) => {
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [isSnapping, setIsSnapping] = useState(false);

  // Convert snap distance to 3D units
  const snapRadius = snapDistance * scale * 0.001;

  const snapTo3DPosition = useCallback((
    position3D: [number, number, number],
    draggedProduct: PlacedProduct
  ): SnapResult => {
    const [x, , z] = position3D;
    const position2D = threeDToCanvas(x, z);

    // Priority: Walls > Products > Floor > Grid
    
    // 1. Snap to walls
    for (const wall of wallSegments) {
      const wallStart = canvasTo3D(wall.start);
      const wallEnd = canvasTo3D(wall.end);
      
      // Calculate distance to wall line
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
        // Offset from wall based on product size
        const wallNormal = new THREE.Vector3(-lineVec.z, 0, lineVec.x).normalize();
        const productWidth = (draggedProduct.dimensions?.width || 600) * scale * 0.001 / 2;
        const offsetPoint = closestPoint.clone().add(wallNormal.multiplyScalar(productWidth + 0.05));
        
        return {
          snapped: true,
          position: threeDToCanvas(offsetPoint.x, offsetPoint.z),
          snapType: 'wall',
          target: wall,
          distance
        };
      }
    }

    // 2. Snap to other products
    for (const product of placedProducts) {
      if (product.id === draggedProduct.id) continue;
      
      const productPos = canvasTo3D(product.position);
      const productCenter = new THREE.Vector3(productPos[0], 0, productPos[2]);
      const currentPos = new THREE.Vector3(x, 0, z);
      const distance = currentPos.distanceTo(productCenter);
      
      const productWidth = (product.dimensions?.width || 600) * scale * 0.001;
      const productDepth = (product.dimensions?.length || 600) * scale * 0.001;
      const draggedWidth = (draggedProduct.dimensions?.width || 600) * scale * 0.001;
      const draggedDepth = (draggedProduct.dimensions?.length || 600) * scale * 0.001;
      
      // Edge-to-edge snapping
      const snapDistanceX = (productWidth + draggedWidth) / 2 + 0.02; // 2cm gap
      const snapDistanceZ = (productDepth + draggedDepth) / 2 + 0.02;
      
      // Check for alignment snapping (side-by-side)
      if (Math.abs(distance - snapDistanceX) <= snapRadius) {
        const direction = currentPos.clone().sub(productCenter).normalize();
        const snapPos = productCenter.clone().add(direction.multiplyScalar(snapDistanceX));
        
        return {
          snapped: true,
          position: threeDToCanvas(snapPos.x, snapPos.z),
          snapType: 'product',
          target: product,
          distance
        };
      }
    }

    // 3. Snap to floor grid
    const gridSize = 0.5; // 500mm grid in 3D units
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedZ = Math.round(z / gridSize) * gridSize;
    
    const gridDistance = Math.sqrt((x - snappedX) ** 2 + (z - snappedZ) ** 2);
    
    if (gridDistance <= snapRadius) {
      return {
        snapped: true,
        position: threeDToCanvas(snappedX, snappedZ),
        snapType: 'grid',
        distance: gridDistance
      };
    }

    // 4. Default to floor
    return {
      snapped: true,
      position: position2D,
      snapType: 'floor',
      distance: 0
    };
  }, [wallSegments, placedProducts, scale, snapRadius]);

  const updateSnapGuides = useCallback((snapResult: SnapResult) => {
    const guides: SnapGuide[] = [];
    
    if (snapResult.snapped) {
      const pos3D = canvasTo3D(snapResult.position);
      
      switch (snapResult.snapType) {
        case 'wall':
          guides.push({
            type: 'line',
            position: pos3D,
            color: '#ff6b6b'
          });
          break;
        case 'product':
          guides.push({
            type: 'point',
            position: pos3D,
            color: '#4ecdc4'
          });
          break;
        case 'grid':
          guides.push({
            type: 'grid',
            position: pos3D,
            color: '#95a5a6'
          });
          break;
      }
    }
    
    setSnapGuides(guides);
  }, []);

  const clearSnapGuides = useCallback(() => {
    setSnapGuides([]);
  }, []);

  return {
    snapTo3DPosition,
    snapGuides,
    updateSnapGuides,
    clearSnapGuides,
    isSnapping,
    setIsSnapping
  };
};