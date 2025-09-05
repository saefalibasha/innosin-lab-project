import { useState, useRef, useCallback } from 'react';
import { PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { useEnhanced3DSnapping } from './useEnhanced3DSnapping';

interface DragState3D {
  isDragging: boolean;
  draggedProduct: PlacedProduct | null;
  dragOffset: [number, number, number];
  currentPosition: [number, number, number];
  isValid: boolean;
}

export const useEnhanced3DDragging = (
  wallSegments: WallSegment[],
  placedProducts: PlacedProduct[],
  scale: number,
  onProductUpdate: (productId: string, updates: Partial<PlacedProduct>) => void,
  onWallUpdate?: (updatedWall: WallSegment) => void // ✅ Added
) => {
  const [dragState, setDragState] = useState<DragState3D>({
    isDragging: false,
    draggedProduct: null,
    dragOffset: [0, 0, 0],
    currentPosition: [0, 0, 0],
    isValid: true
  });

  const initialPointerPos = useRef<{ x: number; y: number } | null>(null);

  // Integrate enhanced snapping
  const { 
    snapToPosition, 
    snapGuides, 
    updateSnapGuides, 
    clearSnapGuides 
  } = useEnhanced3DSnapping(wallSegments, placedProducts, scale);

  const startDrag = useCallback((
    product: PlacedProduct, 
    intersectionPoint: [number, number, number],
    pointerEvent: any
  ) => {
    initialPointerPos.current = { x: pointerEvent.x, y: pointerEvent.y };

    const productPos = [
      product.position.x * scale * 0.001,
      0,
      product.position.y * scale * 0.001
    ] as [number, number, number];

    const offset = [
      intersectionPoint[0] - productPos[0],
      intersectionPoint[1] - productPos[1], 
      intersectionPoint[2] - productPos[2]
    ] as [number, number, number];

    setDragState({
      isDragging: true,
      draggedProduct: product,
      dragOffset: offset,
      currentPosition: productPos,
      isValid: true
    });
  }, [scale]);

  const updateDrag = useCallback((
    intersectionPoint: [number, number, number] | null,
    camera: any,
    pointer: { x: number; y: number }
  ) => {
    if (!dragState.isDragging || !dragState.draggedProduct) return;

    let targetPosition: [number, number, number];

    if (intersectionPoint) {
      targetPosition = [
        intersectionPoint[0] - dragState.dragOffset[0],
        intersectionPoint[1] - dragState.dragOffset[1],
        intersectionPoint[2] - dragState.dragOffset[2]
      ];
    } else {
      if (!initialPointerPos.current) return;

      const deltaX = (pointer.x - initialPointerPos.current.x) * 0.01;
      const deltaY = (pointer.y - initialPointerPos.current.y) * 0.01;

      targetPosition = [
        dragState.currentPosition[0] + deltaX,
        dragState.currentPosition[1],
        dragState.currentPosition[2] + deltaY
      ];
    }

    const snapResult = snapToPosition(targetPosition, dragState.draggedProduct, ['wall', 'product', 'grid']);
    const finalPosition = snapResult.snapped ? snapResult.position : targetPosition;

    setDragState(prev => ({
      ...prev,
      currentPosition: finalPosition,
      isValid: true
    }));

    updateSnapGuides(snapResult);
  }, [dragState, snapToPosition, updateSnapGuides]);

  const endDrag = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedProduct) return;

    if (dragState.isValid) {
      const newPosition = {
        x: dragState.currentPosition[0] / (scale * 0.001),
        y: dragState.currentPosition[2] / (scale * 0.001)
      };

      onProductUpdate(dragState.draggedProduct.id, { position: newPosition });

      // ✅ Optional: call onWallUpdate if wall proximity caused an update
      // Example (pseudo-code):
      /*
      const wall = wallSegments.find(...); // your logic
      const updatedWall = { ...wall, ...newValues };
      onWallUpdate?.(updatedWall);
      */
    }

    setDragState({
      isDragging: false,
      draggedProduct: null,
      dragOffset: [0, 0, 0],
      currentPosition: [0, 0, 0],
      isValid: true
    });

    clearSnapGuides();
    initialPointerPos.current = null;
  }, [dragState, onProductUpdate, scale, clearSnapGuides, wallSegments, onWallUpdate]); // ✅ Added deps

  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedProduct: null,
      dragOffset: [0, 0, 0],
      currentPosition: [0, 0, 0],
      isValid: true
    });

    clearSnapGuides();
    initialPointerPos.current = null;
  }, [clearSnapGuides]);

  return {
    dragState,
    snapGuides,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag
  };
};
