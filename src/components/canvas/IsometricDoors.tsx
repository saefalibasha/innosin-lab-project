import React from 'react';
import { Door } from '@/types/floorPlanTypes';
import { getWallAngle } from '@/utils/collisionDetection';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const doorWidth = (door.width || 800) * scale * 0.001; // mm to m
  const doorHeight = 2 * scale; // 2 meters
  const doorThickness = 0.05; // in meters

  const posX = door.position.x * scale * 0.001;
  const posZ = door.position.y * scale * 0.001;

  const rotationY = door.facing === 'vertical'
    ? Math.PI / 2
    : 0;

  return (
    <group position={[posX, doorHeight / 2, posZ]} rotation={[0, rotationY, 0]}>
      {/* Door Panel */}
      <mesh castShadow>
        <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Handle */}
      <mesh
        position={[doorWidth / 2 - 0.1, 0, doorThickness / 2 + 0.01]}
        castShadow
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
