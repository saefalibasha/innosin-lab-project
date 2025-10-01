import { Point } from '@/types/floorPlanTypes';

// Enhanced coordinate system utilities for consistent 2D/3D mapping
export const COORDINATE_SCALE = 0.001; // mm to meters conversion
export const SCALE_2D_TO_3D = 0.08; // Consistent with 2D scale (0.08 px/mm)

/**
 * Convert 2D canvas coordinates to 3D world coordinates
 * Direct 1:1 mapping with proper mm to meters conversion
 */
export function canvasTo3DWorld(
  point: Point, 
  scale: number = 0.08, 
  origin?: { minX: number; minY: number }
): [number, number, number] {
  // Subtract origin offset for consistent coordinate system
  const adjustedX = origin ? point.x - origin.minX : point.x;
  const adjustedY = origin ? point.y - origin.minY : point.y;
  
  // Convert from 2D pixels to 3D meters using scale
  // scale = 0.08 means 80px = 1000mm, so 1px = 12.5mm = 0.0125m
  const pixelsPerMeter = scale * 1000; // px per 1000mm
  const worldX = adjustedX / pixelsPerMeter; // Convert px to meters
  const worldZ = adjustedY / pixelsPerMeter; // Y becomes Z in 3D floor plane
  
  return [worldX, 0, worldZ];
}

/**
 * Convert 3D world coordinates back to 2D canvas coordinates
 */
export function worldTo2DCanvas(
  x: number, 
  z: number, 
  scale: number = 0.08,
  origin?: { minX: number; minY: number }
): Point {
  const pixelsPerMeter = scale * 1000; // px per 1000mm
  const canvasX = x * pixelsPerMeter;
  const canvasY = z * pixelsPerMeter;
  
  // Add origin offset back for consistent coordinate system
  return {
    x: origin ? canvasX + origin.minX : canvasX,
    y: origin ? canvasY + origin.minY : canvasY
  };
}

/**
 * Project a point onto a line segment and return the projected point and distance
 */
function projectPointOnSegment(point: Point, segStart: Point, segEnd: Point): { 
  projected: Point; 
  distance: number; 
  t: number;
} {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSquared = dx * dx + dy * dy;
  
  if (lengthSquared === 0) {
    // Degenerate segment - return start point
    const dist = Math.sqrt(
      Math.pow(point.x - segStart.x, 2) + Math.pow(point.y - segStart.y, 2)
    );
    return { projected: segStart, distance: dist, t: 0 };
  }
  
  // Calculate projection parameter t
  let t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSquared;
  
  // Clamp t to [0, 1] to stay on segment
  t = Math.max(0, Math.min(1, t));
  
  // Calculate projected point
  const projected: Point = {
    x: segStart.x + t * dx,
    y: segStart.y + t * dy
  };
  
  // Calculate distance from point to projected point
  const distance = Math.sqrt(
    Math.pow(point.x - projected.x, 2) + Math.pow(point.y - projected.y, 2)
  );
  
  return { projected, distance, t };
}

/**
 * Calculate door position and rotation from door data, aligning with nearest wall
 */
export const calculateDoorTransform = (
  door: any,
  scale: number = 0.08,
  wallSegments: any[] = [],
  origin?: { minX: number; minY: number }
) => {
  if (!door || !door.position) {
    console.warn('Invalid door data:', door);
    return null;
  }

  // Find the nearest wall segment using point-to-segment distance
  let nearestWall = null;
  let minDistance = Infinity;
  let projectedPoint: Point = door.position;
  let wallAngle = 0;
  
  if (wallSegments.length > 0) {
    wallSegments.forEach(wall => {
      const result = projectPointOnSegment(door.position, wall.start, wall.end);
      
      if (result.distance < minDistance) {
        minDistance = result.distance;
        nearestWall = wall;
        projectedPoint = result.projected;
        
        // Calculate wall angle
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        wallAngle = Math.atan2(dy, dx);
      }
    });
    
    console.debug('Door placement:', {
      doorId: door.id,
      originalPos: door.position,
      projectedPos: projectedPoint,
      nearestWallId: nearestWall?.id,
      wallAngle: wallAngle * (180 / Math.PI),
      distance: minDistance
    });
  }
  
  // Convert projected position to 3D world coordinates
  const position3D = canvasTo3DWorld(projectedPoint, scale);
  
  return {
    position: position3D,
    rotation: [0, wallAngle, 0] as [number, number, number]
  };
};

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
