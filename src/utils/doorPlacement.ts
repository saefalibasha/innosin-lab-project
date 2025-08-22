import { Point, WallSegment, Door } from '@/types/floorPlanTypes';

export interface DoorPlacementResult {
  position: Point;
  wallId?: string;
  isEmbedded: boolean;
  wallPosition?: number; // Position along wall (0-1)
}

export class DoorPlacementSystem {
  private snapThreshold: number;

  constructor(snapThreshold: number = 30) {
    this.snapThreshold = snapThreshold;
  }

  // Find the best placement for a door near the given point
  public findDoorPlacement(
    point: Point,
    wallSegments: WallSegment[]
  ): DoorPlacementResult {
    const nearestWall = this.findNearestWall(point, wallSegments);
    
    if (nearestWall) {
      const wallPosition = this.projectPointOntoWall(point, nearestWall.wall);
      if (wallPosition) {
        return {
          position: wallPosition.point,
          wallId: nearestWall.wall.id,
          isEmbedded: true,
          wallPosition: wallPosition.parameter
        };
      }
    }

    // Fallback to regular placement
    return {
      position: point,
      isEmbedded: false
    };
  }

  // Find the nearest wall within snap threshold
  private findNearestWall(
    point: Point,
    wallSegments: WallSegment[]
  ): { wall: WallSegment; distance: number } | null {
    let nearestWall: WallSegment | null = null;
    let minDistance = this.snapThreshold;

    for (const wall of wallSegments) {
      const distance = this.distanceToLineSegment(point, wall.start, wall.end);
      if (distance < minDistance) {
        minDistance = distance;
        nearestWall = wall;
      }
    }

    return nearestWall ? { wall: nearestWall, distance: minDistance } : null;
  }

  // Project point onto wall and return position along wall
  private projectPointOntoWall(
    point: Point,
    wall: WallSegment
  ): { point: Point; parameter: number } | null {
    const A = point.x - wall.start.x;
    const B = point.y - wall.start.y;
    const C = wall.end.x - wall.start.x;
    const D = wall.end.y - wall.start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return null; // Zero-length wall

    const param = dot / lenSq;
    
    // Clamp to wall segment (keep door on wall)
    const clampedParam = Math.max(0.1, Math.min(0.9, param)); // Leave margin at ends
    
    return {
      point: {
        x: wall.start.x + clampedParam * C,
        y: wall.start.y + clampedParam * D
      },
      parameter: clampedParam
    };
  }

  // Calculate distance from point to line segment
  private distanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    
    if (param < 0) {
      return Math.sqrt(A * A + B * B);
    } else if (param > 1) {
      const dx = point.x - lineEnd.x;
      const dy = point.y - lineEnd.y;
      return Math.sqrt(dx * dx + dy * dy);
    } else {
      const projX = lineStart.x + param * C;
      const projY = lineStart.y + param * D;
      const dx = point.x - projX;
      const dy = point.y - projY;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }

  // Check if door placement is valid (doesn't overlap with other doors)
  public validateDoorPlacement(
    newDoor: Door,
    existingDoors: Door[],
    wallSegments: WallSegment[]
  ): boolean {
    // Check minimum distance between doors on same wall
    const minDoorDistance = 200; // mm
    
    for (const door of existingDoors) {
      if (door.wallId === newDoor.wallId && door.wallId) {
        const distance = Math.sqrt(
          Math.pow(newDoor.position.x - door.position.x, 2) +
          Math.pow(newDoor.position.y - door.position.y, 2)
        );
        
        if (distance < minDoorDistance) {
          return false;
        }
      }
    }

    return true;
  }
}
