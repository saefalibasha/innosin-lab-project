import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Group } from 'three';
import { Point, WallSegment, PlacedProduct, Door, Room } from '@/types/floorPlanTypes';
import { IsometricWalls } from './IsometricWalls';
import { IsometricProducts } from './IsometricProducts';
import { IsometricFloor } from './IsometricFloor';
import { IsometricDoors } from './IsometricDoors';

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
  showGrid: boolean;
  // ✅ NEW: let parent access camera
  onReady?: (state: { camera: THREE.Camera }) => void;
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
  selectedProducts,
  showGrid
}: IsometricFloorPlanSceneProps) => {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      {/* Floor at y=0 on XZ plane */}
      <IsometricFloor rooms={rooms} scale={scale} />

      {/* Grid on XZ plane, y=0 */}
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

      {/* Walls / Doors / Products */}
      <IsometricWalls wallSegments={wallSegments} scale={scale} onWallClick={onWallClick} />
      <IsometricDoors doors={doors} scale={scale} />
      <IsometricProducts
        placedProducts={placedProducts}
        scale={scale}
        onProductClick={onProductClick}
        selectedProducts={selectedProducts}
      />
    </group>
  );
};

const IsometricFloorPlanScene: React.FC<IsometricFloorPlanSceneProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        style={{ background: 'transparent' }}
        // ✅ hand camera back to parent
        onCreated={(state) => props.onReady?.({ camera: state.camera })}
      >
        {/* Camera (Y-up) */}
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={50} near={0.1} far={1000} />

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
        <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={100} target={[0, 0, 0]} />

        {/* ✅ Click-catcher plane on the ground (XZ), raycastable even if transparent */}
        {props.onSceneClick && (
          <mesh
            position={[0, 0.001, 0]}
            rotation-x={-Math.PI / 2}
            onClick={props.onSceneClick}
            visible={true}
          >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

        {/* Scene */}
        <IsometricScene {...props} />
      </Canvas>
    </div>
  );
};

export default IsometricFloorPlanScene;
