import React, { useMemo } from 'react';
import { WallSegment, Room } from '@/types/floorPlanTypes';
import { canvasTo3DWorld } from '@/utils/coordinateUtils';

interface Enhanced3DFloorProps {
  rooms: Room[];
  wallSegments?: WallSegment[];
  scale: number;
  showSnapGrid?: boolean;
  origin?: { minX: number; minY: number };
}

// Generate floor from wall segments automatically
const WallFloor = ({ wallSegments, scale, origin }: {
  wallSegments: WallSegment[];
  scale: number;
  origin?: { minX: number; minY: number };
}) => {
  const floorGeometry = useMemo(() => {
    if (wallSegments.length === 0) return null;

    // Find bounding box of all wall points
    const wallPoints = wallSegments.flatMap(wall => [wall.start, wall.end]);
    
    if (wallPoints.length < 3) return null;

    const minX = Math.min(...wallPoints.map(p => p.x));
    const maxX = Math.max(...wallPoints.map(p => p.x));
    const minY = Math.min(...wallPoints.map(p => p.y));
    const maxY = Math.max(...wallPoints.map(p => p.y));

    // Convert to 3D coordinates
    const corner1 = canvasTo3DWorld({ x: minX, y: minY }, scale);
    const corner2 = canvasTo3DWorld({ x: maxX, y: maxY }, scale);

    const width = Math.abs(corner2[0] - corner1[0]);
    const depth = Math.abs(corner2[2] - corner1[2]);
    const centerX = (corner1[0] + corner2[0]) / 2;
    const centerZ = (corner1[2] + corner2[2]) / 2;

    return {
      width,
      depth,
      position: [centerX, -0.01, centerZ] as [number, number, number]
    };
  }, [wallSegments, scale]);

  if (!floorGeometry) return null;

  return (
    <mesh
      position={floorGeometry.position}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[floorGeometry.width, floorGeometry.depth]} />
      <meshLambertMaterial color="#f5f5f5" />
    </mesh>
  );
};

// Room floor component for explicit rooms
const RoomFloor = ({ room, scale }: { room: Room; scale: number }) => {
  const floorGeometry = useMemo(() => {
    if (!room.points || room.points.length < 3) return null;

    // Convert room points to 3D
    const points3D = room.points.map(point => canvasTo3DWorld(point, scale));
    
    // Calculate room center and bounds
    const centerX = points3D.reduce((sum, p) => sum + p[0], 0) / points3D.length;
    const centerZ = points3D.reduce((sum, p) => sum + p[2], 0) / points3D.length;
    
    const minX = Math.min(...points3D.map(p => p[0]));
    const maxX = Math.max(...points3D.map(p => p[0]));
    const minZ = Math.min(...points3D.map(p => p[2]));
    const maxZ = Math.max(...points3D.map(p => p[2]));
    
    const width = maxX - minX;
    const depth = maxZ - minZ;

    return {
      width,
      depth,
      position: [centerX, -0.01, centerZ] as [number, number, number]
    };
  }, [room.points, scale]);

  if (!floorGeometry) return null;

  return (
    <mesh
      position={floorGeometry.position}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[floorGeometry.width, floorGeometry.depth]} />
      <meshLambertMaterial color="#f0f0f0" />
    </mesh>
  );
};

export const Enhanced3DFloor: React.FC<Enhanced3DFloorProps> = ({
  rooms,
  wallSegments,
  scale,
  showSnapGrid = false,
  origin,
}) => {
  return (
    <group>
      {/* Generate floor from wall segments when no rooms exist */}
      {(!rooms || rooms.length === 0) && wallSegments && wallSegments.length > 0 && (
        <WallFloor wallSegments={wallSegments} scale={scale} origin={origin} />
      )}

      {/* Render explicit room floors */}
      {rooms && rooms.map((room) => (
        <RoomFloor key={room.id} room={room} scale={scale} />
      ))}

      {/* Snap grid overlay */}
      {showSnapGrid && (
        <gridHelper
          args={[50, 50, "#e0e0e0", "#f0f0f0"]}
          position={[0, 0, 0]}
        />
      )}
    </group>
  );
};
