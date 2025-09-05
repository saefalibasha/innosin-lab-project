import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { Group } from 'three';
import { WallSegment, PlacedProduct, Door, Room } from '@/types/floorPlanTypes';
import { IsometricWalls } from './IsometricWalls';
import { IsometricProducts } from './IsometricProducts';
import { Enhanced3DFloor } from './Enhanced3DFloor';
import { IsometricDoors } from './IsometricDoors';
import { Enhanced3DControls } from './Enhanced3DControls';

interface IsometricFloorPlanSceneProps {
  wallSegments: WallSegment[];
  placedProducts: PlacedProduct[];
  doors: Door[];
  rooms: Room[];
  scale: number;
  onProductClick?: (productId: string) => void;
  onWallClick?: (wallId: string) => void;
  onSceneClick?: (e: any) => void;
  selectedProducts: string[];
  showSnapGrid: boolean;
  onProductUpdate?: (productId: string, updates: Partial<PlacedProduct>) => void;
  onWallUpdate?: (updatedWall: WallSegment) => void;
}

/** Exposes the active R3F camera on window for external raycasting */
function CameraExporter() {
  const { camera, scene, gl } = useThree();
  useEffect(() => {
    (window as any).__threeCamera = camera;
    (window as any).__threeScene = scene;
    (window as any).__threeRenderer = gl;
    return () => {
      if ((window as any).__threeCamera === camera) {
        delete (window as any).__threeCamera;
        delete (window as any).__threeScene;
        delete (window as any).__threeRenderer;
      }
    };
  }, [camera, scene, gl]);
  return null;
}

const IsometricFloorPlanScene: React.FC<IsometricFloorPlanSceneProps> = ({
  wallSegments,
  placedProducts,
  doors,
  rooms,
  scale,
  onProductClick,
  onWallClick,
  onSceneClick,
  selectedProducts,
  showSnapGrid,
  onProductUpdate,
  onWallUpdate,
}) => {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      <CameraExporter />

      {/* Floor with optional snap grid */}
      <Enhanced3DFloor rooms={rooms} scale={scale} showSnapGrid={showSnapGrid} />

      {showSnapGrid && (
        <Grid
          args={[100, 100]}
          position={[0, 0, 0]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#e0e0e0"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#c0c0c0"
          fadeDistance={50}
          fadeStrength={1}
        />
      )}

      {/* Walls */}
      <IsometricWalls wallSegments={wallSegments} scale={scale} onWallClick={onWallClick} />

      {/* Doors */}
      <IsometricDoors doors={doors} scale={scale} />

      {/* Products */}
      <IsometricProducts
        placedProducts={placedProducts}
        scale={scale}
        onProductClick={onProductClick}
        selectedProducts={selectedProducts}
      />

      {/* 3D Controls for dragging & snapping */}
      <Enhanced3DControls
        placedProducts={placedProducts}
        wallSegments={wallSegments}
        scale={scale}
        onProductUpdate={
          onProductUpdate ||
          ((productId, updates) => {
            console.log('Product update:', productId, updates);
          })
        }
        onWallUpdate={onWallUpdate}
        onProductSelect={(productId) => {
          if (onProductClick) onProductClick(productId);
        }}
        selectedProductId={selectedProducts[0]}
      />

      {/* Drop plane for deselecting / raycasting */}
      {onSceneClick && (
        <mesh
          name="floor-drop-plane"
          position={[0, -0.0001, 0]}
          onClick={onSceneClick}
          visible={true}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
};

export default IsometricFloorPlanScene;
export { IsometricFloorPlanScene };
