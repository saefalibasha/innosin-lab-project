
import React, { useMemo } from 'react';
import { Shape, ExtrudeGeometry, Vector3 } from 'three';
import { Room } from '@/types/floorPlanTypes';

interface IsometricFloorProps {
  rooms: Room[];
  scale: number;
}

const RoomFloor = ({ room, scale }: { room: Room; scale: number }) => {
  const floorGeometry = useMemo(() => {
    if (room.points.length < 3) return null;
    
    const shape = new Shape();
    const firstPoint = room.points[0];
    
    shape.moveTo(
      firstPoint.x * scale * 0.001,
      firstPoint.y * scale * 0.001
    );
    
    for (let i = 1; i < room.points.length; i++) {
      const point = room.points[i];
      shape.lineTo(
        point.x * scale * 0.001,
        point.y * scale * 0.001
      );
    }
    
    shape.lineTo(
      firstPoint.x * scale * 0.001,
      firstPoint.y * scale * 0.001
    );
    
    const extrudeSettings = {
      depth: 0.01, // Very thin floor
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
      position={[0, -0.005, 0]}
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
      {/* Default floor plane if no rooms */}
      {rooms.length === 0 && (
        <mesh position={[0, -0.005, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshLambertMaterial color="#f5f5f5" />
        </mesh>
      )}
      
      {/* Room floors */}
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
