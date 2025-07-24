
import { useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation } from '@/types/floorPlanTypes';

export interface FloorPlanState {
  roomPoints: Point[];
  placedProducts: PlacedProduct[];
  doors: Door[];
  textAnnotations: TextAnnotation[];
}

export const useFloorPlanHistory = (initialState: FloorPlanState) => {
  const [history, setHistory] = useState<FloorPlanState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const saveState = useCallback((state: FloorPlanState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(state);
    
    // Limit history to 50 states to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState: history[currentIndex]
  };
};
