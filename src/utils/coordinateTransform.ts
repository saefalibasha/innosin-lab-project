import { Point } from '@/types/floorPlanTypes';
import { canvasTo3DWorld, worldTo2DCanvas } from './coordinateUtils';

/**
 * Convert 2D canvas coordinates to 3D world coordinates
 * This is a wrapper around canvasTo3DWorld for compatibility
 */
export function canvasTo3D(point: Point, scale: number = 0.08): [number, number, number] {
  return canvasTo3DWorld(point, scale);
}

/**
 * Convert 3D world coordinates back to 2D canvas coordinates
 * This is a wrapper around worldTo2DCanvas for compatibility
 */
export function threeDToCanvas(x: number, z: number, scale: number = 0.08): Point {
  return worldTo2DCanvas(x, z, scale);
}

/**
 * Calculate the bounding box of a set of points
 */
export const calculateBounds = (points: Point[]): { min: Point; max: Point; center: Point } => {
  if (!points || points.length === 0) {
    return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 }, center: { x: 0, y: 0 } };
  }

  const validPoints = points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');
  if (validPoints.length === 0) {
    return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 }, center: { x: 0, y: 0 } };
  }

  const xs = validPoints.map(p => p.x);
  const ys = validPoints.map(p => p.y);

  const min = { x: Math.min(...xs), y: Math.min(...ys) };
  const max = { x: Math.max(...xs), y: Math.max(...ys) };
  const center = { 
    x: (min.x + max.x) / 2, 
    y: (min.y + max.y) / 2 
  };

  return { min, max, center };
};

/**
 * Get all points from walls, rooms, and products for scene centering
 */
export const getAllScenePoints = (
  wallSegments: any[] = [],
  rooms: any[] = [],
  placedProducts: any[] = []
): Point[] => {
  const points: Point[] = [];

  // Add wall points
  wallSegments.forEach(wall => {
    if (wall?.start) points.push(wall.start);
    if (wall?.end) points.push(wall.end);
  });

  // Add room points
  rooms.forEach(room => {
    if (room?.points && Array.isArray(room.points)) {
      points.push(...room.points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number'));
    }
  });

  // Add product positions
  placedProducts.forEach(product => {
    if (product?.position) {
      points.push(product.position);
    }
  });

  return points;
};