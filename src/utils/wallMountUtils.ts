import { PlacedProduct, WallSegment, Point } from '@/types/floorPlanTypes';

/**
 * Projects a point onto a line segment and returns the closest point on the segment
 */
function projectPointOnSegment(point: Point, start: Point, end: Point): Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  
  if (lengthSquared === 0) return start;
  
  let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  
  return {
    x: start.x + t * dx,
    y: start.y + t * dy
  };
}

/**
 * Calculates the distance between two points
 */
function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the angle of a wall segment in degrees (0-360)
 */
function calculateWallAngle(start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = angleRad * (180 / Math.PI);
  return (angleDeg + 360) % 360; // Normalize to 0-360
}

export interface WallMountTransform {
  position: Point;
  rotation: number; // degrees
  heightOffset: number; // mm
  wallId: string;
  distance: number; // distance from product to wall
}

/**
 * Calculates the transform to mount a product onto the nearest wall
 */
export function calculateWallMountTransform(
  product: PlacedProduct,
  wallSegments: WallSegment[],
  defaultHeight: number = 1500 // Default wall cabinet height in mm
): WallMountTransform | null {
  if (wallSegments.length === 0) return null;
  
  // Find the nearest wall segment
  let nearestWall: WallSegment | null = null;
  let minDistance = Infinity;
  let nearestPoint: Point | null = null;
  
  wallSegments.forEach(wall => {
    const projected = projectPointOnSegment(product.position, wall.start, wall.end);
    const dist = distance(product.position, projected);
    
    if (dist < minDistance) {
      minDistance = dist;
      nearestWall = wall;
      nearestPoint = projected;
    }
  });
  
  if (!nearestWall || !nearestPoint) return null;
  
  // Calculate wall angle and perpendicular rotation for the product
  const wallAngle = calculateWallAngle(nearestWall.start, nearestWall.end);
  
  // Product should face perpendicular to the wall (pointing inward)
  // Add 90 degrees to wall angle for perpendicular alignment
  const productRotation = (wallAngle + 90) % 360;
  
  // Calculate offset position (move product slightly away from wall based on depth)
  const productDepth = product.dimensions?.length || 600; // 'length' is depth in the data model
  const offsetDistance = productDepth / 2; // Half depth to center on wall line
  
  // Calculate perpendicular offset direction
  const wallAngleRad = wallAngle * (Math.PI / 180);
  const perpX = Math.cos(wallAngleRad + Math.PI / 2);
  const perpY = Math.sin(wallAngleRad + Math.PI / 2);
  
  const mountPosition: Point = {
    x: nearestPoint.x + perpX * offsetDistance,
    y: nearestPoint.y + perpY * offsetDistance
  };
  
  return {
    position: mountPosition,
    rotation: productRotation,
    heightOffset: defaultHeight,
    wallId: nearestWall.id,
    distance: minDistance
  };
}

/**
 * Checks if a product is suitable for wall mounting based on its category/type
 */
export function isWallMountable(product: PlacedProduct): boolean {
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  
  // Wall cabinets
  if (name.includes('wall') || category.includes('wall')) return true;
  
  // Specific product codes
  if (name.includes('wcg') || name.includes('wc-')) return true;
  
  return false;
}

/**
 * Snaps product to wall alignment with visual feedback
 */
export function snapToWallAlignment(
  product: PlacedProduct,
  wallSegments: WallSegment[],
  snapThreshold: number = 100 // pixels
): WallMountTransform | null {
  const transform = calculateWallMountTransform(product, wallSegments);
  
  if (!transform) return null;
  
  // Only snap if within threshold
  if (transform.distance > snapThreshold) return null;
  
  return transform;
}
