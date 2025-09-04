import React, { useMemo } from 'react';
import { Door } from '@/types/floorPlanTypes';
import * as THREE from 'three';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const width = (door.width || 900) * scale * 0.001; // convert mm to meters
  const height = 2.1; // 2.1m standard door height
  const thickness = 0.05;

  // Convert from 2D (X, Y) to 3D (X, 0, -Y)
  const position: [number, number, number] = [
    door.position.x * scale * 0.001,
    height / 2,
    -door.position.y * scale * 0.001
  ];

  // Rotate around Y-axis (convert degrees to radians)
  const rotationY = THREE.MathUtils.degToRad(door.rotation || 0);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow>
        <boxGeometry args={[width, height, thickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      <mesh position={[width / 3, 0, thickness / 2 + 0.01]}>
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
