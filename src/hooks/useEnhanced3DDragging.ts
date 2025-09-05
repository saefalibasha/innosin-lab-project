import { useState, useRef, useCallback } from 'react';
import { PlacedProduct, Point } from '@/types/floorPlanTypes';
import { useEnhanced3DSnapping } from './useEnhanced3DSnapping';
import { canvasTo3DWorld, worldTo2DCanvas } from '@/utils/coordinateUtils';

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
  onProductUpdate: (productId: string, updates: Partial<PlacedProduct>) => void,
  {
    applyProductSeriesRules = false,
    enableModularConnections = false,
    allowSinkTabletopAttachment = false,
    supportWallMountCabinets = false
  }: {
    applyProductSeriesRules?: boolean;
    enableModularConnections?: boolean;
    allowSinkTabletopAttachment?: boolean;
    supportWallMountCabinets?: boolean;
  } = {}
) => {
  const [dragState, setDragState] = useState<DragState3D>({
    isDragging: false,
    draggedProduct: null,
    dragOffset: [0, 0, 0],
    initialPosition: [0, 0, 0],
    currentPosition: [0, 0, 0],
    isValid: true
  });

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const { snapToPosition, snapGuides, updateSnapGuides, clearSnapGuides } = useEnhanced3DSnapping(
    wallSegments,
    placedProducts.filter(p => p.id !== dragState.draggedProduct?.id),
    scale
  );

  const startDrag = useCallback((
    product: PlacedProduct,
    intersectionPoint: [number, number, number],
    pointerEvent: any
  ) => {
    const productPosition = canvasTo3DWorld(product.position, scale);
    const offset: [number, number, number] = [
      intersectionPoint[0] - productPosition[0],
      intersectionPoint[1] - productPosition[1],
      intersectionPoint[2] - productPosition[2]
    ];

    dragStartRef.current = { x: pointerEvent.clientX, y: pointerEvent.clientY };

    setDragState({
      isDragging: true,
      draggedProduct: product,
      dragOffset: offset,
      initialPosition: productPosition,
      currentPosition: productPosition,
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
      if (!dragStartRef.current) return;

      const deltaX = pointer.x - dragStartRef.current.x;
      const deltaY = pointer.y - dragStartRef.current.y;

      const worldDelta = deltaX * 0.01;
      targetPosition = [
        dragState.initialPosition[0] + worldDelta,
        dragState.initialPosition[1],
        dragState.initialPosition[2]
      ];
    }

    let finalPosition: [number, number, number];
    const snapResult = snapToPosition(
      targetPosition,
      dragState.draggedProduct,
      ['wall', 'product', 'grid']
    );

    if (snapResult.snapped) {
      finalPosition = [snapResult.position[0], snapResult.position[1], snapResult.position[2]];
    } else {
      finalPosition = targetPosition;
    }

    // Apply product series rules
    if (applyProductSeriesRules) {
      if (supportWallMountCabinets && dragState.draggedProduct.category === 'Wall Cabinet') {
        finalPosition[1] = 1.5; // Raise wall cabinets
      }
      if (allowSinkTabletopAttachment && dragState.draggedProduct.name.toLowerCase().includes('sink')) {
        // Logic for sink tabletop
        console.log('Attach sink to surface');
      }
      if (enableModularConnections && dragState.draggedProduct.name.toLowerCase().includes('modular')) {
        console.log('Snapping to nearby modulars');
      }
    }

    setDragState(prev => ({
      ...prev,
      currentPosition: finalPosition,
      isValid: true
    }));

    if (snapResult.snapped) {
      updateSnapGuides(snapResult);
    } else {
      clearSnapGuides();
    }
  }, [dragState, snapToPosition, updateSnapGuides, clearSnapGuides, applyProductSeriesRules, enableModularConnections, allowSinkTabletopAttachment, supportWallMountCabinets]);

  const endDrag = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedProduct) return;

    if (dragState.isValid) {
      const canvasPosition = worldTo2DCanvas(
        dragState.currentPosition[0],
        dragState.currentPosition[2],
        scale
      );

      onProductUpdate(dragState.draggedProduct.id, {
        position: canvasPosition
      });
    }

    setDragState({
      isDragging: false,
      draggedProduct: null,
      dragOffset: [0, 0, 0],
      initialPosition: [0, 0, 0],
      currentPosition: [0, 0, 0],
      isValid: true
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
      isValid: true
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
    cancelDrag
  };
};
