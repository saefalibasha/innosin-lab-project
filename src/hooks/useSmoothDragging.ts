
import { useState, useCallback, useRef, useEffect } from 'react';
import { Point, PlacedProduct } from '@/types/floorPlanTypes';
import { useCollisionDetection, CollisionResult } from './useCollisionDetection';

interface DragState {
  isDragging: boolean;
  draggedProduct: PlacedProduct | null;
  dragOffset: Point;
  currentPosition: Point;
  isValid: boolean;
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
  const velocity = useRef<Point>({ x: 0, y: 0 });

  const { checkProductCollision } = useCollisionDetection(
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
    velocity.current = { x: 0, y: 0 };
  }, []);

  const updateDrag = useCallback((mousePos: Point) => {
    if (!dragState.isDragging || !dragState.draggedProduct) return;

    // Calculate smooth movement with momentum
    const targetPos = {
      x: mousePos.x - dragState.dragOffset.x,
      y: mousePos.y - dragState.dragOffset.y
    };

    // Add smooth interpolation
    const smoothFactor = 0.8;
    const newPos = {
      x: dragState.currentPosition.x + (targetPos.x - dragState.currentPosition.x) * smoothFactor,
      y: dragState.currentPosition.y + (targetPos.y - dragState.currentPosition.y) * smoothFactor
    };

    // Check collision at new position
    const collisionResult = checkProductCollision(dragState.draggedProduct, newPos);
    
    // If collision detected, try to find valid nearby position
    const finalPos = collisionResult.hasCollision ? 
      findValidNearbyPosition(newPos, dragState.draggedProduct, collisionResult) : 
      newPos;

    setDragState(prev => ({
      ...prev,
      currentPosition: finalPos,
      isValid: !collisionResult.hasCollision
    }));

    // Update velocity for momentum
    velocity.current = {
      x: mousePos.x - lastMousePos.current.x,
      y: mousePos.y - lastMousePos.current.y
    };
    lastMousePos.current = mousePos;
  }, [dragState, checkProductCollision]);

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
    product: PlacedProduct,
    collision: CollisionResult
  ): Point => {
    // Try positions in a small radius around the target
    const searchRadius = 20;
    const steps = 8;

    for (let radius = 10; radius <= searchRadius; radius += 5) {
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

    // If no valid position found, return original position
    return product.position;
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
