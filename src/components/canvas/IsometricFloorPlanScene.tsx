import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Group } from 'three';
import {
  Point,
  WallSegment,
  PlacedProduct,
  Door,
  Room,
} from '@/types/floorPlanTypes';
import { IsometricWalls } from './IsometricWalls';
import { IsometricProducts } from './IsometricProducts';
import { IsometricFloor } from './IsometricFloor';
import { IsometricDoors } from './IsometricDoors';
import { Button } from '@/components/ui/button'; // ✅ Make sure this path is correct

interface IsometricFloorPlanSceneProps {
  wallSegments: WallSegment[];
  placedProducts: PlacedProduct[];
  doors: Door[];
  rooms: Room[];
  scale: number;
  onProductClick?: (productId: string) => void;
  onWallClick?: (wallId: string) => void;
  selectedProducts: string[];
  showGrid: boolean;
}

const IsometricScene = ({
  wallSegments,
  placedProducts,
  doors,
  rooms,
  scale,
  onProductClick,
  onWallClick,
  selectedProducts,
  showGrid,
}: IsometricFloorPlanSceneProps) => {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      {/* Floor */}
      <IsometricFloor rooms={rooms} scale={scale} />

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
      <IsometricWalls
        wallSegments={wallSegments}
        scale={scale}
        onWallClick={onWallClick}
      />

      {/* Doors */}
      <IsometricDoors doors={doors} scale={scale} />

      {/* Products */}
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
  const handleLogWalls = () => {
    console.log('✅ Wall Segments:', props.wallSegments);
  };

  return (
    <div className="w-full h-full relative">
      {/* ✅ Button positioned in top-right */}
      <Button
        className="absolute top-4 right-4 z-50"
        onClick={handleLogWalls}
      >
        Log Walls
      </Button>

      <Canvas shadows>
        {/* Isometric Camera Setup */}
        <PerspectiveCamera
          makeDefault
          position={[20, 20, 20]}
          fov={50}
          near={0.1}
          far={1000}
        />

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
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={100}
          target={[0, 0, 0]}
        />

        {/* Scene Content */}
        <IsometricScene {...props} />
      </Canvas>
    </div>
  );
};

export default IsometricFloorPlanScene;
