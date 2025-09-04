import React from 'react';
import { Door } from '@/types/floorPlanTypes';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const doorWidthMeters = (door.width || 800) * scale * 0.001;
  const doorHeightMeters = 2; // 2 meters tall
  const doorThickness = 0.05; // 5cm

  // Convert 2D (x, y) into 3D (x, z)
  const x = door.position.x * scale * 0.001;
  const z = door.position.y * scale * 0.001;

  // Default position (we will adjust based on rotation later)
  const position: [number, number, number] = [x, doorHeightMeters / 2, z];

  // Rotation based on door facing
  const rotationY = door.facing === 'vertical' ? Math.PI / 2 : 0;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Door panel */}
      <mesh castShadow>
        <boxGeometry args={[doorWidthMeters, doorHeightMeters, doorThickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Handle - add a small bump to door front */}
      <mesh position={[doorWidthMeters / 4, 0, doorThickness / 2 + 0.01]}>
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
        <DoorModel key={door.id} door={door} scale={scale} />
      ))}
    </group>
  );
};
