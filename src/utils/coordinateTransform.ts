/**
 * Unified coordinate transformation system for 2D-to-3D mapping
 * Ensures consistent scaling and positioning across all 3D components
 */

import { Point } from '@/types/floorPlanTypes';

// Standard coordinate transformation for 3D scene
export const COORDINATE_SCALE = 0.001; // Convert mm to meters for 3D
export const ROOM_HEIGHT = 2.4; // Standard room height in meters

/**
 * Convert 2D canvas coordinates to 3D world coordinates
 */
export const canvasTo3D = (point: Point, scale: number): [number, number, number] => {
  return [
    point.x * scale * COORDINATE_SCALE,
    0, // Y will be set by specific components (floor, products)
    point.y * scale * COORDINATE_SCALE
  ];
};

/**
 * Convert 3D world coordinates back to 2D canvas coordinates
 */
export const threeDToCanvas = (x: number, z: number, scale: number): Point => {
  return {
    x: x / (scale * COORDINATE_SCALE),
    y: z / (scale * COORDINATE_SCALE)
  };
};

/**
 * Calculate the bounding box of a set of points
 */
export const calculateBounds = (points: Point[]): { min: Point; max: Point; center: Point } => {
  if (points.length === 0) {
    return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 }, center: { x: 0, y: 0 } };
  }

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

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
  wallSegments: any[],
  rooms: any[],
  placedProducts: any[]
): Point[] => {
  const points: Point[] = [];

  // Add wall points
  wallSegments.forEach(wall => {
    points.push(wall.start, wall.end);
  });

  // Add room points
  rooms.forEach(room => {
    points.push(...room.points);
  });

  // Add product positions
  placedProducts.forEach(product => {
    points.push(product.position);
  });

  return points;
};