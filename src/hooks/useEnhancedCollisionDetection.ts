
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
  const FURNITURE_COLLISION_BUFFER = mmToCanvas(0, scale); // 0mm buffer - allow seamless touching
  const FURNITURE_MIN_SEPARATION = mmToCanvas(2, scale); // 2mm minimum separation for non-snapped products
  const SEAMLESS_SNAP_DISTANCE = mmToCanvas(15, scale); // 15mm for seamless snapping (increased for easier detection)
  const EDGE_ALIGNMENT_THRESHOLD = mmToCanvas(20, scale); // 20mm for perpendicular edge alignment

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
      
      // Check for seamless edge-to-edge snapping (0mm gap)
      const seamlessSnapChecks = [
        // Right edge of target to left edge of dragged (seamless)
        {
          targetEdge: targetBounds.right,
          draggedEdge: draggedBounds.left,
          offset: targetBounds.right - draggedBounds.left,
          snapPos: { x: position.x + (targetBounds.right - draggedBounds.left), y: position.y },
          type: 'edge-to-edge' as const
        },
        // Left edge of target to right edge of dragged (seamless)
        {
          targetEdge: targetBounds.left,
          draggedEdge: draggedBounds.right,
          offset: targetBounds.left - draggedBounds.right,
          snapPos: { x: position.x + (targetBounds.left - draggedBounds.right), y: position.y },
          type: 'edge-to-edge' as const
        },
        // Bottom edge of target to top edge of dragged (seamless)
        {
          targetEdge: targetBounds.bottom,
          draggedEdge: draggedBounds.top,
          offset: targetBounds.bottom - draggedBounds.top,
          snapPos: { x: position.x, y: position.y + (targetBounds.bottom - draggedBounds.top) },
          type: 'edge-to-edge' as const
        },
        // Top edge of target to bottom edge of dragged (seamless)
        {
          targetEdge: targetBounds.top,
          draggedEdge: draggedBounds.bottom,
          offset: targetBounds.top - draggedBounds.bottom,
          snapPos: { x: position.x, y: position.y + (targetBounds.top - draggedBounds.bottom) },
          type: 'edge-to-edge' as const
        }
      ];

      for (const check of seamlessSnapChecks) {
        const distance = Math.abs(check.offset);
        
        if (distance < SEAMLESS_SNAP_DISTANCE && distance < bestSnap.gap) {
          // Check if there's sufficient overlap on the perpendicular axis
          const isHorizontalSnap = check.offset === (targetBounds.right - draggedBounds.left) || 
                                   check.offset === (targetBounds.left - draggedBounds.right);
          const isVerticalSnap = check.offset === (targetBounds.bottom - draggedBounds.top) ||
                                 check.offset === (targetBounds.top - draggedBounds.bottom);
          
          const overlapCheck = isHorizontalSnap
            ? (draggedBounds.bottom > targetBounds.top && draggedBounds.top < targetBounds.bottom)
            : (draggedBounds.right > targetBounds.left && draggedBounds.left < targetBounds.right);
          
          if (overlapCheck) {
            let finalSnapPos = check.snapPos;
            
            // PERPENDICULAR EDGE ALIGNMENT: Align non-touching edges for continuous lines
            if (isHorizontalSnap) {
              // Recalculate bounds at the snapped position for accurate edge detection
              const snappedBounds = getRotatedBounds(draggedProduct, check.snapPos);
              
              // For horizontal snaps (left-right), also align vertical edges (top or bottom)
              const topDiff = Math.abs(snappedBounds.top - targetBounds.top);
              const bottomDiff = Math.abs(snappedBounds.bottom - targetBounds.bottom);
              
              if (topDiff < EDGE_ALIGNMENT_THRESHOLD && topDiff < bottomDiff) {
                // Align top edges
                const yAdjust = targetBounds.top - snappedBounds.top;
                finalSnapPos = { x: check.snapPos.x, y: check.snapPos.y + yAdjust };
              } else if (bottomDiff < EDGE_ALIGNMENT_THRESHOLD) {
                // Align bottom edges
                const yAdjust = targetBounds.bottom - snappedBounds.bottom;
                finalSnapPos = { x: check.snapPos.x, y: check.snapPos.y + yAdjust };
              }
            } else if (isVerticalSnap) {
              // Recalculate bounds at the snapped position for accurate edge detection
              const snappedBounds = getRotatedBounds(draggedProduct, check.snapPos);
              
              // For vertical snaps (top-bottom), also align horizontal edges (left or right)
              const leftDiff = Math.abs(snappedBounds.left - targetBounds.left);
              const rightDiff = Math.abs(snappedBounds.right - targetBounds.right);
              
              if (leftDiff < EDGE_ALIGNMENT_THRESHOLD && leftDiff < rightDiff) {
                // Align left edges
                const xAdjust = targetBounds.left - snappedBounds.left;
                finalSnapPos = { x: check.snapPos.x + xAdjust, y: check.snapPos.y };
              } else if (rightDiff < EDGE_ALIGNMENT_THRESHOLD) {
                // Align right edges
                const xAdjust = targetBounds.right - snappedBounds.right;
                finalSnapPos = { x: check.snapPos.x + xAdjust, y: check.snapPos.y };
              }
            }
            
            bestSnap = {
              snapped: true,
              position: finalSnapPos,
              snapType: check.type,
              target: product,
              gap: 0 // Seamless snap
            };
          }
        }
      }

      // Regular snapping with small gap if seamless didn't work
      if (!bestSnap.snapped) {
        for (const check of seamlessSnapChecks) {
          const distance = Math.abs(check.offset);
          
          if (distance < FURNITURE_SNAP_THRESHOLD && distance < bestSnap.gap) {
            const overlapCheck = check.offset === (targetBounds.right - draggedBounds.left) || 
                                check.offset === (targetBounds.left - draggedBounds.right)
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
      }

      // Check for alignment snapping (center-to-center)
      if (!bestSnap.snapped) {
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
    }

    return bestSnap;
  }, [placedProducts, getRotatedBounds, FURNITURE_SNAP_THRESHOLD, SEAMLESS_SNAP_DISTANCE]);

  const checkProductCollision = useCallback((
    draggedProduct: PlacedProduct,
    position: Point,
    excludeProductId?: string // Allow specifying a product to exclude from buffer checks (for snapping)
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

    // Check furniture collisions - skip buffer for snapped products
    for (const product of placedProducts) {
      if (product.id === draggedProduct.id) continue;
      
      // For the product we're snapping to, allow 0mm gap (seamless)
      // For all others, use minimum separation buffer
      const isSnappedTarget = excludeProductId && product.id === excludeProductId;
      
      if (checkRotatedProductCollision(draggedProduct, position, product, isSnappedTarget)) {
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
    
    // Allow products within interior walls, stricter for exterior walls
    const buffer = wall.type === 'interior' ? mmToCanvas(10, scale) : mmToCanvas(50, scale);

    // Check if any corner of the rotated product is too close to the wall
    for (const corner of bounds.corners) {
      const distance = distanceToLineSegment(corner, wall.start, wall.end);
      if (distance < wallThickness / 2 + buffer) {
        return true;
      }
    }

    return false;
  }, [getRotatedBounds, scale]);

  const checkRotatedProductCollision = useCallback((
    product1: PlacedProduct,
    position1: Point,
    product2: PlacedProduct,
    isSnappedTarget: boolean = false // True if this is the product we're snapping to
  ): boolean => {
    const bounds1 = getRotatedBounds(product1, position1);
    const bounds2 = getRotatedBounds(product2, product2.position);

    // Use SAT (Separating Axis Theorem) for precise rotated rectangle collision
    const axes = [
      ...getAxesFromCorners(bounds1.corners),
      ...getAxesFromCorners(bounds2.corners)
    ];

    // Use 0mm buffer for snapped products (seamless), minimum separation for others
    const buffer = isSnappedTarget ? FURNITURE_COLLISION_BUFFER : FURNITURE_MIN_SEPARATION;

    for (const axis of axes) {
      const proj1 = projectCornersOntoAxis(bounds1.corners, axis);
      const proj2 = projectCornersOntoAxis(bounds2.corners, axis);

      if (proj1.max + buffer < proj2.min || 
          proj2.max + buffer < proj1.min) {
        return false; // Separating axis found, no collision
      }
    }

    return true; // No separating axis found, collision detected
  }, [getRotatedBounds, FURNITURE_COLLISION_BUFFER, FURNITURE_MIN_SEPARATION]);

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
