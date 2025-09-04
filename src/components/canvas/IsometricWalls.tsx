import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, Vector3, Shape, ExtrudeGeometry } from 'three';
import { WallSegment } from '@/types/floorPlanTypes';
import { canvasTo3D } from '@/utils/coordinateTransform';

interface IsometricWallsProps {
  wallSegments: WallSegment[];
  scale: number;
  onWallClick?: (wallId: string) => void;
}

const Wall = ({ wall, scale, onWallClick }: { 
  wall: WallSegment; 
  scale: number; 
  onWallClick?: (wallId: string) => void;
}) => {
  const wallGeometry = useMemo(() => {
    // Convert to 3D coordinates using unified coordinate system
    const [startX, , startZ] = canvasTo3D(wall.start);
    const [endX, , endZ] = canvasTo3D(wall.end);
    
    const start = new Vector3(startX, 0, startZ);
    const end = new Vector3(endX, 0, endZ);
    
    const direction = new Vector3().subVectors(end, start).normalize();
    const perpendicular = new Vector3(-direction.z, 0, direction.x);
    
    const thickness = (wall.thickness || 100) * 0.01;
    const height = 2.4; // Standard room height in meters
    
    // Create wall shape
    const shape = new Shape();
    const halfThickness = thickness / 2;
    
    const corner1 = start.clone().add(perpendicular.clone().multiplyScalar(halfThickness));
    const corner2 = start.clone().sub(perpendicular.clone().multiplyScalar(halfThickness));
    const corner3 = end.clone().sub(perpendicular.clone().multiplyScalar(halfThickness));
    const corner4 = end.clone().add(perpendicular.clone().multiplyScalar(halfThickness));
    
    shape.moveTo(corner1.x, corner1.z);
    shape.lineTo(corner2.x, corner2.z);
    shape.lineTo(corner3.x, corner3.z);
    shape.lineTo(corner4.x, corner4.z);
    shape.lineTo(corner1.x, corner1.z);
    
    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
    };
    
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);
    
    return geometry;
  }, [wall, scale]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onWallClick?.(wall.id);
  };

  return (
    <mesh 
      geometry={wallGeometry}
      onClick={handleClick}
      castShadow
      receiveShadow
      name="wall"
    >
      <meshLambertMaterial 
        color={wall.type === 'interior' ? '#f5f5f5' : '#e0e0e0'} 
        transparent={false}
      />
    </mesh>
  );
};

export const IsometricWalls: React.FC<IsometricWallsProps> = ({ 
  wallSegments, 
  scale, 
  onWallClick 
}) => {
  return (
    <group>
      {wallSegments.map((wall) => (
        <Wall
          key={wall.id}
          wall={wall}
          scale={scale}
          onWallClick={onWallClick}
        />
      ))}
    </group>
  );
};
