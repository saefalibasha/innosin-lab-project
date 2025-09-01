
import { useState, useCallback } from 'react';
import { Point, PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { mmToCanvas } from '@/utils/measurements';

export interface CollisionResult {
  hasCollision: boolean;
  type: 'wall' | 'furniture' | 'boundary' | null;
  collisionObject?: PlacedProduct | WallSegment;
  snapSuggestion?: Point;
  snapType?: 'edge' | 'alignment' | 'corner';
}

export interface SnapResult {
  snapped: boolean;
  position: Point;
  snapType: 'edge-to-edge' | 'alignment' | 'corner' | null;
  target?: PlacedProduct;
  gap: number;
}

export const useEnhancedCollisionDetection = (
  wallSegments: WallSegment[],
  placedProducts: PlacedProduct[],
  canvasWidth: number,
  canvasHeight: number,
  scale: number
) => {
  const FURNITURE_SNAP_THRESHOLD = mmToCanvas(15, scale); // 15mm for furniture snapping
  const WALL_COLLISION_BUFFER = mmToCanvas(50, scale); // 50mm buffer from walls
  const FURNITURE_COLLISION_BUFFER = mmToCanvas(2, scale); // 2mm between furniture pieces

  const getRotatedBounds = useCallback((product: PlacedProduct, position: Point) => {
    const width = mmToCanvas(product.dimensions.length, scale);
    const height = mmToCanvas(product.dimensions.width, scale);
    const rotation = product.rotation || 0;

    // Calculate rotated corners
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const corners = [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight }
    ].map(corner => ({
      x: position.x + corner.x * cos - corner.y * sin,
      y: position.y + corner.x * sin + corner.y * cos
    }));

    // Calculate bounding box of rotated rectangle
    const xs = corners.map(c => c.x);
    const ys = corners.map(c => c.y);

    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
      corners
    };
  }, [scale]);

  const checkFurnitureSnap = useCallback((
    draggedProduct: PlacedProduct,
    position: Point
  ): SnapResult => {
    const draggedBounds = getRotatedBounds(draggedProduct, position);
    
    let bestSnap: SnapResult = {
      snapped: false,
      position,
      snapType: null,
      gap: Infinity
    };

    for (const product of placedProducts) {
      if (product.id === draggedProduct.id) continue;
      
      const targetBounds = getRotatedBounds(product, product.position);
      
      // Check for edge-to-edge snapping
      const snapChecks = [
        // Right edge of target to left edge of dragged
        {
          targetEdge: targetBounds.right,
          draggedEdge: draggedBounds.left,
          axis: 'x',
          offset: targetBounds.right - draggedBounds.left,
          snapPos: { x: position.x + (targetBounds.right - draggedBounds.left), y: position.y },
          type: 'edge-to-edge' as const
        },
        // Left edge of target to right edge of dragged
        {
          targetEdge: targetBounds.left,
          draggedEdge: draggedBounds.right,
          axis: 'x',
          offset: targetBounds.left - draggedBounds.right,
          snapPos: { x: position.x + (targetBounds.left - draggedBounds.right), y: position.y },
          type: 'edge-to-edge' as const
        },
        // Bottom edge of target to top edge of dragged
        {
          targetEdge: targetBounds.bottom,
          draggedEdge: draggedBounds.top,
          axis: 'y',
          offset: targetBounds.bottom - draggedBounds.top,
          snapPos: { x: position.x, y: position.y + (targetBounds.bottom - draggedBounds.top) },
          type: 'edge-to-edge' as const
        },
        // Top edge of target to bottom edge of dragged
        {
          targetEdge: targetBounds.top,
          draggedEdge: draggedBounds.bottom,
          axis: 'y',
          offset: targetBounds.top - draggedBounds.bottom,
          snapPos: { x: position.x, y: position.y + (targetBounds.top - draggedBounds.bottom) },
          type: 'edge-to-edge' as const
        }
      ];

      for (const check of snapChecks) {
        const distance = Math.abs(check.offset);
        
        if (distance < FURNITURE_SNAP_THRESHOLD && distance < bestSnap.gap) {
          // Check if there's sufficient overlap on the perpendicular axis
          const overlapCheck = check.axis === 'x' 
            ? (draggedBounds.bottom > targetBounds.top && draggedBounds.top < targetBounds.bottom)
            : (draggedBounds.right > targetBounds.left && draggedBounds.left < targetBounds.right);
          
          if (overlapCheck) {
            bestSnap = {
              snapped: true,
              position: check.snapPos,
              snapType: check.type,
              target: product,
              gap: distance
            };
          }
        }
      }

      // Check for alignment snapping (center-to-center)
      const centerDistance = {
        x: Math.abs(position.x - product.position.x),
        y: Math.abs(position.y - product.position.y)
      };

      // Horizontal alignment
      if (centerDistance.y < FURNITURE_SNAP_THRESHOLD && centerDistance.y < bestSnap.gap) {
        bestSnap = {
          snapped: true,
          position: { x: position.x, y: product.position.y },
          snapType: 'alignment',
          target: product,
          gap: centerDistance.y
        };
      }

      // Vertical alignment
      if (centerDistance.x < FURNITURE_SNAP_THRESHOLD && centerDistance.x < bestSnap.gap) {
        bestSnap = {
          snapped: true,
          position: { x: product.position.x, y: position.y },
          snapType: 'alignment',
          target: product,
          gap: centerDistance.x
        };
      }
    }

    return bestSnap;
  }, [placedProducts, getRotatedBounds, FURNITURE_SNAP_THRESHOLD]);

  const checkProductCollision = useCallback((
    draggedProduct: PlacedProduct,
    position: Point
  ): CollisionResult => {
    const bounds = getRotatedBounds(draggedProduct, position);
    
    // Check boundary collision
    const margin = 10;
    if (bounds.left < margin || bounds.right > canvasWidth - margin ||
        bounds.top < margin || bounds.bottom > canvasHeight - margin) {
      return { hasCollision: true, type: 'boundary' };
    }

    // Check wall collisions with enhanced precision
    for (const wall of wallSegments) {
      if (checkRotatedProductWallCollision(draggedProduct, position, wall)) {
        return { hasCollision: true, type: 'wall', collisionObject: wall };
      }
    }

    // Check furniture collisions with minimal buffer
    for (const product of placedProducts) {
      if (product.id === draggedProduct.id) continue;
      
      if (checkRotatedProductCollision(draggedProduct, position, product)) {
        return { hasCollision: true, type: 'furniture', collisionObject: product };
      }
    }

    return { hasCollision: false, type: null };
  }, [wallSegments, placedProducts, canvasWidth, canvasHeight, getRotatedBounds]);

  const checkRotatedProductWallCollision = useCallback((
    product: PlacedProduct,
    position: Point,
    wall: WallSegment
  ): boolean => {
    const bounds = getRotatedBounds(product, position);
    const wallThickness = mmToCanvas(wall.thickness || 100, scale);

    // Check if any corner of the rotated product is too close to the wall
    for (const corner of bounds.corners) {
      const distance = distanceToLineSegment(corner, wall.start, wall.end);
      if (distance < wallThickness / 2 + WALL_COLLISION_BUFFER) {
        return true;
      }
    }

    return false;
  }, [getRotatedBounds, scale, WALL_COLLISION_BUFFER]);

  const checkRotatedProductCollision = useCallback((
    product1: PlacedProduct,
    position1: Point,
    product2: PlacedProduct
  ): boolean => {
    const bounds1 = getRotatedBounds(product1, position1);
    const bounds2 = getRotatedBounds(product2, product2.position);

    // Use SAT (Separating Axis Theorem) for precise rotated rectangle collision
    const axes = [
      ...getAxesFromCorners(bounds1.corners),
      ...getAxesFromCorners(bounds2.corners)
    ];

    for (const axis of axes) {
      const proj1 = projectCornersOntoAxis(bounds1.corners, axis);
      const proj2 = projectCornersOntoAxis(bounds2.corners, axis);

      if (proj1.max + FURNITURE_COLLISION_BUFFER < proj2.min || 
          proj2.max + FURNITURE_COLLISION_BUFFER < proj1.min) {
        return false; // Separating axis found, no collision
      }
    }

    return true; // No separating axis found, collision detected
  }, [getRotatedBounds, FURNITURE_COLLISION_BUFFER]);

  // Helper functions for SAT collision detection
  const getAxesFromCorners = (corners: Point[]): Point[] => {
    const axes = [];
    for (let i = 0; i < corners.length; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % corners.length];
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      const normal = { x: -edge.y, y: edge.x };
      const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      axes.push({ x: normal.x / length, y: normal.y / length });
    }
    return axes;
  };

  const projectCornersOntoAxis = (corners: Point[], axis: Point) => {
    let min = Infinity;
    let max = -Infinity;
    
    for (const corner of corners) {
      const dot = corner.x * axis.x + corner.y * axis.y;
      min = Math.min(min, dot);
      max = Math.max(max, dot);
    }
    
    return { min, max };
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

  return {
    checkProductCollision,
    checkFurnitureSnap
  };
};
