
interface Point {
  x: number;
  y: number;
}

interface PlacedProduct {
  id: string;
  productId: string;
  name: string;
  position: Point;
  rotation: number;
  dimensions: { length: number; width: number; height: number };
  color: string;
  scale?: number;
}

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

// Check if a product (rectangle) is completely within the room polygon
export const isProductWithinRoom = (product: PlacedProduct, roomPoints: Point[], scale: number): boolean => {
  if (roomPoints.length < 3) return true; // No room boundaries defined
  
  const { position, rotation, dimensions } = product;
  const productScale = product.scale || 1;
  const width = dimensions.length * scale * productScale;
  const height = dimensions.width * scale * productScale;
  
  // Get the four corners of the rotated rectangle
  const corners = getRotatedRectangleCorners(position, width, height, rotation);
  
  // Check if all corners are inside the polygon
  return corners.every(corner => isPointInPolygon(corner, roomPoints));
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

// Find the closest wall segment to a point
export const findClosestWallSegment = (point: Point, roomPoints: Point[]): { segment: [Point, Point], distance: number, index: number } | null => {
  if (roomPoints.length < 2) return null;
  
  let closestSegment = null;
  let minDistance = Infinity;
  let closestIndex = -1;
  
  for (let i = 0; i < roomPoints.length; i++) {
    const nextIndex = (i + 1) % roomPoints.length;
    const segment: [Point, Point] = [roomPoints[i], roomPoints[nextIndex]];
    
    const closestPoint = closestPointOnLineSegment(point, segment[0], segment[1]);
    const distance = Math.sqrt(
      Math.pow(point.x - closestPoint.x, 2) + Math.pow(point.y - closestPoint.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestSegment = segment;
      closestIndex = i;
    }
  }
  
  return closestSegment ? { segment: closestSegment, distance: minDistance, index: closestIndex } : null;
};

// Calculate wall angle for door placement
export const getWallAngle = (wallStart: Point, wallEnd: Point): number => {
  return Math.atan2(wallEnd.y - wallStart.y, wallEnd.x - wallStart.x) * 180 / Math.PI;
};
