import React from 'react';
import { Door } from '@/types/floorPlanTypes';
import { calculateDoorTransform } from '@/utils/coordinateUtils';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
  origin?: { minX: number; minY: number };
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
  // Convert door width from 2D pixels to proper 3D meters
  // Door width in pixels from 2D * 0.08 (px/mm scale) * 0.001 (mm to meters)
  const doorWidth = (door.width || 80) * 0.08 * 0.001; 
  const doorHeight = 2.0; // Standard door height in meters
  const doorThickness = 0.05; // 5cm thick door

  const transform = calculateDoorTransform(door, scale, origin);

  if (!transform || !transform.position || !transform.rotation) {
    console.warn('Invalid transform for door:', door);
    return null;
  }

  const { position, rotation } = transform;

  return (
    <group position={position} rotation={rotation}>
      {/* Door frame */}
      <mesh castShadow position={[0, doorHeight / 2, 0]}>
        <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Door handle */}
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

export const IsometricDoors: React.FC<IsometricDoorsProps> = ({ doors, scale, origin }) => {
  return (
    <group>
      {doors.map((door) => (
        <DoorModel key={door.id} door={door} scale={scale} origin={origin} />
      ))}
    </group>
  );
};
