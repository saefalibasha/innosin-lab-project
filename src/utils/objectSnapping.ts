
import { Point, PlacedProduct } from '@/types/floorPlanTypes';
import { mmToCanvas, canvasToMm } from './measurements';

export interface SnapResult {
  snapped: boolean;
  position: Point;
  snapType: 'edge' | 'corner' | 'grid' | 'wall' | null;
  snapToObject?: PlacedProduct;
  snapDirection?: 'left' | 'right' | 'top' | 'bottom';
  distance?: number; // in mm
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: Point;
  end: Point;
  measurement?: number; // in mm
}

const SNAP_THRESHOLD_MM = 50; // 50mm snap threshold

export const calculateSnapPosition = (
  draggingObject: PlacedProduct,
  allObjects: PlacedProduct[],
  mousePosition: Point,
  scale: number,
  gridSize: number = 20
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
      break;
    }
  }

  // If no object snap, try grid snapping
  if (!bestSnap.snapped) {
    const gridSnap = checkGridSnap(mousePosition, gridSize, scale);
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
  // Convert dimensions from mm to canvas pixels
  const dragWidth = mmToCanvas(draggingObject.dimensions.length, scale);
  const dragHeight = mmToCanvas(draggingObject.dimensions.width, scale);
  
  const targetWidth = mmToCanvas(targetObject.dimensions.length, scale);
  const targetHeight = mmToCanvas(targetObject.dimensions.width, scale);
  
  const snapThresholdPx = mmToCanvas(SNAP_THRESHOLD_MM, scale);

  // Check for edge-to-edge snapping
  const snapPositions = [
    // Right edge of target to left edge of dragging
    {
      x: targetObject.position.x + targetWidth / 2 + dragWidth / 2,
      y: targetObject.position.y,
      direction: 'right' as const,
      distance: SNAP_THRESHOLD_MM
    },
    // Left edge of target to right edge of dragging
    {
      x: targetObject.position.x - targetWidth / 2 - dragWidth / 2,
      y: targetObject.position.y,
      direction: 'left' as const,
      distance: SNAP_THRESHOLD_MM
    },
    // Bottom edge of target to top edge of dragging
    {
      x: targetObject.position.x,
      y: targetObject.position.y + targetHeight / 2 + dragHeight / 2,
      direction: 'bottom' as const,
      distance: SNAP_THRESHOLD_MM
    },
    // Top edge of target to bottom edge of dragging
    {
      x: targetObject.position.x,
      y: targetObject.position.y - targetHeight / 2 - dragHeight / 2,
      direction: 'top' as const,
      distance: SNAP_THRESHOLD_MM
    }
  ];

  for (const snapPos of snapPositions) {
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - snapPos.x, 2) + 
      Math.pow(mousePosition.y - snapPos.y, 2)
    );

    if (distance < snapThresholdPx) {
      return {
        snapped: true,
        position: { x: snapPos.x, y: snapPos.y },
        snapType: 'edge',
        snapToObject: targetObject,
        snapDirection: snapPos.direction,
        distance: canvasToMm(distance, scale)
      };
    }
  }

  // Check for alignment snapping (same X or Y position)
  const alignmentThreshold = mmToCanvas(25, scale); // 25mm alignment threshold
  
  // Vertical alignment
  if (Math.abs(mousePosition.y - targetObject.position.y) < alignmentThreshold) {
    return {
      snapped: true,
      position: { x: mousePosition.x, y: targetObject.position.y },
      snapType: 'edge',
      snapToObject: targetObject,
      snapDirection: 'top',
      distance: canvasToMm(Math.abs(mousePosition.y - targetObject.position.y), scale)
    };
  }
  
  // Horizontal alignment
  if (Math.abs(mousePosition.x - targetObject.position.x) < alignmentThreshold) {
    return {
      snapped: true,
      position: { x: targetObject.position.x, y: mousePosition.y },
      snapType: 'edge',
      snapToObject: targetObject,
      snapDirection: 'left',
      distance: canvasToMm(Math.abs(mousePosition.x - targetObject.position.x), scale)
    };
  }

  return { snapped: false, position: mousePosition, snapType: null };
};

const checkGridSnap = (position: Point, gridSizeMm: number, scale: number): SnapResult => {
  const gridSizePx = mmToCanvas(gridSizeMm, scale);
  const snappedX = Math.round(position.x / gridSizePx) * gridSizePx;
  const snappedY = Math.round(position.y / gridSizePx) * gridSizePx;

  const distance = Math.sqrt(
    Math.pow(position.x - snappedX, 2) + 
    Math.pow(position.y - snappedY, 2)
  );

  const snapThresholdPx = mmToCanvas(SNAP_THRESHOLD_MM, scale);

  if (distance < snapThresholdPx) {
    return {
      snapped: true,
      position: { x: snappedX, y: snappedY },
      snapType: 'grid',
      distance: canvasToMm(distance, scale)
    };
  }

  return { snapped: false, position, snapType: null };
};

export const generateSnapGuides = (
  snapResult: SnapResult,
  canvasSize: { width: number; height: number },
  scale: number
): SnapGuide[] => {
  if (!snapResult.snapped || !snapResult.snapToObject) return [];

  const guides: SnapGuide[] = [];
  const target = snapResult.snapToObject;

  if (snapResult.snapDirection === 'right' || snapResult.snapDirection === 'left') {
    // Vertical guide line
    const measurement = snapResult.distance;
    guides.push({
      type: 'vertical',
      position: snapResult.position.x,
      start: { x: snapResult.position.x, y: 0 },
      end: { x: snapResult.position.x, y: canvasSize.height },
      measurement
    });
  }

  if (snapResult.snapDirection === 'top' || snapResult.snapDirection === 'bottom') {
    // Horizontal guide line
    const measurement = snapResult.distance;
    guides.push({
      type: 'horizontal',
      position: snapResult.position.y,
      start: { x: 0, y: snapResult.position.y },
      end: { x: canvasSize.width, y: snapResult.position.y },
      measurement
    });
  }

  return guides;
};
