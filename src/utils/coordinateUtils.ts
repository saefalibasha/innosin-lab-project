import { Point } from '@/types/floorPlanTypes';

// Enhanced coordinate system utilities for consistent 2D/3D mapping
export const COORDINATE_SCALE = 0.001; // mm to meters conversion
export const SCALE_2D_TO_3D = 0.08; // Consistent with 2D scale (0.08 px/mm)

/**
 * Convert 2D canvas coordinates to 3D world coordinates
 * Direct 1:1 mapping: X axis to X axis, Y axis to Z axis (floor plane)
 * Scale factor is handled separately in components
 */
export function canvasTo3DWorld(point: Point, scale: number = 1): [number, number, number] {
  // Direct 1:1 conversion from 2D pixels to 3D meters
  // Scale of 0.08 means 80px = 1000mm = 1m, so 1px = 12.5mm = 0.0125m
  const worldX = point.x * 0.0125; // Direct px to meters conversion (1px = 12.5mm)
  const worldZ = point.y * 0.0125; // Y becomes Z in 3D floor plane
  
  return [worldX, 0, worldZ];
}

/**
 * Convert 3D world coordinates back to 2D canvas coordinates
 */
export function worldTo2DCanvas(x: number, z: number, scale: number): Point {
  return {
    x: x / (scale * COORDINATE_SCALE),
    y: -z / (scale * COORDINATE_SCALE)
  };
}

/**
 * Calculate door position and rotation from door data
 * Uses direct 2D position mapping for 1:1 coordinate matching
 */
export function calculateDoorTransform(
  door: any, 
  scale: number, 
  origin?: { minX: number; minY: number }
) {
  if (!door || !door.position) {
    console.warn('calculateDoorTransform received invalid door data:', door);
    return {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number]
    };
  }

  // Use door's exact 2D coordinates without origin offset
  const doorPosition = {
    x: door.position.x,
    y: door.position.y
  };

  console.log('Door position calculation:', {
    doorId: door.id,
    originalPosition: door.position,
    finalPosition: doorPosition
  });

  // Convert door position directly from 2D to 3D coordinates
  const [x, y, z] = canvasTo3DWorld(doorPosition);

  // Calculate rotation based on facing direction
  let rotation = 0;
  if (door.facing === 'horizontal') {
    rotation = 0; // Door along X axis
  } else if (door.facing === 'vertical') {
    rotation = Math.PI / 2; // Door along Z axis (90 degrees)
  }

  console.log('Door 3D transform:', {
    doorId: door.id,
    position: [x, y, z],
    rotation: [0, rotation, 0]
  });

  return {
    position: [x, y, z] as [number, number, number],
    rotation: [0, rotation, 0] as [number, number, number]
  };
}

/**
 * Check if a product position is valid (within bounds, no collisions)
 */
export function validateProductPosition(
  product: any,
  position: Point,
  allProducts: any[],
  wallSegments: any[],
  rooms: any[],
  scale: number
): { valid: boolean; reason?: string } {
  if (rooms.length > 0) {
    const isInsideAnyRoom = rooms.some(room => isPointInPolygon(position, room.points));
    if (!isInsideAnyRoom) {
      return { valid: false, reason: 'Outside room bounds' };
    }
  }

  const productBounds = getProductBounds(product, position, scale);
  for (const wall of wallSegments) {
    if (isProductCollidingWithWall(productBounds, wall, scale)) {
      return { valid: false, reason: 'Colliding with wall' };
    }
  }

  for (const otherProduct of allProducts) {
    if (otherProduct.id === product.id) continue;
    const otherBounds = getProductBounds(otherProduct, otherProduct.position, scale);
    if (isProductCollidingWithProduct(productBounds, otherBounds)) {
      return { valid: false, reason: 'Colliding with another product' };
    }
  }

  return { valid: true };
}

function getProductBounds(product: any, position: Point, scale: number) {
  const width = (product.dimensions?.width || 600) * scale;
  const depth = (product.dimensions?.length || 600) * scale;

  return {
    left: position.x - width / 2,
    right: position.x + width / 2,
    top: position.y - depth / 2,
    bottom: position.y + depth / 2
  };
}

function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

function isProductCollidingWithWall(productBounds: any, wall: any, scale: number): boolean {
  // TODO: Implement wall collision detection (currently a placeholder)
  return false;
}

function isProductCollidingWithProduct(bounds1: any, bounds2: any): boolean {
  return !(
    bounds1.right < bounds2.left ||
    bounds1.left > bounds2.right ||
    bounds1.bottom < bounds2.top ||
    bounds1.top > bounds2.bottom
  );
}
