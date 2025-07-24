
export interface Point {
  x: number;
  y: number;
}

export interface PlacedProduct {
  id: string;
  productId: string;
  name: string;
  category: string;
  position: Point;
  rotation: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  color: string;
  scale?: number;
  modelPath?: string;
  thumbnail?: string;
  description?: string;
  specifications?: string[];
  finishes?: ProductFinish[];
  variants?: ProductVariant[];
}

export interface ProductFinish {
  type: string;
  name: string;
  price?: string;
  modelPath?: string;
  thumbnail?: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  dimensions: string;
  modelPath: string;
  thumbnail: string;
}

export interface Door {
  id: string;
  position: Point;
  width: number;
  wallId?: string;
  isEmbedded?: boolean;
}

export interface TextAnnotation {
  id: string;
  position: Point;
  text: string;
  fontSize: number;
  color: string;
}

export interface WallSegment {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
  color: string;
}

export interface Room {
  id: string;
  name: string;
  points: Point[];
  area: number;
  perimeter: number;
  color?: string;
}

export interface FloorPlanState {
  roomPoints: Point[];
  placedProducts: PlacedProduct[];
  doors: Door[];
  textAnnotations: TextAnnotation[];
  wallSegments: WallSegment[];
  rooms: Room[];
}

export type DrawingMode = 'select' | 'wall' | 'interior-wall' | 'door' | 'room' | 'text' | 'measure' | 'pan' | 'line' | 'freehand' | 'eraser' | 'rotate';
