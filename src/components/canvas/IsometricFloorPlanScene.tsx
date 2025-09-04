import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Group, Scene, WebGLRenderer, PerspectiveCamera as ThreeCamera } from 'three';
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

  // ✅ New refs for raycasting
  sceneRef?: React.MutableRefObject<Scene | null>;
  cameraRef?: React.MutableRefObject<ThreeCamera | null>;
  rendererRef?: React.MutableRefObject<WebGLRenderer | null>;
}

/** Expose three.js internals via parent refs */
function SceneConnector({
  sceneRef,
  cameraRef,
  rendererRef,
}: {
  sceneRef?: React.MutableRefObject<Scene | null>;
  cameraRef?: React.MutableRefObject<ThreeCamera | null>;
  rendererRef?: React.MutableRefObject<WebGLRenderer | null>;
}) {
  const { scene, camera, gl } = useThree();

  useEffect(() => {
    if (sceneRef) sceneRef.current = scene;
    if (cameraRef) cameraRef.current = camera as ThreeCamera;
    if (rendererRef) rendererRef.current = gl;
  }, [scene, camera, gl, sceneRef, cameraRef, rendererRef]);

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
    <group ref={groupRef}>
      {/* Floor (y = 0) */}
      <IsometricFloor rooms={rooms} scale={scale} />

      {/* Optional grid */}
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

      {/* Click Catcher Plane */}
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
  const { sceneRef, cameraRef, rendererRef } = props;

  return (
    <div className="w-full h-full">
      <Canvas shadows style={{ background: 'transparent' }}>
        {/* Export internal refs */}
        <SceneConnector
          sceneRef={sceneRef}
          cameraRef={cameraRef}
          rendererRef={rendererRef}
        />

        {/* Camera */}
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={50} near={0.1} far={1000} />

        {/* Lights */}
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

        {/* Scene contents */}
        <IsometricScene {...props} />
      </Canvas>
    </div>
  );
};

export default IsometricFloorPlanScene;
