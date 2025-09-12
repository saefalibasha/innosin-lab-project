import { useState, useCallback } from 'react';
import { Point, PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { canvasTo3D, threeDToCanvas } from '@/utils/coordinateTransform';
import { getProductBehavior, canProductsConnect, calculateOptimalSnapDistance } from '@/utils/productBehaviors';
import * as THREE from 'three';

interface Enhanced3DSnapResult {
  snapped: boolean;
  position: Point; // canvas px space
  snapType: 'wall' | 'floor' | 'product' | 'grid' | 'stack' | null;
  target?: PlacedProduct | WallSegment;
  snapHeight?: number; // For wall-mounted items (in mm)
  stackTarget?: PlacedProduct; // For stacking
  confidence: number; // 0-1
}

interface SnapGuide3D {
  type: 'line' | 'point' | 'grid' | 'surface';
  position: [number, number, number];
  direction?: [number, number, number];
  color: string;
  opacity: number;
}

// Helpers
function degToRad(deg?: number) {
  return ((deg || 0) * Math.PI) / 180;
}

function orientedDimsMeters(product: PlacedProduct): { widthM: number; lengthM: number; heightM: number } {
  const widthM = (product.dimensions?.width || 600) * 0.001;
  const lengthM = (product.dimensions?.length || 600) * 0.001;
  const heightM = (product.dimensions?.height || 850) * 0.001;

  const rot = ((product.rotation || 0) % 180 + 180) % 180; // 0..179
  if (rot === 90) {
    return { widthM: lengthM, lengthM: widthM, heightM };
  }
  return { widthM, lengthM, heightM };
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
    const [x, , z] = position3D; // meters
    const position2D = threeDToCanvas(x, z, scale); // canvas px
    const behavior = getProductBehavior(draggedProduct);
    const snapDistanceMm = calculateOptimalSnapDistance(draggedProduct);
    const snapRadius = snapDistanceMm * 0.001; // meters (do NOT multiply by scale)

    let bestSnap: Enhanced3DSnapResult = {
      snapped: false,
      position: position2D,
      snapType: null,
      confidence: 0,
    };

    // 1) Snap to walls (keeps items flush to walls)
    if (allowedSnapTypes.includes('wall') && behavior.snapToWalls) {
      for (const wall of wallSegments) {
        const wallStart = canvasTo3D(wall.start, scale);
        const wallEnd = canvasTo3D(wall.end, scale);

        const lineVec = new THREE.Vector3(wallEnd[0] - wallStart[0], 0, wallEnd[2] - wallStart[2]);
        const pointVec = new THREE.Vector3(x - wallStart[0], 0, z - wallStart[2]);
        const lineLen = lineVec.length();
        if (!lineLen) continue;

        const t = Math.max(0, Math.min(1, pointVec.dot(lineVec) / (lineLen * lineLen)));
        const closest = new THREE.Vector3(wallStart[0] + t * lineVec.x, 0, wallStart[2] + t * lineVec.z);
        const distance = new THREE.Vector3(x, 0, z).distanceTo(closest);

        if (distance <= snapRadius) {
          const normal = new THREE.Vector3(-lineVec.z, 0, lineVec.x).normalize();
          const { lengthM: depthM } = orientedDimsMeters(draggedProduct);
          const offset = behavior.canMountOnWall ? 0.05 : depthM / 2 + 0.02; // 2cm safety
          const snapPos = closest.clone().add(normal.multiplyScalar(offset));

          const confidence = 1 - distance / snapRadius;
          if (confidence > bestSnap.confidence) {
            bestSnap = {
              snapped: true,
              position: threeDToCanvas(snapPos.x, snapPos.z, scale),
              snapType: 'wall',
              target: wall,
              snapHeight: behavior.canMountOnWall ? behavior.defaultMountHeight : 0,
              confidence,
            };
          }
        }
      }
    }

    // 2) Product-to-Product snapping (edge-to-edge, seamless)
    if (allowedSnapTypes.includes('product') && behavior.snapToProducts) {
      const draggedDims = orientedDimsMeters(draggedProduct);
      const curr = new THREE.Vector3(x, 0, z);

      for (const other of placedProducts) {
        if (other.id === draggedProduct.id) continue;

        const otherCenterArr = canvasTo3D(other.position, scale);
        const otherCenter = new THREE.Vector3(otherCenterArr[0], 0, otherCenterArr[2]);
        const otherDims = orientedDimsMeters(other);

        const dx = curr.x - otherCenter.x;
        const dz = curr.z - otherCenter.z;

        // Alignment tolerances
        const alignTol = Math.min(0.05, snapRadius); // <= 5cm
        const joinGap = 0; // seamless edge

        // Side-by-side along X (fronts aligned in Z)
        if (Math.abs(dz) <= alignTol) {
          const targetX = otherCenter.x + Math.sign(dx || 1) * (otherDims.widthM / 2 + draggedDims.widthM / 2 + joinGap);
          const deltaX = Math.abs(curr.x - targetX);
          if (deltaX <= snapRadius) {
            const confidence = 1 - deltaX / snapRadius;
            const boosted = canProductsConnect(draggedProduct, other) ? Math.min(1, confidence * 1.2) : confidence;
            if (boosted > bestSnap.confidence) {
              bestSnap = {
                snapped: true,
                position: threeDToCanvas(targetX, otherCenter.z, scale),
                snapType: 'product',
                target: other,
                confidence: boosted,
              };
            }
          }
        }

        // Side-by-side along Z (fronts aligned in X)
        if (Math.abs(dx) <= alignTol) {
          const targetZ = otherCenter.z + Math.sign(dz || 1) * (otherDims.lengthM / 2 + draggedDims.lengthM / 2 + joinGap);
          const deltaZ = Math.abs(curr.z - targetZ);
          if (deltaZ <= snapRadius) {
            const confidence = 1 - deltaZ / snapRadius;
            const boosted = canProductsConnect(draggedProduct, other) ? Math.min(1, confidence * 1.2) : confidence;
            if (boosted > bestSnap.confidence) {
              bestSnap = {
                snapped: true,
                position: threeDToCanvas(otherCenter.x, targetZ, scale),
                snapType: 'product',
                target: other,
                confidence: boosted,
              };
            }
          }
        }

        // Optional: stacking for modular
        const allowStacking = getProductBehavior(draggedProduct).allowStacking && getProductBehavior(other).allowStacking && canProductsConnect(draggedProduct, other);
        if (allowStacking) {
          const dist = curr.distanceTo(otherCenter);
          if (dist <= snapRadius * 0.5) {
            const confidence = 1 - dist / (snapRadius * 0.5);
            if (confidence > bestSnap.confidence) {
              bestSnap = {
                snapped: true,
                position: threeDToCanvas(otherCenter.x, otherCenter.z, scale),
                snapType: 'stack',
                target: other,
                stackTarget: other,
                snapHeight: (other.dimensions?.height || 850), // mm
                confidence,
              };
            }
          }
        }
      }
    }

    // 3) Grid snapping (lowest priority)
    if (allowedSnapTypes.includes('grid') && behavior.snapToFloor) {
      const gridSizeM = 0.5; // 500mm
      const gx = Math.round(x / gridSizeM) * gridSizeM;
      const gz = Math.round(z / gridSizeM) * gridSizeM;
      const gridDist = Math.hypot(x - gx, z - gz);
      const confidence = 1 - gridDist / snapRadius;
      if (gridDist <= snapRadius && confidence > bestSnap.confidence * 0.5) {
        bestSnap = {
          snapped: true,
          position: threeDToCanvas(gx, gz, scale),
          snapType: 'grid',
          confidence: confidence * 0.5,
        };
      }
    }

    // 4) Default: keep floor placement
    if (!bestSnap.snapped && behavior.snapToFloor) {
      bestSnap = {
        snapped: true,
        position: position2D,
        snapType: 'floor',
        confidence: 0.1,
      };
    }

    return bestSnap;
  }, [wallSegments, placedProducts, scale]);

  const updateSnapGuides = useCallback((snapResult: Enhanced3DSnapResult) => {
    const guides: SnapGuide3D[] = [];
    if (snapResult.snapped) {
      const pos3D = canvasTo3D(snapResult.position, scale);
      const heightM = (snapResult.snapHeight || 0) * 0.001;

      switch (snapResult.snapType) {
        case 'wall':
          guides.push({ type: 'line', position: [pos3D[0], heightM, pos3D[2]], direction: [0, 1, 0], color: '#ff6b6b', opacity: 0.8 });
          break;
        case 'product':
          guides.push({ type: 'point', position: [pos3D[0], 0.1, pos3D[2]], color: '#4ecdc4', opacity: 0.9 });
          break;
        case 'stack':
          guides.push({ type: 'surface', position: [pos3D[0], heightM, pos3D[2]], color: '#f39c12', opacity: 0.7 });
          break;
        case 'grid':
          guides.push({ type: 'grid', position: pos3D, color: '#95a5a6', opacity: 0.4 });
          break;
      }
    }
    setSnapGuides(guides);
    setActiveSnap(snapResult);
  }, [scale]);

  const clearSnapGuides = useCallback(() => {
    setSnapGuides([]);
    setActiveSnap(null);
  }, []);

  return { snapToPosition, snapGuides, activeSnap, updateSnapGuides, clearSnapGuides };
};
