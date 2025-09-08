import React from 'react';
import { Door } from '@/types/floorPlanTypes';
import { calculateDoorTransform } from '@/utils/coordinateUtils';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
  origin?: { minX: number; minY: number }; // ✅ added for consistent positioning
}

const DoorModel = ({
  door,
  scale,
  origin
}: {
  door: Door;
  scale: number;
  origin?: { minX: number; minY: number };
}) => {
  const doorWidth = (door.width || 800) * 0.001;
  const doorHeight = 2.1;
  const doorThickness = 0.05;

  const transform = calculateDoorTransform?.(door, scale, origin); // ✅ pass origin to transform

  if (!transform || !transform.position || !transform.rotation) {
    console.warn('Invalid transform for door:', door);
    return null;
  }

  const { position, rotation } = transform;

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow position={[0, doorHeight / 2, 0]}>
        <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      <mesh
        position={[doorWidth * 0.4, doorHeight / 2, doorThickness / 2 + 0.01]}
        castShadow
      >
        <sphereGeometry args={[0.02]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

export const IsometricDoors: React.FC<IsometricDoorsProps> = ({
  doors,
  scale,
  origin
}) => {
  return (
    <group>
      {doors.map((door) => (
        <DoorModel key={door.id} door={door} scale={scale} origin={origin} />
      ))}
    </group>
  );
};
