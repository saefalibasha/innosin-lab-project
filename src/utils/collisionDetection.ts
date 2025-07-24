
import { Point, PlacedProduct, WallSegment, WallType } from '@/types/floorPlanTypes';

export const detectCollision = (
  product: PlacedProduct,
  otherProducts: PlacedProduct[]
): boolean => {
  for (const other of otherProducts) {
    if (other.id === product.id) continue;

    const dx = Math.abs(product.position.x - other.position.x);
    const dy = Math.abs(product.position.y - other.position.y);

    const minDistanceX = (product.dimensions.length + other.dimensions.length) / 2;
    const minDistanceY = (product.dimensions.width + other.dimensions.width) / 2;

    if (dx < minDistanceX && dy < minDistanceY) {
      return true;
    }
  }

  return false;
};

export const detectWallCollision = (
  product: PlacedProduct,
  walls: WallSegment[]
): boolean => {
  for (const wall of walls) {
    // Simple collision detection with wall segments
    const distanceToWall = distancePointToLine(
      product.position,
      wall.start,
      wall.end
    );

    if (distanceToWall < Math.max(product.dimensions.length, product.dimensions.width) / 2) {
      return true;
    }
  }

  return false;
};

export const distancePointToLine = (
  point: Point,
  lineStart: Point,
  lineEnd: Point
): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
};

export const snapToWall = (
  position: Point,
  walls: WallSegment[],
  snapThreshold: number = 20
): Point | null => {
  for (const wall of walls) {
    // Only snap to interior walls
    if (wall.type === WallType.INTERIOR) {
      const distance = distancePointToLine(position, wall.start, wall.end);
      
      if (distance < snapThreshold) {
        // Return the closest point on the wall
        const A = position.x - wall.start.x;
        const B = position.y - wall.start.y;
        const C = wall.end.x - wall.start.x;
        const D = wall.end.y - wall.start.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        const param = Math.max(0, Math.min(1, dot / lenSq));

        return {
          x: wall.start.x + param * C,
          y: wall.start.y + param * D
        };
      }
    }
  }

  return null;
};
