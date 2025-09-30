
import { useState, useCallback, useRef, useEffect } from 'react';
import { Point, PlacedProduct } from '@/types/floorPlanTypes';
import { useEnhancedCollisionDetection } from './useEnhancedCollisionDetection';

interface DragState {
  isDragging: boolean;
  draggedProduct: PlacedProduct | null;
  dragOffset: Point;
  currentPosition: Point;
  isValid: boolean;
  snapResult?: any;
}

export const useSmoothDragging = (
  wallSegments: any[],
  placedProducts: PlacedProduct[],
  canvasWidth: number,
  canvasHeight: number,
  scale: number
) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedProduct: null,
    dragOffset: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    isValid: true
  });

  const animationFrameRef = useRef<number>();
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });

  const { checkProductCollision, checkFurnitureSnap } = useEnhancedCollisionDetection(
    wallSegments,
    placedProducts,
    canvasWidth,
    canvasHeight,
    scale
  );

  const startDrag = useCallback((product: PlacedProduct, mousePos: Point) => {
    const offset = {
      x: mousePos.x - product.position.x,
      y: mousePos.y - product.position.y
    };

    setDragState({
      isDragging: true,
      draggedProduct: product,
      dragOffset: offset,
      currentPosition: product.position,
      isValid: true
    });

    lastMousePos.current = mousePos;
  }, []);

  const updateDrag = useCallback((mousePos: Point) => {
    if (!dragState.isDragging || !dragState.draggedProduct) return;

    // Calculate target position
    const targetPos = {
      x: mousePos.x - dragState.dragOffset.x,
      y: mousePos.y - dragState.dragOffset.y
    };

    // Check for furniture snapping first (higher priority)
    const snapResult = checkFurnitureSnap(dragState.draggedProduct, targetPos);
    
    let finalPos = targetPos;
    let isValid = true;

    if (snapResult.snapped) {
      // Use snapped position with pixel normalization
      finalPos = {
        x: Math.round(snapResult.position.x),
        y: Math.round(snapResult.position.y)
      };
      
      // Verify the snapped position doesn't cause collisions
      const collisionResult = checkProductCollision(dragState.draggedProduct, finalPos);
      isValid = !collisionResult.hasCollision;
    } else {
      // No snap, check for collisions at target position
      const collisionResult = checkProductCollision(dragState.draggedProduct, targetPos);
      
      if (collisionResult.hasCollision) {
        // Try to find a valid nearby position
        finalPos = findValidNearbyPosition(targetPos, dragState.draggedProduct) || dragState.draggedProduct.position;
        isValid = false;
      }
    }

    setDragState(prev => ({
      ...prev,
      currentPosition: finalPos,
      isValid,
      snapResult: snapResult.snapped ? snapResult : undefined
    }));

    lastMousePos.current = mousePos;
  }, [dragState, checkProductCollision, checkFurnitureSnap]);

  const endDrag = useCallback((): Point | null => {
    if (!dragState.isDragging || !dragState.draggedProduct) return null;

    const finalPosition = dragState.isValid ? dragState.currentPosition : dragState.draggedProduct.position;

    setDragState({
      isDragging: false,
      draggedProduct: null,
      dragOffset: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      isValid: true
    });

    return finalPosition;
  }, [dragState]);

  const findValidNearbyPosition = (
    position: Point,
    product: PlacedProduct
  ): Point | null => {
    // Try positions in a small radius around the target
    const searchRadius = 30;
    const steps = 16;

    for (let radius = 5; radius <= searchRadius; radius += 5) {
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const testPos = {
          x: position.x + Math.cos(angle) * radius,
          y: position.y + Math.sin(angle) * radius
        };

        const testResult = checkProductCollision(product, testPos);
        if (!testResult.hasCollision) {
          return testPos;
        }
      }
    }

    return null;
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag
  };
};
