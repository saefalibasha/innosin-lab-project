import React, { useMemo } from 'react';
import { Shape, ExtrudeGeometry, Vector2 } from 'three';
import { Room } from '@/types/floorPlanTypes';
import { canvasTo3DWorld } from '@/utils/coordinateUtils';

interface Enhanced3DFloorProps {
  rooms: Room[];
  scale: number;
  showSnapGrid?: boolean;
}

const RoomFloor = ({ room, scale }: { room: Room; scale: number }) => {
  const floorGeometry = useMemo(() => {
    if (room.points.length < 3) return null;

    const shape = new Shape();

    // Convert all points using unified coordinate system with proper scaling
    const [firstX, , firstZ] = canvasTo3DWorld(room.points[0], scale);
    shape.moveTo(firstX, firstZ);

    for (let i = 1; i < room.points.length; i++) {
      const [pointX, , pointZ] = canvasTo3DWorld(room.points[i], scale);
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
        color="#e0e0e0" // Default grey floor color
        transparent={false}
        opacity={1}
      />
    </mesh>
  );
};

// Automatic grey floor detection for closed rooms
const AutoFloor = ({ rooms, scale }: { rooms: Room[]; scale: number }) => {
  const closedRooms = useMemo(() => {
    return rooms.filter(room => {
      if (room.points.length < 3) return false;
      
      // Check if room is closed (first and last points are same or very close)
      const first = room.points[0];
      const last = room.points[room.points.length - 1];
      const distance = Math.sqrt(
        Math.pow(first.x - last.x, 2) + Math.pow(first.y - last.y, 2)
      );
      
      return distance < 50; // Tolerance for closure
    });
  }, [rooms]);

  return (
    <group>
      {closedRooms.map((room) => (
        <RoomFloor
          key={room.id}
          room={room}
          scale={scale}
        />
      ))}
    </group>
  );
};

export const Enhanced3DFloor: React.FC<Enhanced3DFloorProps> = ({ 
  rooms, 
  scale, 
  showSnapGrid = false 
}) => {
  return (
    <group>
      {/* Automatic grey floor for closed rooms */}
      <AutoFloor rooms={rooms} scale={scale} />
      
      {/* Invisible drop plane for product placement */}
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