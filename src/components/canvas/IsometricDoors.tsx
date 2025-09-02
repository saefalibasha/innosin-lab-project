
import React from 'react';
import { Door } from '@/types/floorPlanTypes';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const position: [number, number, number] = [
    door.position.x * scale * 0.001,
    1.0, // Door height middle
    door.position.y * scale * 0.001
  ];

  const doorWidth = (door.width || 800) * scale * 0.001;

  return (
    <group position={position}>
      {/* Door frame */}
      <mesh castShadow>
        <boxGeometry args={[doorWidth, 2.0, 0.05]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[doorWidth * 0.4, 0, 0.03]} castShadow>
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
