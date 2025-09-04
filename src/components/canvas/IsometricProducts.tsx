import React, { useMemo } from 'react';
import { Vector3, Shape, ExtrudeGeometry } from 'three';
import { WallSegment } from '@/types/floorPlanTypes';

interface IsometricWallsProps {
  wallSegments: WallSegment[];
  scale: number;
  onWallClick?: (wallId: string) => void;
}

/**
 * NOTE ON UNITS:
 * Your products use: position = [x * scale * 0.1, 0, y * scale * 0.1]
 * To match that, we use the SAME factor everywhere (positions, thickness, height).
 * If your wall data is in millimeters and 1 scene unit ≈ 0.1 of whatever you chose,
 * keep MM2U = scale * 0.1. If you prefer meters, set MM2U = scale * 0.001 and
 * update products to match.
 */
const mmToWorld = (scale: number) => scale * 0.1; // keep consistent with your products

const Wall = ({
  wall,
  scale,
  onWallClick,
}: {
  wall: WallSegment;
  scale: number;
  onWallClick?: (wallId: string) => void;
}) => {
  const wallGeometry = useMemo(() => {
    const U = mmToWorld(scale);

    // Positions on ground plane (X,Z), Y = up
    const start = new Vector3(wall.start.x * U, 0, wall.start.y * U);
    const end = new Vector3(wall.end.x * U, 0, wall.end.y * U);

    // Direction along the wall (in XZ)
    const direction = new Vector3().subVectors(end, start).normalize();
    // Perpendicular to the wall on the ground plane (XZ)
    const perpendicular = new Vector3(-direction.z, 0, direction.x);

    // Thickness & height in the SAME units as positions
    const thicknessMM = wall.thickness ?? 100;   // default 100 mm if missing
    const heightMM = wall.height ?? 2400;        // default 2400 mm if missing

    const thickness = thicknessMM * U;
    const height = heightMM * U;

    // Build a 2D shape in the XZ plane (we'll use x,z as the 2D coords)
    const halfT = thickness / 2;
    const c1 = start.clone().add(perpendicular.clone().multiplyScalar(halfT));
    const c2 = start.clone().sub(perpendicular.clone().multiplyScalar(halfT));
    const c3 = end.clone().sub(perpendicular.clone().multiplyScalar(halfT));
    const c4 = end.clone().add(perpendicular.clone().multiplyScalar(halfT));

    const shape = new Shape();
    shape.moveTo(c1.x, c1.z);
    shape.lineTo(c2.x, c2.z);
    shape.lineTo(c3.x, c3.z);
    shape.lineTo(c4.x, c4.z);
    shape.lineTo(c1.x, c1.z);

    // Extrude along +Z, then rotate so that +Z becomes +Y (height)
    const extrudeSettings = { depth: height, bevelEnabled: false };
    const geometry = new ExtrudeGeometry(shape, extrudeSettings);

    // Rotate the wall so "depth" goes up (Y axis)
    geometry.rotateX(-Math.PI / 2);

    // After rotation, the bottom of the wall sits at Y=0 and rises to Y=height
    // (no translation needed). Return the final geometry.
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
      />
    </mesh>
  );
};

export const IsometricWalls: React.FC<IsometricWallsProps> = ({
  wallSegments,
  scale,
  onWallClick,
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
