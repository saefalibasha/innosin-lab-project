import React from 'react';
import { Door } from '@/types/floorPlanTypes';
import { calculateDoorTransform } from '@/utils/coordinateUtils';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  // Fixed door dimensions - convert mm to meters properly
  const doorWidth = (door.width || 800) * 0.001; // Convert mm to meters directly
  const doorHeight = 2.1; // Standard 2100mm door height in meters
  const doorThickness = 0.08; // Realistic door thickness

  // Use enhanced coordinate transform for accurate positioning
  const { position, rotation } = calculateDoorTransform(door, scale);

  return (
    <group position={position} rotation={rotation}>
      {/* Door frame */}
      <mesh castShadow position={[0, doorHeight / 2, 0]}>
        <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Door handle */}
      <mesh position={[doorWidth * 0.4, doorHeight / 2, doorThickness / 2 + 0.01]} castShadow>
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
