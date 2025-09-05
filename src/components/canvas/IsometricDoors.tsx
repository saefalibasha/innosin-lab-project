import React from 'react';
import { Door } from '@/types/floorPlanTypes';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const doorWidth = (door.width || 800) * scale * 0.1; // Match wall scaling
  const doorHeight = 2.1; // meters
  const doorThickness = 0.05;

  // Convert 2D to 3D position (flip y → -z)
  const x = door.x * scale * 0.1;
  const z = -door.y * scale * 0.1;
  const rotationY = (door.rotation ?? 0) * (Math.PI / 180); // Convert degrees to radians

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {/* Door frame */}
      <mesh castShadow position={[0, doorHeight / 2, 0]}>
        <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Door handle */}
      <mesh
        castShadow
        position={[doorWidth * 0.4, doorHeight / 2, doorThickness / 2 + 0.01]}
      >
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
