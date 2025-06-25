
import { Point, PlacedProduct } from '@/types/floorPlanTypes';

export interface SnapResult {
  position: Point;
  isSnapped: boolean;
  snapType: 'grid' | 'edge' | 'corner' | 'none';
  snapTarget?: string;
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: Point;
  end: Point;
}

const SNAP_THRESHOLD = 15; // pixels
const GRID_SIZE = 20; // pixels

export const calculateSnapping = (
  draggedObject: PlacedProduct,
  newPosition: Point,
  existingObjects: PlacedProduct[],
  scale: number,
  enableGridSnap: boolean = true
): SnapResult => {
  let bestSnap: SnapResult = {
    position: newPosition,
    isSnapped: false,
    snapType: 'none'
  };

  // Check edge snapping with other objects
  for (const obj of existingObjects) {
    if (obj.id === draggedObject.id) continue;

    const snap = checkEdgeSnapping(draggedObject, newPosition, obj, scale);
    if (snap.isSnapped) {
      bestSnap = snap;
      break; // Use first valid snap
    }
  }

  // If no edge snap found, try grid snapping
  if (!bestSnap.isSnapped && enableGridSnap) {
    bestSnap = checkGridSnapping(newPosition, scale);
  }

  return bestSnap;
};

const checkEdgeSnapping = (
  draggedObject: PlacedProduct,
  newPosition: Point,
  targetObject: PlacedProduct,
  scale: number
): SnapResult => {
  const draggedWidth = draggedObject.dimensions.length * scale;
  const draggedHeight = draggedObject.dimensions.width * scale;
  const targetWidth = targetObject.dimensions.length * scale;
  const targetHeight = targetObject.dimensions.width * scale;

  // Calculate edges
  const draggedLeft = newPosition.x;
  const draggedRight = newPosition.x + draggedWidth;
  const draggedTop = newPosition.y;
  const draggedBottom = newPosition.y + draggedHeight;

  const targetLeft = targetObject.position.x;
  const targetRight = targetObject.position.x + targetWidth;
  const targetTop = targetObject.position.y;
  const targetBottom = targetObject.position.y + targetHeight;

  // Check horizontal alignment (same Y, adjacent X)
  if (Math.abs(draggedTop - targetTop) < SNAP_THRESHOLD) {
    // Snap to right edge of target
    if (Math.abs(draggedLeft - targetRight) < SNAP_THRESHOLD) {
      return {
        position: { x: targetRight, y: targetTop },
        isSnapped: true,
        snapType: 'edge',
        snapTarget: targetObject.id
      };
    }
    // Snap to left edge of target
    if (Math.abs(draggedRight - targetLeft) < SNAP_THRESHOLD) {
      return {
        position: { x: targetLeft - draggedWidth, y: targetTop },
        isSnapped: true,
        snapType: 'edge',
        snapTarget: targetObject.id
      };
    }
  }

  // Check vertical alignment (same X, adjacent Y)
  if (Math.abs(draggedLeft - targetLeft) < SNAP_THRESHOLD) {
    // Snap to bottom edge of target
    if (Math.abs(draggedTop - targetBottom) < SNAP_THRESHOLD) {
      return {
        position: { x: targetLeft, y: targetBottom },
        isSnapped: true,
        snapType: 'edge',
        snapTarget: targetObject.id
      };
    }
    // Snap to top edge of target
    if (Math.abs(draggedBottom - targetTop) < SNAP_THRESHOLD) {
      return {
        position: { x: targetLeft, y: targetTop - draggedHeight },
        isSnapped: true,
        snapType: 'edge',
        snapTarget: targetObject.id
      };
    }
  }

  return {
    position: newPosition,
    isSnapped: false,
    snapType: 'none'
  };
};

const checkGridSnapping = (position: Point, scale: number): SnapResult => {
  const snappedX = Math.round(position.x / GRID_SIZE) * GRID_SIZE;
  const snappedY = Math.round(position.y / GRID_SIZE) * GRID_SIZE;

  const isSnappedX = Math.abs(position.x - snappedX) < SNAP_THRESHOLD;
  const isSnappedY = Math.abs(position.y - snappedY) < SNAP_THRESHOLD;

  if (isSnappedX || isSnappedY) {
    return {
      position: {
        x: isSnappedX ? snappedX : position.x,
        y: isSnappedY ? snappedY : position.y
      },
      isSnapped: true,
      snapType: 'grid'
    };
  }

  return {
    position,
    isSnapped: false,
    snapType: 'none'
  };
};

export const generateSnapGuides = (
  draggedObject: PlacedProduct,
  position: Point,
  existingObjects: PlacedProduct[],
  scale: number
): SnapGuide[] => {
  const guides: SnapGuide[] = [];
  
  for (const obj of existingObjects) {
    if (obj.id === draggedObject.id) continue;

    const objWidth = obj.dimensions.length * scale;
    const objHeight = obj.dimensions.width * scale;

    // Horizontal guide for Y alignment
    if (Math.abs(position.y - obj.position.y) < SNAP_THRESHOLD) {
      guides.push({
        type: 'horizontal',
        position: obj.position.y,
        start: { x: Math.min(position.x, obj.position.x) - 50, y: obj.position.y },
        end: { x: Math.max(position.x + draggedObject.dimensions.length * scale, obj.position.x + objWidth) + 50, y: obj.position.y }
      });
    }

    // Vertical guide for X alignment
    if (Math.abs(position.x - obj.position.x) < SNAP_THRESHOLD) {
      guides.push({
        type: 'vertical',
        position: obj.position.x,
        start: { x: obj.position.x, y: Math.min(position.y, obj.position.y) - 50 },
        end: { x: obj.position.x, y: Math.max(position.y + draggedObject.dimensions.width * scale, obj.position.y + objHeight) + 50 }
      });
    }
  }

  return guides;
};
