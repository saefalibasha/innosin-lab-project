import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Group } from 'three';
import {
  WallSegment,
  PlacedProduct,
  Door,
  Room,
} from '@/types/floorPlanTypes';

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
  onSceneReady?: (context: { camera: any; scene: any; gl: any }) => void;
  selectedProducts: string[];
  showGrid: boolean;
  origin?: { minX: number; minY: number }; // ✅ optional origin support
}

function CameraExporter() {
  const { camera } = useThree();
  useEffect(() => {
    (window as any).__threeCamera = camera;
    return () => {
      if ((window as any).__threeCamera === camera) {
        delete (window as any).__threeCamera;
      }
    };
  }, [camera]);
  return null;
}

const IsometricScene = ({
  wallSegments,
  placedProducts,
  doors,
  rooms,
  scale,
  onProductClick,
  onWallClick,
  onSceneClick,
  onSceneReady,
  selectedProducts,
  showGrid,
  origin,
}: IsometricFloorPlanSceneProps) => {
  const groupRef = useRef<Group>(null);

  // Remove origin calculation - use direct 1:1 coordinate mapping
  const calculatedOrigin = { minX: 0, minY: 0 };

  return (
    <group ref={groupRef}>
      {/* Floor */}
      <Enhanced3DFloor
        rooms={rooms}
        wallSegments={wallSegments}
        scale={scale}
        showSnapGrid={showGrid}
        origin={calculatedOrigin}
      />

      {/* Grid if no rooms */}
      {showGrid && rooms.length === 0 && (
        <Grid
          args={[100, 100]}
          position={[0, 0, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#e0e0e0"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#c0c0c0"
          fadeDistance={50}
          fadeStrength={1}
        />
      )}

      {/* Walls */}
      <IsometricWalls
        wallSegments={wallSegments}
        scale={scale}
        onWallClick={onWallClick}
        origin={calculatedOrigin}
      />

      {/* Doors */}
      <IsometricDoors doors={doors} scale={scale} origin={calculatedOrigin} />

      {/* Products */}
      <IsometricProducts
        placedProducts={placedProducts}
        scale={scale}
        onProductClick={onProductClick}
        selectedProducts={selectedProducts}
        origin={calculatedOrigin}
      />

      {/* Controls */}
      <Enhanced3DControls
        placedProducts={placedProducts}
        wallSegments={wallSegments}
        scale={scale}
        onProductUpdate={(productId, updates) => {
          console.log('Product update in scene:', productId, updates);
        }}
        onProductSelect={(productId) => {
          if (onProductClick) onProductClick(productId);
        }}
        selectedProductId={selectedProducts[0]}
      />

      {/* Drop plane for raycasting */}
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

const IsometricFloorPlanScene: React.FC<IsometricFloorPlanSceneProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows style={{ background: 'transparent' }}>
        <PerspectiveCamera
          makeDefault
          position={[20, 20, 20]}
          fov={50}
          near={0.1}
          far={1000}
        />
        <CameraExporter />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 20, 15]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <directionalLight position={[-10, 10, -5]} intensity={0.3} />

        {/* Controls */}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={100}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Main scene */}
        <IsometricScene {...props} />
      </Canvas>
    </div>
  );
};

export default IsometricFloorPlanScene;
