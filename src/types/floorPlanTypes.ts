
export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  length: number;  // in mm
  width: number;   // in mm
  height: number;  // in mm
}

export enum WallType {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  LOAD_BEARING = 'load_bearing',
  PARTITION = 'partition'
}

export interface WallSegment {
  id: string;
  start: Point;
  end: Point;
  type: WallType;
  thickness: number; // in mm
}

export interface PlacedProduct {
  id: string;
  productId: string;
  name: string;
  category: string;
  dimensions: Dimensions;
  position: Point;
  rotation: number;
  scale: number;
  color?: string;
  finishes?: string[];
  variants?: string[];
  modelPath?: string;
  thumbnail?: string;
}

export interface Door {
  id: string;
  wallSegmentId: string;
  position: Point;
  wallPosition: number; // position along the wall (0-1)
  width: number; // in meters
  rotation: number;
  swingDirection: 'inward' | 'outward';
  type: 'single' | 'double';
}

export interface TextAnnotation {
  id: string;
  text: string;
  position: Point;
  fontSize: number;
  color: string;
}

export interface Room {
  id: string;
  name: string;
  points: Point[];
  area: number; // in mm²
  perimeter: number; // in mm
}

export interface FloorPlanState {
  roomPoints: Point[];
  placedProducts: PlacedProduct[];
  doors: Door[];
  textAnnotations: TextAnnotation[];
  wallSegments: WallSegment[];
  rooms: Room[];
}

export type DrawingMode = 'select' | 'room' | 'wall' | 'door' | 'product' | 'measure';
export type DrawingTool = DrawingMode;
