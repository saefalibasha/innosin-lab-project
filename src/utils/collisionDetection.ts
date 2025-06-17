
import { Point, PlacedProduct, Door, WallSegment, WallType } from '@/types/floorPlanTypes';

// Check if a point is inside a polygon using ray casting algorithm
export const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
  if (polygon.length < 3) return false;
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
        (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
      inside = !inside;
    }
  }
  return inside;
};

// Check if a product (rectangle) is completely within the room and doesn't overlap walls
export const isProductWithinRoom = (product: PlacedProduct, roomPoints: Point[], wallSegments: WallSegment[], scale: number): boolean => {
  if (roomPoints.length < 3) return true; // No room boundaries defined
  
  const { position, rotation, dimensions } = product;
  const productScale = product.scale || 1;
  const width = dimensions.length * scale * productScale;
  const height = dimensions.width * scale * productScale;
  
  // Get the four corners of the rotated rectangle
  const corners = getRotatedRectangleCorners(position, width, height, rotation);
  
  // Check if all corners are inside the room polygon
  const withinRoom = corners.every(corner => isPointInPolygon(corner, roomPoints));
  
  // Check if product doesn't overlap with any wall segments
  const noWallOverlap = !wallSegments.some(wall => 
    doesProductOverlapWall(product, wall, scale)
  );
  
  return withinRoom && noWallOverlap;
};

// Check if a product overlaps with a wall segment
export const doesProductOverlapWall = (product: PlacedProduct, wall: WallSegment, scale: number): boolean => {
  const { position, rotation, dimensions } = product;
  const productScale = product.scale || 1;
  const width = dimensions.length * scale * productScale;
  const height = dimensions.width * scale * productScale;
  
  const corners = getRotatedRectangleCorners(position, width, height, rotation);
  
  // Check if any corner of the product is too close to the wall line
  const wallThickness = (wall.thickness || 0.1) * scale; // Default 10cm wall thickness
  
  return corners.some(corner => {
    const distance = distancePointToLineSegment(corner, wall.start, wall.end);
    return distance < wallThickness / 2;
  });
};

// Calculate distance from point to line segment
export const distancePointToLineSegment = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));
  
  const xx = lineStart.x + param * C;
  const yy = lineStart.y + param * D;
  
  const dx = point.x - xx;
  const dy = point.y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
};

// Get the four corners of a rotated rectangle
export const getRotatedRectangleCorners = (center: Point, width: number, height: number, rotationDegrees: number): Point[] => {
  const rotation = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  const corners = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight }
  ];
  
  return corners.map(corner => ({
    x: center.x + corner.x * cos - corner.y * sin,
    y: center.y + corner.x * sin + corner.y * cos
  }));
};

// Find the closest wall segment to a point (works with both room walls and interior walls)
export const findClosestWallSegment = (point: Point, roomPoints: Point[], wallSegments: WallSegment[]): { segment: [Point, Point], distance: number, id: string, type: WallType } | null => {
  let closestWall = null;
  let minDistance = Infinity;
  
  // Check room walls (exterior)
  if (roomPoints.length >= 2) {
    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      const segment: [Point, Point] = [roomPoints[i], roomPoints[nextIndex]];
      
      const distance = distancePointToLineSegment(point, segment[0], segment[1]);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestWall = { 
          segment, 
          distance, 
          id: `room-wall-${i}`, 
          type: WallType.EXTERIOR 
        };
      }
    }
  }
  
  // Check interior walls
  wallSegments.forEach(wall => {
    const segment: [Point, Point] = [wall.start, wall.end];
    const distance = distancePointToLineSegment(point, segment[0], segment[1]);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestWall = { 
        segment, 
        distance, 
        id: wall.id, 
        type: wall.type 
      };
    }
  });
  
  return closestWall;
};

// Find snap point for interior wall endpoints
export const findWallSnapPoint = (point: Point, roomPoints: Point[], wallSegments: WallSegment[], snapDistance: number = 20): Point | null => {
  // Check room wall endpoints
  for (const roomPoint of roomPoints) {
    const distance = Math.sqrt(
      Math.pow(point.x - roomPoint.x, 2) + Math.pow(point.y - roomPoint.y, 2)
    );
    if (distance < snapDistance) {
      return roomPoint;
    }
  }
  
  // Check interior wall endpoints
  for (const wall of wallSegments) {
    for (const endpoint of [wall.start, wall.end]) {
      const distance = Math.sqrt(
        Math.pow(point.x - endpoint.x, 2) + Math.pow(point.y - endpoint.y, 2)
      );
      if (distance < snapDistance) {
        return endpoint;
      }
    }
  }
  
  // Check intersections with existing walls
  const closestWall = findClosestWallSegment(point, roomPoints, wallSegments);
  if (closestWall && closestWall.distance < snapDistance) {
    return closestPointOnLineSegment(point, closestWall.segment[0], closestWall.segment[1]);
  }
  
  return null;
};

// Find the closest point on a line segment to a given point
export const closestPointOnLineSegment = (point: Point, lineStart: Point, lineEnd: Point): Point => {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return lineStart;
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));
  
  return {
    x: lineStart.x + param * C,
    y: lineStart.y + param * D
  };
};

// Calculate wall angle for door placement
export const getWallAngle = (wallStart: Point, wallEnd: Point): number => {
  return Math.atan2(wallEnd.y - wallStart.y, wallEnd.x - wallStart.x) * 180 / Math.PI;
};

// Enhanced door placement function
export const findOptimalDoorPosition = (clickPoint: Point, wallSegment: [Point, Point]): { position: Point, wallPosition: number, rotation: number } => {
  const closestPoint = closestPointOnLineSegment(clickPoint, wallSegment[0], wallSegment[1]);
  
  // Calculate position along wall (0 to 1)
  const wallLength = Math.sqrt(
    Math.pow(wallSegment[1].x - wallSegment[0].x, 2) + 
    Math.pow(wallSegment[1].y - wallSegment[0].y, 2)
  );
  
  const distanceFromStart = Math.sqrt(
    Math.pow(closestPoint.x - wallSegment[0].x, 2) + 
    Math.pow(closestPoint.y - wallSegment[0].y, 2)
  );
  
  const wallPosition = wallLength > 0 ? distanceFromStart / wallLength : 0;
  const rotation = getWallAngle(wallSegment[0], wallSegment[1]);
  
  return {
    position: closestPoint,
    wallPosition: Math.max(0.1, Math.min(0.9, wallPosition)), // Keep doors away from corners
    rotation
  };
};

// Check if door placement conflicts with existing doors
export const checkDoorConflict = (newDoor: Door, existingDoors: Door[], doorWidth: number): boolean => {
  return existingDoors.some(existingDoor => {
    if (existingDoor.wallSegmentId !== newDoor.wallSegmentId) return false;
    
    const distance = Math.abs(existingDoor.wallPosition - newDoor.wallPosition);
    const minDistance = (doorWidth + existingDoor.width) / 2; // Minimum separation
    
    return distance < minDistance;
  });
};
