import { Point, WallSegment } from '@/types/floorPlanTypes';

/**
 * Convert wall segments to a polygon outline
 */
export function wallsToPolygon(wallSegments: WallSegment[]): Point[] {
  if (wallSegments.length === 0) return [];

  // Find all unique points and their connections
  const points = new Map<string, Point>();
  const connections = new Map<string, string[]>();

  wallSegments.forEach(wall => {
    const startKey = `${wall.start.x},${wall.start.y}`;
    const endKey = `${wall.end.x},${wall.end.y}`;
    
    points.set(startKey, wall.start);
    points.set(endKey, wall.end);
    
    if (!connections.has(startKey)) connections.set(startKey, []);
    if (!connections.has(endKey)) connections.set(endKey, []);
    
    connections.get(startKey)!.push(endKey);
    connections.get(endKey)!.push(startKey);
  });

  // Trace the perimeter
  const polygon: Point[] = [];
  const visited = new Set<string>();
  
  // Start from the first point
  const startKey = Array.from(points.keys())[0];
  let currentKey = startKey;
  
  do {
    const point = points.get(currentKey);
    if (point) polygon.push(point);
    visited.add(currentKey);
    
    // Find next unvisited connection
    const nextConnections = connections.get(currentKey) || [];
    let nextKey = nextConnections.find(key => !visited.has(key));
    
    if (!nextKey && nextConnections.length > 0) {
      nextKey = nextConnections[0]; // Complete the loop
    }
    
    if (!nextKey || nextKey === startKey) break;
    currentKey = nextKey;
  } while (currentKey !== startKey && polygon.length < 100);

  return polygon;
}

/**
 * Check if a point is inside a polygon using ray casting
 */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a rectangle is completely inside a polygon
 */
export function rectInsidePolygon(
  center: Point,
  width: number,
  height: number,
  rotation: number = 0,
  polygon: Point[]
): boolean {
  if (polygon.length < 3) return false;

  // Calculate the four corners of the rotated rectangle
  const corners = [
    { x: -width / 2, y: -height / 2 },
    { x: width / 2, y: -height / 2 },
    { x: width / 2, y: height / 2 },
    { x: -width / 2, y: height / 2 }
  ];

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  // Rotate and translate corners
  const worldCorners = corners.map(corner => ({
    x: center.x + corner.x * cos - corner.y * sin,
    y: center.y + corner.x * sin + corner.y * cos
  }));

  // All corners must be inside the polygon
  return worldCorners.every(corner => pointInPolygon(corner, polygon));
}

/**
 * Get wall midpoints for snapping
 */
export function getWallMidpoints(wallSegments: WallSegment[]): Point[] {
  return wallSegments.map(wall => ({
    x: (wall.start.x + wall.end.x) / 2,
    y: (wall.start.y + wall.end.y) / 2
  }));
}

/**
 * Find the closest wall midpoint to a given point
 */
export function findClosestWallMidpoint(
  point: Point,
  wallSegments: WallSegment[],
  maxDistance: number = 50
): { point: Point; distance: number; wallId: string } | null {
  let closest: { point: Point; distance: number; wallId: string } | null = null;
  let minDistance = maxDistance;

  wallSegments.forEach(wall => {
    const midpoint = {
      x: (wall.start.x + wall.end.x) / 2,
      y: (wall.start.y + wall.end.y) / 2
    };

    const distance = Math.sqrt(
      Math.pow(point.x - midpoint.x, 2) + Math.pow(point.y - midpoint.y, 2)
    );

    if (distance < minDistance) {
      closest = { point: midpoint, distance, wallId: wall.id };
      minDistance = distance;
    }
  });

  return closest;
}