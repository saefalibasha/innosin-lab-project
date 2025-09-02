import React, { useMemo } from 'react';
import { Shape, ExtrudeGeometry } from 'three';
import { Room } from '@/types/floorPlanTypes';

interface IsometricFloorProps {
  rooms: Room[];
  scale: number;
}

const RoomFloor = ({ room, scale }: { room: Room; scale: number }) => {
  const floorGeometry = useMemo(() => {
    if (room.points.length < 3) return null;

    const shape = new Shape();

    // Determine if offset is needed (e.g., local coordinates)
    const isGlobal = room.points.some(p => p.x > 5000 || p.y > 5000);
    const offsetX = isGlobal ? 0 : room.points[0].x;
    const offsetY = isGlobal ? 0 : room.points[0].y;

    // Convert mm to meters and apply scale
    const moveToX = (room.points[0].x - offsetX) * scale * 0.001;
    const moveToZ = (room.points[0].y - offsetY) * scale * 0.001;

    shape.moveTo(moveToX, moveToZ);

    for (let i = 1; i < room.points.length; i++) {
      const point = room.points[i];
      shape.lineTo(
        (point.x - offsetX) * scale * 0.001,
        (point.y - offsetY) * scale * 0.001
      );
    }

    // Close the shape
    shape.lineTo(moveToX, moveToZ);

    const extrudeSettings = {
      depth: 0.01,
      bevelEnabled: false,
    };

    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);

    return geometry;
  }, [room.points, scale]);

  if (!floorGeometry) return null;

  return (
    <mesh
      geometry={floorGeometry}
      position={[0, -0.005, 0]} // slight offset to avoid z-fighting
      receiveShadow
    >
      <meshLambertMaterial
        color={room.color || '#f0f0f0'}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

export const IsometricFloor: React.FC<IsometricFloorProps> = ({ rooms, scale }) => {
  return (
    <group>
      {/* Default fallback floor */}
      {rooms.length === 0 && (
        <mesh position={[0, -0.005, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshLambertMaterial color="#f5f5f5" />
        </mesh>
      )}

      {/* Room floor shapes */}
      {rooms.map((room) => (
        <RoomFloor
          key={room.id}
          room={room}
          scale={scale}
        />
      ))}
    </group>
  );
};
