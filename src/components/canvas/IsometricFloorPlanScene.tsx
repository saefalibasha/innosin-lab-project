// ✅ Updated: IsometricFloorPlanScene now handles product series behavior (Phase 8)

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

  // ✅ Phase 8 Props
  enableModularConnections?: boolean;
  allowSinkTabletopAttachment?: boolean;
  supportWallMountCabinets?: boolean;
  applyProductSeriesRules?: boolean;
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
  selectedProducts,
  showGrid,
  enableModularConnections,
  allowSinkTabletopAttachment,
  supportWallMountCabinets,
  applyProductSeriesRules
}: IsometricFloorPlanSceneProps) => {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef}>
      <Enhanced3DFloor rooms={rooms} scale={scale} showSnapGrid={showGrid} />

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
        applyProductSeriesRules={applyProductSeriesRules} // ✅ NEW
        enableModularConnections={enableModularConnections} // ✅ NEW
        allowSinkTabletopAttachment={allowSinkTabletopAttachment} // ✅ NEW
        supportWallMountCabinets={supportWallMountCabinets} // ✅ NEW
      />

      <Enhanced3DControls
        placedProducts={placedProducts}
        wallSegments={wallSegments}
        scale={scale}
        onProductUpdate={(productId, updates) => {
          console.log('Product update:', productId, updates);
        }}
        onProductSelect={(productId) => {
          if (onProductClick) onProductClick(productId);
        }}
        selectedProductId={selectedProducts[0]}
        applyProductSeriesRules={applyProductSeriesRules} // ✅ NEW
      />

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
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={50} near={0.1} far={1000} />
        <CameraExporter />

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

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={100}
          enableDamping
          dampingFactor={0.05}
        />

        <IsometricScene {...props} />
      </Canvas>
    </div>
  );
};

export default IsometricFloorPlanScene;
