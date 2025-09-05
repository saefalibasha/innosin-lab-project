import { Point } from '@/types/floorPlanTypes';

// Enhanced coordinate system utilities for consistent 2D/3D mapping
export const COORDINATE_SCALE = 0.001; // mm to meters conversion

/**
 * Convert 2D canvas coordinates to 3D world coordinates
 * Maps X axis to X axis, Y axis to Z axis (floor plane)
 */
export function canvasTo3DWorld(point: Point, scale: number): [number, number, number] {
  return [
    point.x * scale * COORDINATE_SCALE,
    0, // Y is always 0 for floor placement
    point.y * scale * COORDINATE_SCALE
  ];
}

/**
 * Convert 3D world coordinates back to 2D canvas coordinates
 */
export function worldTo2DCanvas(x: number, z: number, scale: number): Point {
  return {
    x: x / (scale * COORDINATE_SCALE),
    y: z / (scale * COORDINATE_SCALE)
  };
}

/**
 * Calculate door position and rotation from wall segment
 */
export function calculateDoorTransform(door: any, scale: number) {
  // Add null checks to prevent undefined errors
  if (!door || !door.wallStart || !door.wallEnd) {
    console.warn('calculateDoorTransform received invalid door data:', door);
    return {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number]
    };
  }

  // Ensure wallStart and wallEnd have x,y properties
  if (typeof door.wallStart.x !== 'number' || typeof door.wallStart.y !== 'number' ||
      typeof door.wallEnd.x !== 'number' || typeof door.wallEnd.y !== 'number') {
    console.warn('calculateDoorTransform received invalid wall coordinates:', door);
    return {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number]
    };
  }

  const wallVector = {
    x: door.wallEnd.x - door.wallStart.x,
    y: door.wallEnd.y - door.wallStart.y
  };
  
  const wallLength = Math.sqrt(wallVector.x ** 2 + wallVector.y ** 2);
  
  // Prevent division by zero
  if (wallLength === 0) {
    console.warn('calculateDoorTransform: wall has zero length');
    return {
      position: canvasTo3DWorld(door.wallStart, scale),
      rotation: [0, 0, 0] as [number, number, number]
    };
  }

  const normalizedWall = {
    x: wallVector.x / wallLength,
    y: wallVector.y / wallLength
  };
  
  // Position door at specified wall position (0-1 along wall)
  const wallPosition = typeof door.wallPosition === 'number' ? door.wallPosition : 0.5;
  const doorPosition = {
    x: door.wallStart.x + normalizedWall.x * wallLength * wallPosition,
    y: door.wallStart.y + normalizedWall.y * wallLength * wallPosition
  };
  
  // Calculate rotation to align door with wall
  const rotation = Math.atan2(normalizedWall.y, normalizedWall.x);
  
  return {
    position: canvasTo3DWorld(doorPosition, scale),
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
  // Check room bounds
  if (rooms.length > 0) {
    const isInsideAnyRoom = rooms.some(room => isPointInPolygon(position, room.points));
    if (!isInsideAnyRoom) {
      return { valid: false, reason: 'Outside room bounds' };
    }
  }
  
  // Check wall collisions
  const productBounds = getProductBounds(product, position, scale);
  for (const wall of wallSegments) {
    if (isProductCollidingWithWall(productBounds, wall, scale)) {
      return { valid: false, reason: 'Colliding with wall' };
    }
  }
  
  // Check product collisions
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
    if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
        (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
      inside = !inside;
    }
  }
  return inside;
}

function isProductCollidingWithWall(productBounds: any, wall: any, scale: number): boolean {
  // Simplified wall collision - check if product bounds intersect with wall line
  const wallThickness = (wall.thickness || 200) * scale;
  // Implementation would check line-rectangle intersection
  return false; // Placeholder
}

function isProductCollidingWithProduct(bounds1: any, bounds2: any): boolean {
  return !(bounds1.right < bounds2.left || 
           bounds1.left > bounds2.right || 
           bounds1.bottom < bounds2.top || 
           bounds1.top > bounds2.bottom);
}