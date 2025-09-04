import React from 'react';
import { Door } from '@/types/floorPlanTypes';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const doorWidth = (door.width || 800) * scale * 0.001;  // mm to meters
  const doorHeight = 2.1; // 2.1 meters standard height
  const doorThickness = 0.1; // meters

  // Match 2D (x, y) to 3D (x, -z)
  const position: [number, number, number] = [
    door.position.x * scale * 0.001, // X stays X
    doorHeight / 2,                  // Y is vertical height center
    -door.position.y * scale * 0.001 // Y in 2D becomes -Z in 3D
  ];

  return (
    <group position={position}>
      {/* Door Frame */}
      <mesh castShadow>
        <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Door Handle */}
      <mesh position={[doorWidth / 2 - 0.1, 1, doorThickness / 2 + 0.01]} castShadow>
        <sphereGeometry args={[0.02]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

export const IsometricDoors: React.FC<IsometricDoorsProps> = ({ doors, scale }) => {
  return (
    <group>
      {doors.map((door) => (
        <DoorModel
          key={door.id}
          door={door}
          scale={scale}
        />
      ))}
    </group>
  );
};
