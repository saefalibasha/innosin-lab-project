import { Point, WallSegment } from '@/types/floorPlanTypes';

/**
 * Convert wall segments to a polygon outline
 */
export function wallsToPolygon(wallSegments: WallSegment[]): Point[] {
  if (wallSegments.length === 0) return [];

  // Find all unique points and their connections
  const points = new Map<string, Point>();
  const connections = new Map<string, string[]>();
  const tolerance = 1; // Allow 1px tolerance for connecting points

  wallSegments.forEach(wall => {
    const startKey = `${Math.round(wall.start.x)},${Math.round(wall.start.y)}`;
    const endKey = `${Math.round(wall.end.x)},${Math.round(wall.end.y)}`;
    
    points.set(startKey, { x: Math.round(wall.start.x), y: Math.round(wall.start.y) });
    points.set(endKey, { x: Math.round(wall.end.x), y: Math.round(wall.end.y) });
    
    if (!connections.has(startKey)) connections.set(startKey, []);
    if (!connections.has(endKey)) connections.set(endKey, []);
    
    connections.get(startKey)!.push(endKey);
    connections.get(endKey)!.push(startKey);
  });

  // Remove duplicate connections
  connections.forEach((conns, key) => {
    connections.set(key, [...new Set(conns)]);
  });

  // Validate that we have enough connections to form a closed shape
  const validConnections = Array.from(connections.values()).filter(conns => conns.length >= 2);
  if (validConnections.length < 3) {
    return []; // Not enough connected points to form a valid polygon
  }

  // Find the polygon by tracing the perimeter
  const polygon: Point[] = [];
  const visited = new Set<string>();
  
  // Start from the leftmost point to ensure consistent direction
  const pointKeys = Array.from(points.keys());
  const startKey = pointKeys.reduce((leftmost, current) => {
    const leftPoint = points.get(leftmost)!;
    const currentPoint = points.get(current)!;
    return currentPoint.x < leftPoint.x ? current : leftmost;
  });
  
  let currentKey = startKey;
  let previousKey: string | null = null;
  
  do {
    const point = points.get(currentKey);
    if (point) polygon.push(point);
    visited.add(currentKey);
    
    // Find next connection (prefer continuing in same direction)
    const nextConnections = connections.get(currentKey) || [];
    let nextKey: string | null = null;
    
    // Filter out the previous point to avoid backtracking
    const availableConnections = nextConnections.filter(key => key !== previousKey);
    
    if (availableConnections.length > 0) {
      nextKey = availableConnections[0];
    }
    
    if (!nextKey || nextKey === startKey) break;
    
    previousKey = currentKey;
    currentKey = nextKey;
  } while (currentKey !== startKey && polygon.length < 100);

  // Validate the polygon forms a closed shape
  if (polygon.length >= 3) {
    const first = polygon[0];
    const last = polygon[polygon.length - 1];
    const distance = Math.sqrt(
      Math.pow(first.x - last.x, 2) + Math.pow(first.y - last.y, 2)
    );
    
    // If not closed, try to close it by connecting back to start
    if (distance > tolerance && polygon.length >= 3) {
      // Check if we can reasonably close the polygon
      if (distance < 50) { // Allow reasonable gap closure
        polygon.push(first); // Close the polygon
      }
    }
  }

  return polygon.length >= 3 ? polygon : [];
}

/**
 * Check if walls form a closed loop suitable for floor generation
 */
export function isValidFloorPolygon(wallSegments: WallSegment[]): boolean {
  const polygon = wallsToPolygon(wallSegments);
  // We consider a polygon valid if it has 3 or more vertices; it does not
  // need to repeat the starting point at the end for ray-casting or area calc
  return polygon.length >= 3;
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