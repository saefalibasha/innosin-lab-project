
import { Point, PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { mmToCanvas, canvasToMm } from './measurements';
import { getRotatedRectangleCorners, isPointInPolygon, doesProductOverlapWall } from './collisionDetection';

export interface CollisionResult {
  hasCollision: boolean;
  type: 'wall' | 'product' | 'boundary' | null;
  collisionTarget?: PlacedProduct | WallSegment;
  suggestedPosition?: Point;
}

export interface DragValidationResult {
  isValid: boolean;
  position: Point;
  visualFeedback: 'valid' | 'invalid' | 'warning';
  collisionResult: CollisionResult;
}

export class EnhancedCollisionDetector {
  private scale: number;
  private canvasWidth: number;
  private canvasHeight: number;
  private snapThreshold: number = 20; // pixels

  constructor(scale: number, canvasWidth: number, canvasHeight: number) {
    this.scale = scale;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  // Check if two products overlap
  checkProductCollision(product1: PlacedProduct, product2: PlacedProduct): boolean {
    if (product1.id === product2.id) return false;

    const p1Width = mmToCanvas(product1.dimensions.length, this.scale) * (product1.scale || 1);
    const p1Height = mmToCanvas(product1.dimensions.width, this.scale) * (product1.scale || 1);
    const p2Width = mmToCanvas(product2.dimensions.length, this.scale) * (product2.scale || 1);
    const p2Height = mmToCanvas(product2.dimensions.width, this.scale) * (product2.scale || 1);

    const p1Corners = getRotatedRectangleCorners(product1.position, p1Width, p1Height, product1.rotation || 0);
    const p2Corners = getRotatedRectangleCorners(product2.position, p2Width, p2Height, product2.rotation || 0);

    // Check if any corner of product1 is inside product2's bounds
    for (const corner of p1Corners) {
      if (this.isPointInRotatedRectangle(corner, product2.position, p2Width, p2Height, product2.rotation || 0)) {
        return true;
      }
    }

    // Check if any corner of product2 is inside product1's bounds
    for (const corner of p2Corners) {
      if (this.isPointInRotatedRectangle(corner, product1.position, p1Width, p1Height, product1.rotation || 0)) {
        return true;
      }
    }

    return false;
  }

  // Check if product is within canvas boundaries
  checkBoundaryCollision(product: PlacedProduct): boolean {
    const width = mmToCanvas(product.dimensions.length, this.scale) * (product.scale || 1);
    const height = mmToCanvas(product.dimensions.width, this.scale) * (product.scale || 1);
    const corners = getRotatedRectangleCorners(product.position, width, height, product.rotation || 0);

    return corners.some(corner => 
      corner.x < 0 || corner.x > this.canvasWidth || 
      corner.y < 0 || corner.y > this.canvasHeight
    );
  }

  // Comprehensive collision check
  validatePosition(
    product: PlacedProduct, 
    allProducts: PlacedProduct[], 
    wallSegments: WallSegment[], 
    roomPoints: Point[]
  ): CollisionResult {
    // Check boundary collision
    if (this.checkBoundaryCollision(product)) {
      return {
        hasCollision: true,
        type: 'boundary',
        suggestedPosition: this.findNearestValidPosition(product, allProducts, wallSegments, roomPoints)
      };
    }

    // Check wall collision
    for (const wall of wallSegments) {
      if (doesProductOverlapWall(product, wall, this.scale)) {
        return {
          hasCollision: true,
          type: 'wall',
          collisionTarget: wall,
          suggestedPosition: this.findNearestValidPosition(product, allProducts, wallSegments, roomPoints)
        };
      }
    }

    // Check product collision
    for (const otherProduct of allProducts) {
      if (this.checkProductCollision(product, otherProduct)) {
        return {
          hasCollision: true,
          type: 'product',
          collisionTarget: otherProduct,
          suggestedPosition: this.findNearestValidPosition(product, allProducts, wallSegments, roomPoints)
        };
      }
    }

    return { hasCollision: false, type: null };
  }

  // Validate drag position with visual feedback
  validateDragPosition(
    product: PlacedProduct,
    newPosition: Point,
    allProducts: PlacedProduct[],
    wallSegments: WallSegment[],
    roomPoints: Point[]
  ): DragValidationResult {
    const testProduct = { ...product, position: newPosition };
    const collision = this.validatePosition(testProduct, allProducts, wallSegments, roomPoints);

    if (collision.hasCollision) {
      return {
        isValid: false,
        position: collision.suggestedPosition || newPosition,
        visualFeedback: 'invalid',
        collisionResult: collision
      };
    }

    return {
      isValid: true,
      position: newPosition,
      visualFeedback: 'valid',
      collisionResult: collision
    };
  }

  // Find nearest valid position when collision occurs
  private findNearestValidPosition(
    product: PlacedProduct,
    allProducts: PlacedProduct[],
    wallSegments: WallSegment[],
    roomPoints: Point[]
  ): Point {
    const originalPos = product.position;
    const searchRadius = 50; // pixels
    const stepSize = 10;

    // Try positions in expanding circles around the original position
    for (let radius = stepSize; radius <= searchRadius; radius += stepSize) {
      for (let angle = 0; angle < 360; angle += 30) {
        const radians = (angle * Math.PI) / 180;
        const testPosition = {
          x: originalPos.x + radius * Math.cos(radians),
          y: originalPos.y + radius * Math.sin(radians)
        };

        const testProduct = { ...product, position: testPosition };
        const collision = this.validatePosition(testProduct, allProducts, wallSegments, roomPoints);
        
        if (!collision.hasCollision) {
          return testPosition;
        }
      }
    }

    return originalPos; // Return original if no valid position found
  }

  // Helper method to check if point is inside rotated rectangle
  private isPointInRotatedRectangle(
    point: Point, 
    rectCenter: Point, 
    rectWidth: number, 
    rectHeight: number, 
    rotation: number
  ): boolean {
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    
    const dx = point.x - rectCenter.x;
    const dy = point.y - rectCenter.y;
    
    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;
    
    return Math.abs(rotatedX) <= rectWidth / 2 && Math.abs(rotatedY) <= rectHeight / 2;
  }
}
