
import { Point, PlacedProduct, WallSegment, Room, SnapSettings } from '@/types/floorPlanTypes';
import { mmToCanvas, canvasToMm } from './measurements';

export interface SnapResult {
  point: Point;
  snapped: boolean;
  snapType: 'grid' | 'object' | 'alignment' | 'wall' | 'room' | null;
  target?: any;
  distance?: number;
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: Point;
  end: Point;
  color?: string;
}

export class SnapSystem {
  private settings: SnapSettings;
  private gridSize: number;
  private scale: number;
  private snapThreshold: number;

  constructor(settings: SnapSettings, gridSize: number, scale: number) {
    this.settings = settings;
    this.gridSize = gridSize;
    this.scale = scale;
    this.snapThreshold = this.getSnapThreshold();
  }

  private getSnapThreshold(): number {
    const baseThreshold = 20; // pixels
    switch (this.settings.strength) {
      case 'strong': return baseThreshold * 1.5;
      case 'medium': return baseThreshold;
      case 'weak': return baseThreshold * 0.5;
      default: return baseThreshold;
    }
  }

  public snapPoint(
    point: Point,
    placedProducts: PlacedProduct[],
    wallSegments: WallSegment[],
    rooms: Room[]
  ): SnapResult {
    if (!this.settings.enabled) {
      return { point, snapped: false, snapType: null };
    }

    // Try snapping in order of priority
    let snapResult: SnapResult = { point, snapped: false, snapType: null };

    // 1. Try object snapping (highest priority)
    if (this.settings.snapToObjects) {
      snapResult = this.snapToObjects(point, placedProducts);
      if (snapResult.snapped) return snapResult;

      snapResult = this.snapToWalls(point, wallSegments);
      if (snapResult.snapped) return snapResult;

      snapResult = this.snapToRooms(point, rooms);
      if (snapResult.snapped) return snapResult;
    }

    // 2. Try alignment snapping
    if (this.settings.snapToAlignment) {
      snapResult = this.snapToAlignment(point, placedProducts, wallSegments);
      if (snapResult.snapped) return snapResult;
    }

    // 3. Try grid snapping (lowest priority)
    if (this.settings.snapToGrid) {
      snapResult = this.snapToGrid(point);
      if (snapResult.snapped) return snapResult;
    }

    return { point, snapped: false, snapType: null };
  }

  // Enhanced door placement with wall detection
  public snapDoorToWall(
    point: Point,
    wallSegments: WallSegment[]
  ): SnapResult {
    if (!this.settings.enabled) {
      return { point, snapped: false, snapType: null };
    }

    let nearestWallSnap: SnapResult = { point, snapped: false, snapType: null };
    let minDistance = Infinity;

    for (const wall of wallSegments) {
      // Project point onto wall line
      const projection = this.projectPointOntoWall(point, wall);
      if (!projection) continue;

      const distance = Math.sqrt(
        Math.pow(point.x - projection.x, 2) + Math.pow(point.y - projection.y, 2)
      );

      if (distance < this.snapThreshold && distance < minDistance) {
        minDistance = distance;
        nearestWallSnap = {
          point: projection,
          snapped: true,
          snapType: 'wall',
          target: wall,
          distance
        };
      }
    }

    return nearestWallSnap;
  }

  // Project point onto wall line segment
  private projectPointOntoWall(point: Point, wall: WallSegment): Point | null {
    const A = point.x - wall.start.x;
    const B = point.y - wall.start.y;
    const C = wall.end.x - wall.start.x;
    const D = wall.end.y - wall.start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return null; // Zero-length wall

    const param = dot / lenSq;
    
    // Clamp to wall segment
    const clampedParam = Math.max(0, Math.min(1, param));
    
    return {
      x: wall.start.x + clampedParam * C,
      y: wall.start.y + clampedParam * D
    };
  }

  // Find nearest wall for door placement
  public findNearestWall(point: Point, wallSegments: WallSegment[]): WallSegment | null {
    let nearestWall: WallSegment | null = null;
    let minDistance = this.snapThreshold;

    for (const wall of wallSegments) {
      const distance = this.distanceToLineSegment(point, wall.start, wall.end);
      if (distance < minDistance) {
        minDistance = distance;
        nearestWall = wall;
      }
    }

    return nearestWall;
  }

  // Helper function to calculate distance from point to line segment
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

  private snapToGrid(point: Point): SnapResult {
    const gridSizePx = mmToCanvas(this.gridSize, this.scale);
    const snappedX = Math.round(point.x / gridSizePx) * gridSizePx;
    const snappedY = Math.round(point.y / gridSizePx) * gridSizePx;

    const distance = Math.sqrt(
      Math.pow(point.x - snappedX, 2) + Math.pow(point.y - snappedY, 2)
    );

    if (distance < this.snapThreshold) {
      return {
        point: { x: snappedX, y: snappedY },
        snapped: true,
        snapType: 'grid',
        distance
      };
    }

    return { point, snapped: false, snapType: null };
  }

