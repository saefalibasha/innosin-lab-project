import { Point, PlacedProduct, Door, WallSegment, WallType } from '@/types/floorPlanTypes';

// Convert 3D or 2D position to 2D Point
const to2DPoint = (position: any): Point => ({
  x: position.x,
  y: position.y ?? position.z, // prefer z if available (3D)
});

export const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
      (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) /
        (polygon[j].y - polygon[i].y) + polygon[i].x)) {
      inside = !inside;
    }
  }
  return inside;
};

export const isProductWithinRoom = (product: PlacedProduct, roomPoints: Point[], wallSegments: WallSegment[], scale: number): boolean => {
  if (roomPoints.length < 3) return true;
  const center = to2DPoint(product.position);
  const { rotation, dimensions } = product;
  const productScale = product.scale || 1;
  const width = dimensions.length * scale * productScale;
  const height = dimensions.width * scale * productScale;
  const corners = getRotatedRectangleCorners(center, width, height, rotation);
  const withinRoom = corners.every(corner => isPointInPolygon(corner, roomPoints));
  const noWallOverlap = !wallSegments.some(wall => doesProductOverlapWall(product, wall, scale));
  return withinRoom && noWallOverlap;
};

export const doesProductOverlapWall = (product: PlacedProduct, wall: WallSegment, scale: number): boolean => {
  const center = to2DPoint(product.position);
  const { rotation, dimensions } = product;
  const productScale = product.scale || 1;
  const width = dimensions.length * scale * productScale;
  const height = dimensions.width * scale * productScale;
  const corners = getRotatedRectangleCorners(center, width, height, rotation);
  const wallThickness = (wall.thickness || 0.1) * scale;
  return corners.some(corner => distancePointToLineSegment(corner, wall.start, wall.end) < wallThickness / 2);
};

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

export const findClosestWallSegment = (point: Point, roomPoints: Point[], wallSegments: WallSegment[]): { segment: [Point, Point], distance: number, id: string, type: WallType } | null => {
  let closestWall = null;
  let minDistance = Infinity;
  if (roomPoints.length >= 2) {
    for (let i = 0; i < roomPoints.length; i++) {
      const nextIndex = (i + 1) % roomPoints.length;
      const segment: [Point, Point] = [roomPoints[i], roomPoints[nextIndex]];
      const distance = distancePointToLineSegment(point, segment[0], segment[1]);
      if (distance < minDistance) {
        minDistance = distance;
        closestWall = { segment, distance, id: `room-wall-${i}`, type: WallType.EXTERIOR };
      }
    }
  }
  wallSegments.forEach(wall => {
    const segment: [Point, Point] = [wall.start, wall.end];
    const distance = distancePointToLineSegment(point, segment[0], segment[1]);
    if (distance < minDistance) {
      minDistance = distance;
      closestWall = { segment, distance, id: wall.id, type: wall.type };
    }
  });
  return closestWall;
};

export const findWallSnapPoint = (point: Point, roomPoints: Point[], wallSegments: WallSegment[], snapDistance: number = 20): Point | null => {
  for (const roomPoint of roomPoints) {
    const distance = Math.hypot(point.x - roomPoint.x, point.y - roomPoint.y);
    if (distance < snapDistance) return roomPoint;
  }
  for (const wall of wallSegments) {
    for (const endpoint of [wall.start, wall.end]) {
      const distance = Math.hypot(point.x - endpoint.x, point.y - endpoint.y);
      if (distance < snapDistance) return endpoint;
    }
  }
  const closestWall = findClosestWallSegment(point, roomPoints, wallSegments);
  if (closestWall && closestWall.distance < snapDistance) {
    return closestPointOnLineSegment(point, closestWall.segment[0], closestWall.segment[1]);
  }
  return null;
};

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

export const getWallAngle = (wallStart: Point, wallEnd: Point): number => {
  return Math.atan2(wallEnd.y - wallStart.y, wallEnd.x - wallStart.x) * 180 / Math.PI;
};

export const findOptimalDoorPosition = (clickPoint: Point, wallSegment: [Point, Point]): { position: Point, wallPosition: number, rotation: number } => {
  const closestPoint = closestPointOnLineSegment(clickPoint, wallSegment[0], wallSegment[1]);
  const wallLength = Math.hypot(
    wallSegment[1].x - wallSegment[0].x,
    wallSegment[1].y - wallSegment[0].y
  );
  const distanceFromStart = Math.hypot(
    closestPoint.x - wallSegment[0].x,
    closestPoint.y - wallSegment[0].y
  );
  const wallPosition = wallLength > 0 ? distanceFromStart / wallLength : 0;
  const rotation = getWallAngle(wallSegment[0], wallSegment[1]);
  return {
    position: closestPoint,
    wallPosition: Math.max(0.1, Math.min(0.9, wallPosition)),
    rotation
  };
};

export const checkDoorConflict = (newDoor: Door, existingDoors: Door[], doorWidth: number): boolean => {
  return existingDoors.some(existingDoor => {
    if (existingDoor.wallSegmentId !== newDoor.wallSegmentId) return false;
    const distance = Math.abs(existingDoor.wallPosition - newDoor.wallPosition);
    const minDistance = (doorWidth + existingDoor.width) / 2;
    return distance < minDistance;
  });
};
