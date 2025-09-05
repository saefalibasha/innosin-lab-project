/**
 * Unified coordinate transformation system for 2D-to-3D mapping
 * Ensures consistent scaling and positioning across all 3D components
 */

import { Point } from '@/types/floorPlanTypes';

// Standard coordinate transformation for 3D scene
// Adjusted scale to make rooms appropriately sized
export const COORDINATE_SCALE = 0.01; // Convert canvas units to 3D world units
export const ROOM_HEIGHT = 2.4; // Standard room height in meters

/**
 * Convert 2D canvas coordinates to 3D world coordinates
 * This maintains 1:1 coordinate mapping between 2D and 3D views
 */
export const canvasTo3D = (point: Point | undefined): [number, number, number] => {
  if (!point || point.x === undefined || point.y === undefined) {
    console.warn('canvasTo3D received invalid point:', point);
    return [0, 0, 0];
  }
  return [
    point.x * COORDINATE_SCALE,
    0, // Y will be set by specific components (floor, products)
    point.y * COORDINATE_SCALE
  ];
};

/**
 * Convert 3D world coordinates back to 2D canvas coordinates
 */
export const threeDToCanvas = (x: number | undefined, z: number | undefined): Point => {
  if (x === undefined || z === undefined || isNaN(x) || isNaN(z)) {
    console.warn('threeDToCanvas received invalid coordinates:', { x, z });
    return { x: 0, y: 0 };
  }
  return {
    x: x / COORDINATE_SCALE,
    y: z / COORDINATE_SCALE
  };
};

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