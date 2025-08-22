
export interface Point {
  x: number;
  y: number;
}

export enum WallType {
  INTERIOR = 'interior',
  EXTERIOR = 'exterior',
  PARTITION = 'partition',
  LOAD_BEARING = 'load_bearing'
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
  wallSegmentId?: string;
  wallPosition?: number;
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
  type: WallType;
}

export interface Room {
  id: string;
  name: string;
  points: Point[];
  area: number;
  perimeter: number;
  color?: string;
}

export interface GridSettings {
  show: boolean;
  size: number;
  snap: boolean;
  color: string;
  showMajorLines: boolean;
  showMinorLines: boolean;
  opacity: number;
}

export interface ViewportSettings {
  zoom: number;
  pan: Point;
  center: Point;
}

export interface SnapSettings {
  enabled: boolean;
  gridSnap: boolean;
  objectSnap: boolean;
  snapDistance: number;
  strength: 'weak' | 'medium' | 'strong';
  snapToObjects: boolean;
  snapToAlignment: boolean;
  snapToGrid: boolean;
}

export interface FloorPlanState {
  roomPoints: Point[];
  placedProducts: PlacedProduct[];
  doors: Door[];
  textAnnotations: TextAnnotation[];
  wallSegments: WallSegment[];
  rooms: Room[];
}

export type DrawingMode = 'select' | 'move' | 'wall' | 'interior-wall' | 'door' | 'room' | 'text' | 'measure' | 'pan' | 'line' | 'freehand' | 'eraser' | 'rotate';
export type DrawingTool = DrawingMode;
