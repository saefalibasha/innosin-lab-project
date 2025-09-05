import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Group } from 'three';
import { Point, WallSegment, PlacedProduct, Door, Room } from '@/types/floorPlanTypes';
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
  onSceneReady?: (context: { camera: any; scene: any; gl: any; }) => void;
  selectedProducts: string[];
  showGrid: boolean;
}

/** Exposes the active R3F camera on window for external raycasting */
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
}: IsometricFloorPlanSceneProps) => {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      {/* Enhanced Floor with snap grid */}
      <Enhanced3DFloor rooms={rooms} scale={scale} showSnapGrid={showGrid} />

      {/* Grid */}
      {showGrid && (
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

      {/* Enhanced 3D Controls for direct manipulation */}
      <Enhanced3DControls
        placedProducts={placedProducts}
        wallSegments={wallSegments}
        scale={scale}
        onProductUpdate={(productId, position) => {
          // This will be handled by the parent component
          console.log('Product update:', productId, position);
        }}
        onProductSelect={(productId) => {
          if (onProductClick) onProductClick(productId);
        }}
        selectedProducts={selectedProducts}
      />

      {/* ✅ Drop plane for raycasting */}
      {onSceneClick && (
        <mesh
          name="floor-drop-plane" // ✅ Name used for raycasting
          position={[0, -0.0001, 0]}
          onClick={onSceneClick}
          visible={true} // ✅ Must be visible for raycasting
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
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={50} near={0.1} far={1000} />
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
          minDistance={5}
          maxDistance={100}
          target={[0, 0, 0]}
        />

        {/* Scene */}
        <IsometricScene {...props} />
      </Canvas>
    </div>
  );
};

export default IsometricFloorPlanScene;