  private snapToObjects(point: Point, objects: PlacedProduct[]): SnapResult {
    for (const obj of objects) {
      const objWidth = mmToCanvas(obj.dimensions.length, this.scale);
      const objHeight = mmToCanvas(obj.dimensions.width, this.scale);

      // Check corners and edges
      const snapPoints = [
        // Corners
        { x: obj.position.x - objWidth / 2, y: obj.position.y - objHeight / 2 },
        { x: obj.position.x + objWidth / 2, y: obj.position.y - objHeight / 2 },
        { x: obj.position.x - objWidth / 2, y: obj.position.y + objHeight / 2 },
        { x: obj.position.x + objWidth / 2, y: obj.position.y + objHeight / 2 },
        // Centers
        { x: obj.position.x, y: obj.position.y },
        // Edge midpoints
        { x: obj.position.x, y: obj.position.y - objHeight / 2 },
        { x: obj.position.x, y: obj.position.y + objHeight / 2 },
        { x: obj.position.x - objWidth / 2, y: obj.position.y },
        { x: obj.position.x + objWidth / 2, y: obj.position.y }
      ];

      for (const snapPoint of snapPoints) {
        const distance = Math.sqrt(
          Math.pow(point.x - snapPoint.x, 2) + Math.pow(point.y - snapPoint.y, 2)
        );

        if (distance < this.snapThreshold) {
          return {
            point: snapPoint,
            snapped: true,
            snapType: 'object',
            target: obj,
            distance
          };
        }
      }
    }

    return { point, snapped: false, snapType: null };
  }

  private snapToWalls(point: Point, walls: WallSegment[]): SnapResult {
    for (const wall of walls) {
      // Check wall endpoints
      const endpoints = [wall.start, wall.end];
      
      for (const endpoint of endpoints) {
        const distance = Math.sqrt(
          Math.pow(point.x - endpoint.x, 2) + Math.pow(point.y - endpoint.y, 2)
        );

        if (distance < this.snapThreshold) {
          return {
            point: endpoint,
            snapped: true,
            snapType: 'wall',
            target: wall,
            distance
          };
        }
      }

      // Check wall midpoint
      const midpoint = {
        x: (wall.start.x + wall.end.x) / 2,
        y: (wall.start.y + wall.end.y) / 2
      };

      const midDistance = Math.sqrt(
        Math.pow(point.x - midpoint.x, 2) + Math.pow(point.y - midpoint.y, 2)
      );

      if (midDistance < this.snapThreshold) {
        return {
          point: midpoint,
          snapped: true,
          snapType: 'wall',
          target: wall,
          distance: midDistance
        };
      }
    }

    return { point, snapped: false, snapType: null };
  }

  private snapToRooms(point: Point, rooms: Room[]): SnapResult {
    for (const room of rooms) {
      for (const roomPoint of room.points) {
        const distance = Math.sqrt(
          Math.pow(point.x - roomPoint.x, 2) + Math.pow(point.y - roomPoint.y, 2)
        );

        if (distance < this.snapThreshold) {
          return {
            point: roomPoint,
            snapped: true,
            snapType: 'room',
            target: room,
            distance
          };
        }
      }
    }

    return { point, snapped: false, snapType: null };
  }

  private snapToAlignment(
    point: Point,
    objects: PlacedProduct[],
    walls: WallSegment[]
  ): SnapResult {
    // Check horizontal alignment
    for (const obj of objects) {
      if (Math.abs(point.y - obj.position.y) < this.snapThreshold) {
        return {
          point: { x: point.x, y: obj.position.y },
          snapped: true,
          snapType: 'alignment',
          target: obj,
          distance: Math.abs(point.y - obj.position.y)
        };
      }
    }

    // Check vertical alignment
    for (const obj of objects) {
      if (Math.abs(point.x - obj.position.x) < this.snapThreshold) {
        return {
          point: { x: obj.position.x, y: point.y },
          snapped: true,
          snapType: 'alignment',
          target: obj,
          distance: Math.abs(point.x - obj.position.x)
        };
      }
    }

    return { point, snapped: false, snapType: null };
  }

  public generateGuides(
    snapResult: SnapResult,
    canvasWidth: number,
    canvasHeight: number
  ): SnapGuide[] {
    if (!snapResult.snapped) {
      return [];
    }

    const guides: SnapGuide[] = [];

    if (snapResult.snapType === 'alignment' && snapResult.target) {
      // Horizontal guide
      guides.push({
        type: 'horizontal',
        position: snapResult.point.y,
        start: { x: 0, y: snapResult.point.y },
        end: { x: canvasWidth, y: snapResult.point.y },
        color: 'hsl(var(--primary))'
      });

      // Vertical guide
      guides.push({
        type: 'vertical',
        position: snapResult.point.x,
        start: { x: snapResult.point.x, y: 0 },
        end: { x: snapResult.point.x, y: canvasHeight },
        color: 'hsl(var(--primary))'
      });
    }

    // Wall snap guides for doors
    if (snapResult.snapType === 'wall' && snapResult.target) {
      const wall = snapResult.target as WallSegment;
      // Show wall highlight guide
      guides.push({
        type: 'horizontal',
        position: snapResult.point.y,
        start: wall.start,
        end: wall.end,
        color: 'hsl(var(--accent))'
      });
    }

    return guides;
  }
}
