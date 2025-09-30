import { useState, useRef, useCallback } from 'react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { useEnhanced3DSnapping } from './useEnhanced3DSnapping';
import { canvasTo3DWorld, worldTo2DCanvas } from '@/utils/coordinateUtils';

const GROUND_EPSILON = 0.008; // meters (~8mm) to keep products slightly above floor
interface DragState3D {
  isDragging: boolean;
  draggedProduct: PlacedProduct | null;
  dragOffset: [number, number, number];
  initialPosition: [number, number, number];
  currentPosition: [number, number, number];
  isValid: boolean;
}

export const useEnhanced3DDragging = (
  wallSegments: any[],
  placedProducts: PlacedProduct[],
  scale: number,
  onProductUpdate: (productId: string, updates: Partial<PlacedProduct>) => void
) => {
  const [dragState, setDragState] = useState<DragState3D>({
    isDragging: false,
    draggedProduct: null,
    dragOffset: [0, 0, 0],
    initialPosition: [0, 0, 0],
    currentPosition: [0, 0, 0],
    isValid: true,
  });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const { snapToPosition, snapGuides, updateSnapGuides, clearSnapGuides } = useEnhanced3DSnapping(
    wallSegments,
    placedProducts.filter((p) => p.id !== dragState.draggedProduct?.id),
    scale
  );

  const startDrag = useCallback(
    (product: PlacedProduct, intersectionPoint: [number, number, number], pointerEvent: any) => {
      const productPosition = canvasTo3DWorld(product.position, scale);
      const offset: [number, number, number] = [
        intersectionPoint[0] - productPosition[0],
        intersectionPoint[1] - productPosition[1],
        intersectionPoint[2] - productPosition[2],
      ];

      dragStartRef.current = { x: pointerEvent.clientX, y: pointerEvent.clientY };

      setDragState({
        isDragging: true,
        draggedProduct: product,
        dragOffset: offset,
        initialPosition: productPosition,
        currentPosition: productPosition,
        isValid: true,
      });
    },
    [scale]
  );

  const updateDrag = useCallback(
    (
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
          intersectionPoint[2] - dragState.dragOffset[2],
        ];
      } else {
        if (!dragStartRef.current) return;
        const deltaX = pointer.x - dragStartRef.current.x;
        const worldDelta = deltaX * 0.01; // simple fallback
        targetPosition = [
          dragState.initialPosition[0] + worldDelta,
          dragState.initialPosition[1],
          dragState.initialPosition[2],
        ];
      }

      // Apply snapping
      const snapResult = snapToPosition(targetPosition, dragState.draggedProduct, [
        'wall',
        'product',
        'grid',
      ]);

      // snapResult.position is already in 3D world coordinates, don't convert again
      const finalPosition = snapResult.snapped
        ? [snapResult.position[0], GROUND_EPSILON, snapResult.position[2]] as [number, number, number]
        : targetPosition;
      
      console.debug('[useEnhanced3DDragging] Snap result:', { 
        snapped: snapResult.snapped, 
        snapPosition: snapResult.position,
        finalPosition 
      });

      setDragState((prev) => ({
        ...prev,
        currentPosition: finalPosition,
        isValid: true,
      }));

      if (snapResult.snapped) {
        updateSnapGuides(snapResult);
      } else {
        clearSnapGuides();
      }
    },
    [dragState, snapToPosition, updateSnapGuides, clearSnapGuides, scale]
  );

  const endDrag = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedProduct) return;

    if (dragState.isValid) {
      const canvasPosition = worldTo2DCanvas(
        dragState.currentPosition[0],
        dragState.currentPosition[2],
        scale
      );

      onProductUpdate(dragState.draggedProduct.id, {
        position: canvasPosition,
      });
    }

    setDragState({
      isDragging: false,
      draggedProduct: null,
      dragOffset: [0, 0, 0],
      initialPosition: [0, 0, 0],
      currentPosition: [0, 0, 0],
      isValid: true,
    });

    clearSnapGuides();
    dragStartRef.current = null;
  }, [dragState, onProductUpdate, scale, clearSnapGuides]);

  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedProduct: null,
      dragOffset: [0, 0, 0],
      initialPosition: [0, 0, 0],
      currentPosition: [0, 0, 0],
      isValid: true,
    });

    clearSnapGuides();
    dragStartRef.current = null;
  }, [clearSnapGuides]);

  return {
    dragState,
    snapGuides,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  };
};