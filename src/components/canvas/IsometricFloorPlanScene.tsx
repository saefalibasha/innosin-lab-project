
import React, { useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Vector3, Euler, Group } from 'three';
import { Point, WallSegment, PlacedProduct, Door, Room } from '@/types/floorPlanTypes';
import { IsometricWalls } from './IsometricWalls';
import { IsometricProducts } from './IsometricProducts';
import { IsometricFloor } from './IsometricFloor';
import { IsometricDoors } from './IsometricDoors';
import { getAllScenePoints, calculateBounds, canvasTo3D, COORDINATE_SCALE } from '@/utils/coordinateTransform';

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
      <IsometricDoors 
        doors={doors} 
        scale={scale}
      />
      
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
  // Calculate optimal camera distance based on scene content
  const cameraDistance = useMemo(() => {
    const allPoints = getAllScenePoints(props.wallSegments, props.rooms, props.placedProducts);
    if (allPoints.length === 0) return 20;

    const bounds = calculateBounds(allPoints);
    const sceneWidth = (bounds.max.x - bounds.min.x) * COORDINATE_SCALE;
    const sceneHeight = (bounds.max.y - bounds.min.y) * COORDINATE_SCALE;
    const maxDimension = Math.max(sceneWidth, sceneHeight);
    
    // Calculate distance to fit the scene in view
    return Math.max(maxDimension * 2, 10);
  }, [props.wallSegments, props.rooms, props.placedProducts]);

  // Calculate scene center for camera positioning
  const sceneCenter = useMemo(() => {
    const allPoints = getAllScenePoints(props.wallSegments, props.rooms, props.placedProducts);
    if (allPoints.length === 0) return [0, 0, 0];

    const bounds = calculateBounds(allPoints);
    const [centerX, , centerZ] = canvasTo3D(bounds.center);
    return [centerX, 0, centerZ];
  }, [props.wallSegments, props.rooms, props.placedProducts]);

  return (
    <div className="w-full h-full">
      <Canvas shadows style={{ background: 'transparent' }}>
        {/* Isometric Camera Setup */}
        <PerspectiveCamera 
          makeDefault
          position={[
            sceneCenter[0] + cameraDistance * 0.7,
            cameraDistance * 0.8,
            sceneCenter[2] + cameraDistance * 0.7
          ]}
          fov={50}
          near={0.1}
          far={1000}
        />
        
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[sceneCenter[0] + 10, 20, sceneCenter[2] + 15]}
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
        <directionalLight
          position={[sceneCenter[0] - 10, 10, sceneCenter[2] - 5]}
          intensity={0.4}
        />
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={cameraDistance * 0.3}
          maxDistance={cameraDistance * 3}
          target={sceneCenter as [number, number, number]}
        />
        
        {/* Click handler for scene */}
        {props.onSceneClick && (
          <mesh 
            position={[0, -0.1, 0]} 
            onClick={props.onSceneClick}
            visible={false}
          >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}
        
        {/* Scene Content */}
        <IsometricScene {...props} />
      </Canvas>
    </div>
  );
};

export default IsometricFloorPlanScene;
