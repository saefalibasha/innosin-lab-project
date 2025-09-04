import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
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
  onSceneReady?: (params: { camera: any; scene: any; gl: any }) => void;
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
  selectedProducts,
  showGrid,
}: IsometricFloorPlanSceneProps) => {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef} name="scene-root">
      {/* Floor (y = 0) */}
      <IsometricFloor rooms={rooms} scale={scale} />

      {/* Optional grid helper (also at y = 0) */}
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

      {/* Walls (constructed around y=0 plane) */}
      <IsometricWalls wallSegments={wallSegments} scale={scale} onWallClick={onWallClick} />

      {/* Doors */}
      <IsometricDoors doors={doors} scale={scale} />

      {/* Products (placed on y=0 plane) */}
      <IsometricProducts
        placedProducts={placedProducts}
        scale={scale}
        onProductClick={onProductClick}
        selectedProducts={selectedProducts}
      />

      {/* Invisible click-catcher if you still want onSceneClick */}
      {onSceneClick && (
        <mesh position={[0, -0.0001, 0]} onClick={onSceneClick} visible={false} name="floor-drop-plane">
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
};

const IsometricFloorPlanScene: React.FC<IsometricFloorPlanSceneProps> = (props) => {
  const sceneRef = useRef<any>(null);

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        style={{ background: 'transparent' }}
        onCreated={({ camera, scene, gl }) => {
          if (props.onSceneReady) {
            props.onSceneReady({ camera, scene, gl });
          }
        }}
      >
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