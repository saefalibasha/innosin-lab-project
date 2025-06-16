
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
  isEmbedded: boolean; // indicates if door is properly embedded in wall
  wallPosition: number; // position along the wall segment (0-1)
}

export interface TextAnnotation {
  id: string;
  position: Point;
  text: string;
  fontSize: number;
}
