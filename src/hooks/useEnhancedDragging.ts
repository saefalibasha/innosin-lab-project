
import { useState, useCallback, useRef } from 'react';
import { Point, PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { EnhancedCollisionDetector, DragValidationResult } from '@/utils/enhancedCollisionDetection';

interface DragState {
  isDragging: boolean;
  draggedProduct: PlacedProduct | null;
  dragOffset: Point;
  currentPosition: Point;
  validationResult: DragValidationResult | null;
}

export const useEnhancedDragging = (
  scale: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedProduct: null,
    dragOffset: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    validationResult: null
  });

  const collisionDetectorRef = useRef<EnhancedCollisionDetector>(
    new EnhancedCollisionDetector(scale, canvasWidth, canvasHeight)
  );

  const startDrag = useCallback((
    product: PlacedProduct,
    mousePosition: Point
  ) => {
    const offset = {
      x: mousePosition.x - product.position.x,
      y: mousePosition.y - product.position.y
    };

    setDragState({
      isDragging: true,
      draggedProduct: product,
      dragOffset: offset,
      currentPosition: product.position,
      validationResult: null
    });
  }, []);

  const updateDrag = useCallback((
    mousePosition: Point,
    allProducts: PlacedProduct[],
    wallSegments: WallSegment[],
    roomPoints: Point[]
  ) => {
    if (!dragState.isDragging || !dragState.draggedProduct) return;

    const newPosition = {
      x: mousePosition.x - dragState.dragOffset.x,
      y: mousePosition.y - dragState.dragOffset.y
    };

    // Validate the new position
    const validation = collisionDetectorRef.current.validateDragPosition(
      dragState.draggedProduct,
      newPosition,
      allProducts.filter(p => p.id !== dragState.draggedProduct!.id),
      wallSegments,
      roomPoints
    );

    setDragState(prev => ({
      ...prev,
      currentPosition: newPosition,
      validationResult: validation
    }));
  }, [dragState.isDragging, dragState.draggedProduct, dragState.dragOffset]);

  const endDrag = useCallback((): { product: PlacedProduct; finalPosition: Point } | null => {
    if (!dragState.isDragging || !dragState.draggedProduct || !dragState.validationResult) {
      setDragState({
        isDragging: false,
        draggedProduct: null,
        dragOffset: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        validationResult: null
      });
      return null;
    }

    const finalPosition = dragState.validationResult.isValid 
      ? dragState.currentPosition 
      : dragState.validationResult.position;

    const updatedProduct = {
      ...dragState.draggedProduct,
      position: finalPosition
    };

    setDragState({
      isDragging: false,
      draggedProduct: null,
      dragOffset: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      validationResult: null
    });

    return { product: updatedProduct, finalPosition };
  }, [dragState]);

  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedProduct: null,
      dragOffset: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      validationResult: null
    });
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag
  };
};
