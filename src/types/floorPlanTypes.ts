
export interface Point {
  x: number;
  y: number;
}

export enum WallType {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior'
}

export interface WallSegment {
  id: string;
  start: Point;
  end: Point;
  type: WallType;
  thickness?: number;
}

export interface PlacedProduct {
  id: string;
  productId: string;
  name: string;
  position: Point;
  rotation: number;
  dimensions: { length: number; width: number; height: number };
  color: string;
  scale?: number;
}

export interface Door {
  id: string;
  position: Point;
  rotation: number;
  width: number; // in meters
  swingDirection: 'inward' | 'outward';
  wallSegmentId: string; // reference to wall segment instead of index
  wallPosition: number; // position along the wall segment (0-1)
  isEmbedded: boolean;
}

export interface TextAnnotation {
  id: string;
  position: Point;
  text: string;
  fontSize: number;
}
