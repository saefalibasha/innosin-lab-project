
import { Point, PlacedProduct } from '@/types/floorPlanTypes';

export interface SnapResult {
  snapped: boolean;
  position: Point;
  snapType: 'edge' | 'corner' | 'grid' | null;
  snapToObject?: PlacedProduct;
  snapDirection?: 'left' | 'right' | 'top' | 'bottom';
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: Point;
  end: Point;
}

const SNAP_THRESHOLD = 15; // pixels
const GRID_SIZE = 20; // pixels

export const calculateSnapPosition = (
  draggingObject: PlacedProduct,
  allObjects: PlacedProduct[],
  mousePosition: Point,
  scale: number
): SnapResult => {
  let bestSnap: SnapResult = {
    snapped: false,
    position: mousePosition,
    snapType: null
  };

  // Try snapping to other objects first (higher priority)
  for (const obj of allObjects) {
    if (obj.id === draggingObject.id) continue;

    const snap = checkObjectSnap(draggingObject, obj, mousePosition, scale);
    if (snap.snapped) {
      bestSnap = snap;
      break; // Take the first valid object snap
    }
  }

  // If no object snap, try grid snapping
  if (!bestSnap.snapped) {
    const gridSnap = checkGridSnap(mousePosition, GRID_SIZE);
    if (gridSnap.snapped) {
      bestSnap = gridSnap;
    }
  }

  return bestSnap;
};

const checkObjectSnap = (
  draggingObject: PlacedProduct,
  targetObject: PlacedProduct,
  mousePosition: Point,
  scale: number
): SnapResult => {
  const dragWidth = draggingObject.dimensions.length * scale;
  const dragHeight = draggingObject.dimensions.width * scale;
  
  const targetWidth = targetObject.dimensions.length * scale;
  const targetHeight = targetObject.dimensions.width * scale;

  // Check for edge-to-edge snapping (table extension)
  const snapPositions = [
    // Right edge of target to left edge of dragging
    {
      x: targetObject.position.x + targetWidth,
      y: targetObject.position.y,
      direction: 'right' as const
    },
    // Left edge of target to right edge of dragging
    {
      x: targetObject.position.x - dragWidth,
      y: targetObject.position.y,
      direction: 'left' as const
    },
    // Bottom edge of target to top edge of dragging
    {
      x: targetObject.position.x,
      y: targetObject.position.y + targetHeight,
      direction: 'bottom' as const
    },
    // Top edge of target to bottom edge of dragging
    {
      x: targetObject.position.x,
      y: targetObject.position.y - dragHeight,
      direction: 'top' as const
    }
  ];

  for (const snapPos of snapPositions) {
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - snapPos.x, 2) + 
      Math.pow(mousePosition.y - snapPos.y, 2)
    );

    if (distance < SNAP_THRESHOLD) {
      return {
        snapped: true,
        position: { x: snapPos.x, y: snapPos.y },
        snapType: 'edge',
        snapToObject: targetObject,
        snapDirection: snapPos.direction
      };
    }
  }

  return { snapped: false, position: mousePosition, snapType: null };
};

const checkGridSnap = (position: Point, gridSize: number): SnapResult => {
  const snappedX = Math.round(position.x / gridSize) * gridSize;
  const snappedY = Math.round(position.y / gridSize) * gridSize;

  const distance = Math.sqrt(
    Math.pow(position.x - snappedX, 2) + 
    Math.pow(position.y - snappedY, 2)
  );

  if (distance < SNAP_THRESHOLD) {
    return {
      snapped: true,
      position: { x: snappedX, y: snappedY },
      snapType: 'grid'
    };
  }

  return { snapped: false, position, snapType: null };
};

export const generateSnapGuides = (
  snapResult: SnapResult,
  canvasSize: { width: number; height: number }
): SnapGuide[] => {
  if (!snapResult.snapped || !snapResult.snapToObject) return [];

  const guides: SnapGuide[] = [];
  const target = snapResult.snapToObject;

  if (snapResult.snapDirection === 'right' || snapResult.snapDirection === 'left') {
    // Vertical guide line
    guides.push({
      type: 'vertical',
      position: snapResult.position.x,
      start: { x: snapResult.position.x, y: 0 },
      end: { x: snapResult.position.x, y: canvasSize.height }
    });
  }

  if (snapResult.snapDirection === 'top' || snapResult.snapDirection === 'bottom') {
    // Horizontal guide line
    guides.push({
      type: 'horizontal',
      position: snapResult.position.y,
      start: { x: 0, y: snapResult.position.y },
      end: { x: canvasSize.width, y: snapResult.position.y }
    });
  }

  return guides;
};
