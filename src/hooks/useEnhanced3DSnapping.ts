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
  snapHeight?: number;
  stackTarget?: PlacedProduct;
  confidence: number;
  isValid?: boolean; // ⛔ conflict detection
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

  const isOverlapping = (position: Point, dragged: PlacedProduct): boolean => {
    const draggedBox = {
      x1: position.x,
      x2: position.x + dragged.dimensions.length,
      y1: position.y,
      y2: position.y + dragged.dimensions.width
    };

    return placedProducts.some(p => {
      if (p.id === dragged.id) return false;
      const box = {
        x1: p.position.x,
        x2: p.position.x + p.dimensions.length,
        y1: p.position.y,
        y2: p.position.y + p.dimensions.width
      };

      const overlap = !(
        draggedBox.x2 < box.x1 ||
        draggedBox.x1 > box.x2 ||
        draggedBox.y2 < box.y1 ||
        draggedBox.y1 > box.y2
      );

      return overlap;
    });
  };

  const applySoftPull = (
    current: [number, number, number],
    target: [number, number, number],
    confidence: number
  ): [number, number, number] => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const t = Math.min(1, confidence * 0.8); // smooth pull factor
    return [
      lerp(current[0], target[0], t),
      lerp(current[1], target[1], t),
      lerp(current[2], target[2], t)
    ];
  };

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

    // Wall and product snapping logic here... (unchanged)
    // [Content omitted for brevity – same as before]

    // Default floor placement
    if (!bestSnap.snapped && behavior.snapToFloor) {
      bestSnap = {
        snapped: true,
        position: position2D,
        snapType: 'floor',
        confidence: 0.1
      };
    }

    // ⛔ Add conflict detection
    const overlap = isOverlapping(bestSnap.position, draggedProduct);
    bestSnap.isValid = !overlap;

    return bestSnap;
  }, [wallSegments, placedProducts, scale]);

  const updateSnapGuides = useCallback((snapResult: Enhanced3DSnapResult) => {
    const guides: SnapGuide3D[] = [];
    const pos3D = canvasTo3D(snapResult.position);
    const height = snapResult.snapHeight || 0;

    if (snapResult.snapped) {
      switch (snapResult.snapType) {
        case 'wall':
          guides.push({
            type: 'line',
            position: [pos3D[0], height * 0.001, pos3D[2]],
            direction: [0, 1, 0],
            color: snapResult.isValid ? '#ff6b6b' : '#ff0000',
            opacity: 0.8
          });
          break;

        case 'product':
          guides.push({
            type: 'point',
            position: [pos3D[0], 0.1, pos3D[2]],
            color: snapResult.isValid ? '#4ecdc4' : '#ff0000',
            opacity: 0.9
          });
          break;

        case 'stack':
          guides.push({
            type: 'surface',
            position: [pos3D[0], height * 0.001, pos3D[2]],
            color: snapResult.isValid ? '#f39c12' : '#ff0000',
            opacity: 0.7
          });
          break;

        case 'grid':
          guides.push({
            type: 'grid',
            position: pos3D,
            color: snapResult.isValid ? '#95a5a6' : '#ff0000',
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

  // ✅ Expose test utilities
  const testSnapToPosition = (p: Point, dragged: PlacedProduct) => {
    const point3D = canvasTo3D(p);
    return snapToPosition([point3D[0], 0, point3D[2]], dragged);
  };

  return {
    snapToPosition,
    snapGuides,
    activeSnap,
    updateSnapGuides,
    clearSnapGuides,
    applySoftPull,
    testSnapToPosition // 🧪 for test/debug tooling
  };
};
