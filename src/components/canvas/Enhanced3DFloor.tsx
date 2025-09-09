import React, { useMemo } from 'react';
import { Shape, ExtrudeGeometry } from 'three';
import { Room, Point, WallSegment } from '@/types/floorPlanTypes';
import { canvasTo3DWorld } from '@/utils/coordinateUtils';
import { detectFloorsFromWalls } from '@/utils/floorDetection';

interface Enhanced3DFloorProps {
  rooms: Room[];
  wallSegments?: WallSegment[];
  scale: number;
  showSnapGrid?: boolean;
  origin?: { minX: number; minY: number };
}

const RoomFloor = ({
  room,
  scale,
  origin,
}: {
  room: Room;
  scale: number;
  origin?: { minX: number; minY: number };
}) => {
  const floorGeometry = useMemo(() => {
    if (room.points.length < 3) return null;

    const shift = origin || { minX: 0, minY: 0 };

    const transformPoint = (point: Point) => ({
      x: point.x - shift.minX,
      y: point.y - shift.minY,
    });

    const shape = new Shape();
    const first = transformPoint(room.points[0]);
    const [firstX, , firstZ] = canvasTo3DWorld(first, scale);
    shape.moveTo(firstX, firstZ);

    for (let i = 1; i < room.points.length; i++) {
      const p = transformPoint(room.points[i]);
      const [x, , z] = canvasTo3DWorld(p, scale);
      shape.lineTo(x, z);
    }

    shape.lineTo(firstX, firstZ); // close shape

    const extrudeSettings = {
      depth: 0.02,
      bevelEnabled: false,
    };

    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);

    return geometry;
  }, [room.points, scale, origin]);

  if (!floorGeometry) return null;

  return (
    <mesh
      geometry={floorGeometry}
      position={[0, -0.005, 0]}
      receiveShadow
    >
      <meshLambertMaterial color="#e0e0e0" />
    </mesh>
  );
};

const AutoFloor = ({
  rooms,
  wallSegments,
  scale,
  origin,
}: {
  rooms: Room[];
  wallSegments?: WallSegment[];
  scale: number;
  origin?: { minX: number; minY: number };
}) => {
  const allFloors = useMemo(() => {
    // Combine explicit rooms with auto-detected floors from walls
    const explicitRooms = rooms.filter(room => room.points.length >= 3);
    
    // Auto-detect floors from walls if no explicit rooms
    const autoFloors = explicitRooms.length === 0 && wallSegments 
      ? detectFloorsFromWalls(wallSegments)
      : [];

    return [...explicitRooms, ...autoFloors];
  }, [rooms, wallSegments]);

  return (
    <group>
      {allFloors.map((room) => (
        <RoomFloor
          key={room.id}
          room={room}
          scale={scale}
          origin={origin}
        />
      ))}
    </group>
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
      {/* Auto-filled floor with wall detection */}
      <AutoFloor 
        rooms={rooms} 
        wallSegments={wallSegments}
        scale={scale} 
        origin={origin} 
      />

      {/* Snap plane */}
      <mesh
        position={[0, -0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        name="floor-drop-plane"
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};
