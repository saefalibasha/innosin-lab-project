import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
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
  onSceneReady?: (context: { camera: any; scene: any; gl: any }) => void;
  onProductUpdate: (productId: string, updates: Partial<PlacedProduct>) => void;
  selectedProducts: string[];
  showGrid: boolean;
  origin?: { minX: number; minY: number };
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
  onProductUpdate,
  selectedProducts,
  showGrid,
  origin,
}: IsometricFloorPlanSceneProps) => {
  const groupRef = useRef<Group>(null);

  // Calculate bounds and center for proper alignment
  const sceneBounds = React.useMemo(() => {
    const allPoints: { x: number; z: number }[] = [];

    // Collect wall points
    wallSegments.forEach(wall => {
      allPoints.push(
        { x: wall.start.x * scale / 1000, z: wall.start.y * scale / 1000 },
        { x: wall.end.x * scale / 1000, z: wall.end.y * scale / 1000 }
      );
    });

    // Collect room points
    rooms.forEach(room => {
      room.points.forEach(point => {
        allPoints.push({ x: point.x * scale / 1000, z: point.y * scale / 1000 });
      });
    });

    // Collect product positions
    placedProducts.forEach(product => {
      allPoints.push({ x: product.position.x * scale / 1000, z: product.position.y * scale / 1000 });
    });

    if (allPoints.length === 0) {
      return { centerX: 0, centerZ: 0, minX: 0, minZ: 0, maxX: 0, maxZ: 0 };
    }

    const minX = Math.min(...allPoints.map(p => p.x));
    const maxX = Math.max(...allPoints.map(p => p.x));
    const minZ = Math.min(...allPoints.map(p => p.z));
    const maxZ = Math.max(...allPoints.map(p => p.z));

    return {
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
      minX,
      minZ,
      maxX,
      maxZ
    };
  }, [wallSegments, rooms, placedProducts, scale]);

  const calculatedOrigin = { minX: 0, minY: 0 };

  return (
    <group ref={groupRef} position={[-sceneBounds.centerX, 0, -sceneBounds.centerZ]}>
      {/* Floor */}
      <Enhanced3DFloor rooms={rooms} wallSegments={wallSegments} scale={scale} showSnapGrid={showGrid} origin={calculatedOrigin} />

      {/* Grid if no rooms - centered at origin */}
      {showGrid && rooms.length === 0 && wallSegments.length === 0 && (
        <Grid args={[100, 100]} position={[sceneBounds.centerX, 0, sceneBounds.centerZ]} cellSize={1} cellThickness={0.5} cellColor="#e0e0e0" sectionSize={10} sectionThickness={1} sectionColor="#c0c0c0" fadeDistance={50} fadeStrength={1} />
      )}

      {/* Walls */}
      <IsometricWalls wallSegments={wallSegments} scale={scale} onWallClick={onWallClick} origin={calculatedOrigin} />

      {/* Doors */}
      <IsometricDoors doors={doors} scale={scale} wallSegments={wallSegments} origin={calculatedOrigin} />

      {/* Products */}
      <IsometricProducts placedProducts={placedProducts} scale={scale} onProductClick={onProductClick} selectedProducts={selectedProducts} origin={calculatedOrigin} />

      {/* Interaction and snapping */}
      <Enhanced3DControls
        placedProducts={placedProducts}
        wallSegments={wallSegments}
        scale={scale}
        onProductUpdate={onProductUpdate}
        onProductSelect={(productId) => {
          if (onProductClick) onProductClick(productId);
        }}
        selectedProductId={selectedProducts[0]}
      />

      {/* Drop plane for raycasting - centered */}
      {onSceneClick && (
        <mesh name="floor-drop-plane" position={[sceneBounds.centerX, -0.0001, sceneBounds.centerZ]} rotation={[-Math.PI / 2, 0, 0]} onClick={onSceneClick} visible={true}>
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
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={50} near={0.1} far={1000} />
        <CameraExporter />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 20, 15]} intensity={0.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} />
        <directionalLight position={[-10, 10, -5]} intensity={0.3} />

        {/* Controls */}
        <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={100} enableDamping dampingFactor={0.05} />

        {/* Main scene */}
        <IsometricScene {...props} />
      </Canvas>
    </div>
  );
};

export default IsometricFloorPlanScene;