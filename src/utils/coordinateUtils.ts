import { Point } from '@/types/floorPlanTypes';

// Enhanced coordinate system utilities for consistent 2D/3D mapping
export const COORDINATE_SCALE = 0.001; // mm to meters conversion
export const SCALE_2D_TO_3D = 0.08; // Consistent with 2D scale (0.08 px/mm)

/**
 * Convert 2D canvas coordinates to 3D world coordinates
 * Maps X axis to X axis, Y axis to Z axis (floor plane)
 * Uses consistent scale factor
 */
export function canvasTo3DWorld(point: Point, scale: number = 1): [number, number, number] {
  return [
    point.x * COORDINATE_SCALE,
    0,
    point.y * COORDINATE_SCALE  // No negation - keep Y as Z directly
  ];
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
 * Calculate door position and rotation from wall segment
 * Uses consistent coordinate system with walls and applies origin offset
 */
export function calculateDoorTransform(
  door: any, 
  scale: number, 
  origin?: { minX: number; minY: number }
) {
  if (!door || !door.wallStart || !door.wallEnd) {
    console.warn('calculateDoorTransform received invalid door data:', door);
    return {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number]
    };
  }

  if (
    typeof door.wallStart.x !== 'number' || typeof door.wallStart.y !== 'number' ||
    typeof door.wallEnd.x !== 'number' || typeof door.wallEnd.y !== 'number'
  ) {
    console.warn('calculateDoorTransform received invalid wall coordinates:', door);
    return {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number]
    };
  }

  // Apply origin offset
  const offsetX = origin?.minX || 0;
  const offsetY = origin?.minY || 0;

  const wallStart = {
    x: door.wallStart.x - offsetX,
    y: door.wallStart.y - offsetY
  };
  
  const wallEnd = {
    x: door.wallEnd.x - offsetX,
    y: door.wallEnd.y - offsetY
  };

  const wallVector = {
    x: wallEnd.x - wallStart.x,
    y: wallEnd.y - wallStart.y
  };

  const wallLength = Math.sqrt(wallVector.x ** 2 + wallVector.y ** 2);

  if (wallLength === 0) {
    console.warn('calculateDoorTransform: wall has zero length');
    return {
      position: canvasTo3DWorld(wallStart),
      rotation: [0, 0, 0] as [number, number, number]
    };
  }

  const normalizedWall = {
    x: wallVector.x / wallLength,
    y: wallVector.y / wallLength
  };

  const wallPosition = typeof door.wallPosition === 'number' ? door.wallPosition : 0.5;
  const doorPosition = {
    x: wallStart.x + normalizedWall.x * wallLength * wallPosition,
    y: wallStart.y + normalizedWall.y * wallLength * wallPosition
  };

  // Calculate rotation to align with wall direction
  const rotation = Math.atan2(normalizedWall.y, normalizedWall.x);

  return {
    position: canvasTo3DWorld(doorPosition),
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
