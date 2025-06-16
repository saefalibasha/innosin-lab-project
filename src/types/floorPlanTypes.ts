
export interface Point {
  x: number;
  y: number;
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
  wallSegmentIndex: number;
}

export interface TextAnnotation {
  id: string;
  position: Point;
  text: string;
  fontSize: number;
}
