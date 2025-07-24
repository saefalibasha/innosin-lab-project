
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
  isSelected?: boolean;
  connectedWalls?: string[]; // IDs of connected walls
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
  position: Point;
  width: number; // in meters
  rotation: number;
  swingDirection: 'inward' | 'outward';
  type: 'single' | 'double';
  wallSegmentId?: string;
  wallPosition?: number; // 0-1 position along wall
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

export interface SnapSettings {
  enabled: boolean;
  strength: 'strong' | 'medium' | 'weak';
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToAlignment: boolean;
  snapToEndpoints: boolean;
}

export interface GridSettings {
  size: number; // in mm
  showMajorLines: boolean;
  showMinorLines: boolean;
  opacity: number;
}

export interface ViewportSettings {
  zoom: number;
  pan: Point;
  showRulers: boolean;
  showMeasurements: boolean;
}

export interface WallDrawingState {
  isDrawing: boolean;
  points: Point[];
  currentPoint: Point | null;
  thickness: number;
  wallType: WallType;
}
