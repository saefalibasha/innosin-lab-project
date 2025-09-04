import React, { useMemo } from 'react';
import { Vector3, Shape, ExtrudeGeometry } from 'three';
import { WallSegment } from '@/types/floorPlanTypes';

interface IsometricWallsProps {
  wallSegments: WallSegment[];
  scale: number; // scaling factor to convert mm → scene units
  onWallClick?: (wallId: string) => void;
}

const Wall = ({ wall, scale, onWallClick }: { 
  wall: WallSegment; 
  scale: number; 
  onWallClick?: (wallId: string) => void;
}) => {
  const wallGeometry = useMemo(() => {
    // Convert mm to scene coords with scale
    const start = new Vector3(wall.start.x / scale, 0, wall.start.y / scale);
    const end = new Vector3(wall.end.x / scale, 0, wall.end.y / scale);

    // Wall direction + perpendicular
    const direction = new Vector3().subVectors(end, start).normalize();
    const perpendicular = new Vector3(-direction.z, 0, direction.x);

    const thickness = (wall.thickness ?? 200) / scale; // default 200mm thick
    const height = (wall.height ?? 2400) / scale; // default 2.4m high

    // 4 corners of the wall footprint
    const half = thickness / 2;
    const c1 = start.clone().addScaledVector(perpendicular, half);
    const c2 = start.clone().addScaledVector(perpendicular, -half);
    const c3 = end.clone().addScaledVector(perpendicular, -half);
    const c4 = end.clone().addScaledVector(perpendicular, half);

    // Build shape in XZ plane
    const shape = new Shape();
    shape.moveTo(c1.x, c1.z);
    shape.lineTo(c2.x, c2.z);
    shape.lineTo(c3.x, c3.z);
    shape.lineTo(c4.x, c4.z);
    shape.lineTo(c1.x, c1.z);

    const geometry = new ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
    });

    // Rotate so it extrudes upward along Y
    geometry.rotateX(-Math.PI / 2);

    return geometry;
  }, [wall, scale]);

  return (
    <mesh
      geometry={wallGeometry}
      onClick={(e) => {
        e.stopPropagation();
        onWallClick?.(wall.id);
      }}
      castShadow
      receiveShadow
      name="wall"
    >
      <meshLambertMaterial 
        color={wall.type === 'interior' ? '#dddddd' : '#bbbbbb'} 
      />
    </mesh>
  );
};

export const IsometricWalls: React.FC<IsometricWallsProps> = ({ 
  wallSegments, 
  scale, 
  onWallClick 
}) => (
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
