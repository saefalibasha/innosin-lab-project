import React, { useMemo } from 'react';
import { Door } from '@/types/floorPlanTypes';
import * as THREE from 'three';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const doorWidth = (door.width || 800) * scale * 0.1; // mm to meters
  const doorHeight = 2; // meters
  const doorThickness = 0.05; // meters

  // Position mapped using same coordinate system as IsometricWalls
  const x = door.position.x * scale * 0.1;
  const z = -door.position.y * scale * 0.1;

  // Rotation logic based on facing
  const rotationY = door.facing === 'vertical' ? Math.PI / 2 : 0;

  // Center the door mesh to align flush with wall segment
  const offsetX = door.facing === 'vertical' ? 0 : 0;
  const offsetZ = door.facing === 'vertical' ? 0 : 0;

  // Memoized geometry (optional for performance)
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
    return geo;
  }, [doorWidth]);

  return (
    <group
      position={[x + offsetX, doorHeight / 2, z + offsetZ]}
      rotation={[0, rotationY, 0]}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Handle */}
      <mesh position={[doorWidth / 4, 0, doorThickness / 2 + 0.01]}>
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
