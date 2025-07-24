
import { Point, PlacedProduct, WallSegment, Room, SnapSettings } from '@/types/floorPlanTypes';

export interface SnapResult {
  point: Point;
  snapped: boolean;
  snapType?: 'grid' | 'endpoint' | 'object' | 'alignment';
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
    switch (this.settings.strength) {
      case 'strong': return 20;
      case 'medium': return 10;
      case 'weak': return 5;
      default: return 10;
    }
  }

  snapPoint(
    point: Point,
    products: PlacedProduct[],
    walls: WallSegment[],
    rooms: Room[]
  ): SnapResult {
    if (!this.settings.enabled) {
      return { point, snapped: false };
    }

    // Try grid snap first
    if (this.settings.snapToGrid) {
      const gridSnap = this.snapToGrid(point);
      if (gridSnap.snapped) return gridSnap;
    }

    // Try endpoint snap
    if (this.settings.snapToEndpoints) {
      const endpointSnap = this.snapToEndpoints(point, walls);
      if (endpointSnap.snapped) return endpointSnap;
    }

    // Try object snap
    if (this.settings.snapToObjects) {
      const objectSnap = this.snapToObjects(point, products);
      if (objectSnap.snapped) return objectSnap;
    }

    return { point, snapped: false };
  }

  private snapToGrid(point: Point): SnapResult {
    const gridPixelSize = this.gridSize * this.scale;
    const snappedX = Math.round(point.x / gridPixelSize) * gridPixelSize;
    const snappedY = Math.round(point.y / gridPixelSize) * gridPixelSize;
    
    const distance = Math.sqrt(
      Math.pow(snappedX - point.x, 2) + Math.pow(snappedY - point.y, 2)
    );
    
    if (distance <= this.snapThreshold) {
      return {
        point: { x: snappedX, y: snappedY },
        snapped: true,
        snapType: 'grid'
      };
    }
    
    return { point, snapped: false };
  }

  private snapToEndpoints(point: Point, walls: WallSegment[]): SnapResult {
    for (const wall of walls) {
      const endpoints = [wall.start, wall.end];
      
      for (const endpoint of endpoints) {
        const distance = Math.sqrt(
          Math.pow(endpoint.x - point.x, 2) + Math.pow(endpoint.y - point.y, 2)
        );
        
        if (distance <= this.snapThreshold) {
          return {
            point: endpoint,
            snapped: true,
            snapType: 'endpoint'
          };
        }
      }
    }
    
    return { point, snapped: false };
  }

  private snapToObjects(point: Point, products: PlacedProduct[]): SnapResult {
    for (const product of products) {
      const distance = Math.sqrt(
        Math.pow(product.position.x - point.x, 2) + Math.pow(product.position.y - point.y, 2)
      );
      
      if (distance <= this.snapThreshold) {
        return {
          point: product.position,
          snapped: true,
          snapType: 'object'
        };
      }
    }
    
    return { point, snapped: false };
  }
}
