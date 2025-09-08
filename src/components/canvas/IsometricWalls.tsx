import React, { useMemo } from 'react';
import { Vector3, Shape, ExtrudeGeometry } from 'three';
import { WallSegment } from '@/types/floorPlanTypes';

interface IsometricWallsProps {
  wallSegments: WallSegment[];
  scale: number;
  onWallClick?: (wallId: string) => void;
  origin: { minX: number; minY: number }; // ✅ NEW
}

const Wall = ({
  wall,
  scale,
  origin,
  onWallClick,
}: {
  wall: WallSegment;
  scale: number;
  origin: { minX: number; minY: number }; // ✅ NEW
  onWallClick?: (wallId: string) => void;
}) => {
  const wallGeometry = useMemo(() => {
    const thickness = (wall.thickness || 100) * scale * 0.001;
    const height = wall.height ?? 2.4;

    // ✅ Adjusted for origin
    const start = new Vector3(
      (wall.start.x - origin.minX) * scale * 0.001,
      0,
      -(wall.start.y - origin.minY) * scale * 0.001
    );
    const end = new Vector3(
      (wall.end.x - origin.minX) * scale * 0.001,
      0,
      -(wall.end.y - origin.minY) * scale * 0.001
    );

    const direction = new Vector3().subVectors(end, start).normalize();
    const perpendicular = new Vector3(-direction.z, 0, direction.x);

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
  }, [wall, scale, origin]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onWallClick?.(wall.id);
  };

  if (wall.visible === false) return null;

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
  origin,
  onWallClick,
}) => {
  return (
    <group>
      {wallSegments.map((wall) => (
        <Wall
          key={wall.id}
          wall={wall}
          scale={scale}
          origin={origin} // ✅ PASS TO CHILD
          onWallClick={onWallClick}
        />
      ))}
    </group>
  );
};
