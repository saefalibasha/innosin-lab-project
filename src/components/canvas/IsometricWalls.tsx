import React, { useMemo } from 'react';
import { canvasTo3DWorld } from '@/utils/coordinateUtils';
import { WallSegment } from '@/types/floorPlanTypes';

interface IsometricWallsProps {
  wallSegments: WallSegment[];
  scale: number;
  onWallClick?: (wallId: string) => void;
  origin?: { minX: number; minY: number }; // ✅ NEW
}

const Wall = ({
  wall,
  scale,
  onWallClick,
  origin,
}: {
  wall: WallSegment;
  scale: number;
  onWallClick?: (wallId: string) => void;
  origin?: { minX: number; minY: number }; // ✅ NEW
}) => {
  const transform = useMemo(() => {
    // Apply origin offset for coordinate consistency
    const offsetX = origin?.minX || 0;
    const offsetY = origin?.minY || 0;
    
    // Convert 2D canvas points to 3D world (meters) with origin offset
    const start3D = canvasTo3DWorld({ x: wall.start.x - offsetX, y: wall.start.y - offsetY }, scale);
    const end3D = canvasTo3DWorld({ x: wall.end.x - offsetX, y: wall.end.y - offsetY }, scale);
    
    console.debug('[IsometricWalls] Wall 3D transform:', {
      wallId: wall.id,
      start2D: wall.start,
      start3D,
      end3D
    });

    const dx = end3D[0] - start3D[0];
    const dz = end3D[2] - start3D[2];
    const length = Math.sqrt(dx * dx + dz * dz);

    const mid: [number, number, number] = [
      (start3D[0] + end3D[0]) / 2,
      0,
      (start3D[2] + end3D[2]) / 2
    ];

    const thicknessMeters = (wall.thickness ?? 100) * 0.001; // mm -> m
    const heightMeters = (wall.height ?? 2400) * 0.001; // mm -> m
    const rotationY = Math.atan2(dz, dx);

    return { mid, length, thicknessMeters, heightMeters, rotationY };
  }, [wall, scale, origin]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onWallClick?.(wall.id);
  };

  if (wall.visible === false) return null;

  return (
    <mesh
      position={[transform.mid[0], transform.heightMeters / 2, transform.mid[2]]}
      rotation={[0, transform.rotationY, 0]}
      onClick={handleClick}
      castShadow
      receiveShadow
      name="wall"
    >
      <boxGeometry args={[transform.length, transform.heightMeters, transform.thicknessMeters]} />
       <meshLambertMaterial
        color={wall.type === 'interior' ? '#9ca3af' : '#a3a3a3'}
        transparent={false}
      />
    </mesh>
  );
};

export const IsometricWalls: React.FC<IsometricWallsProps> = ({
  wallSegments,
  scale,
  onWallClick,
  origin,
}) => {
  return (
    <group>
      {wallSegments.map((wall) => (
        <Wall
          key={wall.id}
          wall={wall}
          scale={scale}
          onWallClick={onWallClick}
          origin={origin} // ✅ Pass it down
        />
      ))}
    </group>
  );
};
