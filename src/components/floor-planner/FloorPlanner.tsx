
import React, { useState, useCallback } from 'react';
import TabbedSidebar from './TabbedSidebar';
import { EnhancedCanvasWorkspace } from '../canvas/EnhancedCanvasWorkspace';
import { PlacedProduct, Point, Door, TextAnnotation, WallSegment, Room } from '@/types/floorPlanTypes';
import { useFloorPlanHistory } from '@/hooks/useFloorPlanHistory';

export const FloorPlanner = () => {
  const initialFloorPlanState = {
    roomPoints: [] as Point[],
    placedProducts: [] as PlacedProduct[],
    doors: [] as Door[],
    textAnnotations: [] as TextAnnotation[],
    wallSegments: [] as WallSegment[],
    rooms: [] as Room[]
  };

  const {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState
  } = useFloorPlanHistory(initialFloorPlanState);

  const [roomPoints, setRoomPoints] = useState<Point[]>(currentState.roomPoints);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>(currentState.placedProducts);
  const [doors, setDoors] = useState<Door[]>(currentState.doors);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>(currentState.textAnnotations);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>(currentState.wallSegments);
  const [rooms, setRooms] = useState<Room[]>(currentState.rooms);

  const handleProductSelect = useCallback((product: PlacedProduct) => {
    setPlacedProducts(prevProducts => [...prevProducts, product]);
  }, []);

  const handleUpdateProduct = useCallback((updatedProduct: PlacedProduct) => {
    setPlacedProducts(prevProducts =>
      prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  }, []);

  const handleDeleteProduct = useCallback((productId: string) => {
    setPlacedProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  }, []);

  // Define scale: 1mm = 0.1 pixels (adjust as needed for your canvas)
  const scale = 0.1; // pixels per mm

  return (
    <div className="h-screen flex">
      <TabbedSidebar 
        onSelectProduct={handleProductSelect}
        scale={scale}
      />
      <div className="flex-1 relative">
        <EnhancedCanvasWorkspace
          placedProducts={placedProducts}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          roomPoints={roomPoints}
          setRoomPoints={setRoomPoints}
          doors={doors}
          setDoors={setDoors}
          textAnnotations={textAnnotations}
          setTextAnnotations={setTextAnnotations}
          wallSegments={wallSegments}
          setWallSegments={setWallSegments}
          rooms={rooms}
          setRooms={setRooms}
          onSaveState={saveState}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      </div>
    </div>
  );
};
