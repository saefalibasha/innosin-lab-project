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
import { canvasTo3DWorld } from '@/utils/coordinateUtils';

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
  selectedDoorId?: string;
  onDoorClick?: (doorId: string) => void;
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
  selectedDoorId,
  onDoorClick,
}: IsometricFloorPlanSceneProps) => {
  const groupRef = useRef<Group>(null);

  // Calculate bounds and center for proper alignment using consistent coordinate transformation
  const sceneBounds = React.useMemo(() => {
    const allPoints2D: { x: number; y: number }[] = [];

    // Collect wall points
    wallSegments.forEach(wall => {
      allPoints2D.push(wall.start, wall.end);
    });

    // Collect room points
    rooms.forEach(room => {
      room.points.forEach(point => {
        allPoints2D.push(point);
      });
    });

    // DO NOT include placedProducts - keeps scene centering stable while dragging

    if (allPoints2D.length === 0) {
      return { centerX: 0, centerZ: 0, minX: 0, minZ: 0, maxX: 0, maxZ: 0 };
    }

    // Convert all 2D points to 3D world coordinates with origin offset applied
    const ox = origin?.minX || 0;
    const oy = origin?.minY || 0;
    const points3D = allPoints2D.map(p => canvasTo3DWorld({ x: p.x - ox, y: p.y - oy }, scale));
    
    const xs = points3D.map(p => p[0]);
    const zs = points3D.map(p => p[2]);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    
    console.debug('[IsometricFloorPlanScene] Scene bounds (origin-aware):', { 
      minX, maxX, minZ, maxZ, centerX, centerZ,
      origin: { ox, oy }
    });

    return {
      centerX,
      centerZ,
      minX,
      minZ,
      maxX,
      maxZ
    };
  }, [wallSegments, rooms, scale]);

  // Use provided origin or fallback to zero
  const effectiveOrigin = origin || { minX: 0, minY: 0 };

  return (
    <group ref={groupRef} position={[-sceneBounds.centerX, 0, -sceneBounds.centerZ]}>
      {/* Floor */}
      <Enhanced3DFloor rooms={rooms} wallSegments={wallSegments} scale={scale} showSnapGrid={showGrid} origin={effectiveOrigin} />

      {/* Grid if no rooms - centered at origin within the group */}
      {showGrid && rooms.length === 0 && wallSegments.length === 0 && (
        <Grid args={[100, 100]} position={[0, 0, 0]} cellSize={1} cellThickness={0.5} cellColor="#e0e0e0" sectionSize={10} sectionThickness={1} sectionColor="#c0c0c0" fadeDistance={50} fadeStrength={1} />
      )}

      {/* Walls */}
      <IsometricWalls wallSegments={wallSegments} scale={scale} onWallClick={onWallClick} origin={effectiveOrigin} />

      {/* Doors */}
      <IsometricDoors 
        doors={doors} 
        scale={scale} 
        wallSegments={wallSegments} 
        origin={effectiveOrigin}
        selectedDoorId={selectedDoorId}
        onDoorClick={onDoorClick}
      />

      {/* Products */}
      <IsometricProducts placedProducts={placedProducts} scale={scale} onProductClick={onProductClick} selectedProducts={selectedProducts} origin={effectiveOrigin} />

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

      {/* Drop plane for raycasting - centered at origin within the group */}
      {onSceneClick && (
        <mesh name="floor-drop-plane" position={[0, -0.0001, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={onSceneClick} visible={false}>
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
};

const IsometricFloorPlanScene: React.FC<IsometricFloorPlanSceneProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows gl={{ toneMapping: 3, toneMappingExposure: 1.2, outputColorSpace: 'srgb', antialias: true }} style={{ background: 'transparent' }}>
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={50} near={0.1} far={1000} />
        <CameraExporter />

        {/* Enhanced Lighting */}
        <ambientLight intensity={0.7} />
        <hemisphereLight args={['#ffffff', '#8888ff', 0.75]} />
        <directionalLight position={[10, 20, 15]} intensity={0.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} />
        <directionalLight position={[-10, 10, -5]} intensity={0.4} />

        {/* Controls */}
        <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={100} enableDamping dampingFactor={0.05} />

        {/* Main scene */}
        <IsometricScene {...props} />
      </Canvas>
    </div>
  );
};

export default IsometricFloorPlanScene;