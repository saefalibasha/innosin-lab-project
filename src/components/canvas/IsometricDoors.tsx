import React from 'react';
import { Door } from '@/types/floorPlanTypes';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const doorWidth = (door.width || 800) * scale * 0.001; // mm → meters
  const doorHeight = 2100 * scale * 0.001; // Standard door height
  const doorThickness = 0.1; // meters (realistic thickness)

  // ✅ Flip Y to -Z to match coordinate system used in IsometricWalls
  const position: [number, number, number] = [
    door.position.x * scale * 0.001,
    doorHeight / 2, // vertically center
    -door.position.y * scale * 0.001
  ];

  // ✅ Optional rotation support (if your door has a rotation property)
  const rotationY = (door.rotation || 0) * (Math.PI / 180);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Door frame */}
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
        <DoorModel
          key={door.id}
          door={door}
          scale={scale}
        />
      ))}
    </group>
  );
};
