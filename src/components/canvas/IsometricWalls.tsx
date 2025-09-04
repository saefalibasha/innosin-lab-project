import React, { useMemo } from 'react';
import { Vector3, Shape, ExtrudeGeometry } from 'three';
import { WallSegment } from '@/types/floorPlanTypes';

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
    // Convert wall start/end into XY plane (matching product coordinates)
    const start = new Vector3(wall.start.x * scale * 0.1, wall.start.y * scale * 0.1, 0);
    const end   = new Vector3(wall.end.x * scale * 0.1, wall.end.y * scale * 0.1, 0);

    const direction = new Vector3().subVectors(end, start).normalize();
    const perpendicular = new Vector3(-direction.y, direction.x, 0);

    const thickness = (wall.thickness || 100) * 0.1; // meters
    const height = 2.4; // Standard room height in meters

    // Wall corners in XY plane
    const halfThickness = thickness / 2;
    const corner1 = start.clone().add(perpendicular.clone().multiplyScalar(halfThickness));
    const corner2 = start.clone().sub(perpendicular.clone().multiplyScalar(halfThickness));
    const corner3 = end.clone().sub(perpendicular.clone().multiplyScalar(halfThickness));
    const corner4 = end.clone().add(perpendicular.clone().multiplyScalar(halfThickness));

    // Build shape in XY
    const shape = new Shape();
    shape.moveTo(corner1.x, corner1.y);
    shape.lineTo(corner2.x, corner2.y);
    shape.lineTo(corner3.x, corner3.y);
    shape.lineTo(corner4.x, corner4.y);
    shape.lineTo(corner1.x, corner1.y);

    // Extrude upward along Z
    const extrudeSettings = {
      depth: height,
      bevelEnabled: false,
    };

    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
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
        color={wall.type === 'interior' ? '#f0f0f0' : '#e8e8e8'} 
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
