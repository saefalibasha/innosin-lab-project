import React from 'react';
import { Door } from '@/types/floorPlanTypes';
import * as THREE from 'three';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const doorWidth = (door.width || 900) * scale * 0.001; // 900mm default width
  const doorHeight = 2100 * scale * 0.001; // 2.1m standard height
  const doorThickness = 100 * scale * 0.001; // 100mm door depth

  // ✅ Convert 2D (x, y) → 3D (x, y, -z)
  const x = door.position.x * scale * 0.001;
  const y = doorHeight / 2; // Center vertically
  const z = -door.position.y * scale * 0.001;

  const rotation = (door.rotation || 0) * (Math.PI / 180); // Degrees to radians

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]}>
      {/* Door panel */}
      <mesh castShadow>
        <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Door handle */}
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
        <DoorModel key={door.id} door={door} scale={scale} />
      ))}
    </group>
  );
};
