import React, { useMemo } from 'react';
import { Shape, ExtrudeGeometry } from 'three';
import { Room } from '@/types/floorPlanTypes';
import { canvasTo3D } from '@/utils/coordinateTransform';

interface IsometricFloorProps {
  rooms: Room[];
  scale: number;
}

const RoomFloor = ({ room, scale }: { room: Room; scale: number }) => {
  const floorGeometry = useMemo(() => {
    if (room.points.length < 3) return null;

    const shape = new Shape();

    // Convert all points using unified coordinate system with scale
    const [firstX, , firstZ] = canvasTo3D(room.points[0], scale);
    shape.moveTo(firstX, firstZ);

    for (let i = 1; i < room.points.length; i++) {
      const [pointX, , pointZ] = canvasTo3D(room.points[i], scale);
      shape.lineTo(pointX, pointZ);
    }

    // Close the shape
    shape.lineTo(firstX, firstZ);

    const extrudeSettings = {
      depth: 0.02, // Make floor slightly thicker
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
        color={room.color || '#f8f8f8'}
        transparent={false}
        opacity={1}
      />
    </mesh>
  );
};

export const IsometricFloor: React.FC<IsometricFloorProps> = ({ rooms, scale }) => {
  return (
    <group>
      {/* Room floor shapes only */}
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
