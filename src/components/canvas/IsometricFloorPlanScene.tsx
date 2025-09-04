import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Group, WebGLRenderer, Scene, PerspectiveCamera as ThreePerspectiveCamera } from 'three';
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
  onSceneReady?: (context: {
    camera: ThreePerspectiveCamera;
    scene: Scene;
    gl: WebGLRenderer;
  }) => void;
}

function SceneReadyCallback({ onSceneReady }: { onSceneReady?: IsometricFloorPlanSceneProps['onSceneReady'] }) {
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady({ camera: camera as ThreePerspectiveCamera, scene, gl });
    }
  }, [onSceneReady, camera, scene, gl]);

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
}: Omit<IsometricFloorPlanSceneProps, 'onSceneReady'>) => {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      <IsometricFloor rooms={rooms} scale={scale} />

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

      <IsometricWalls wallSegments={wallSegments} scale={scale} onWallClick={onWallClick} />

      <IsometricDoors doors={doors} scale={scale} />

      <IsometricProducts
        placedProducts={placedProducts}
        scale={scale}
        onProductClick={onProductClick}
        selectedProducts={selectedProducts}
      />

      {/* Drop target */}
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
        {/* Perspective Camera */}
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={50} near={0.1} far={1000} />

        {/* Expose camera on window (optional) */}
        <CameraExporter />

        {/* Expose scene, gl, camera for drop raycasting */}
        <SceneReadyCallback onSceneReady={props.onSceneReady} />

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

/** Optional camera export to window for debugging */
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
