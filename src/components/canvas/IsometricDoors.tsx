import React from 'react';
import { Door } from '@/types/floorPlanTypes';
import { Vector3 } from 'three';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const doorWidth = (door.width || 800) * scale * 0.1; // same scale factor as walls
  const doorHeight = 2.1; // meters
  const doorThickness = 0.05;

  // Convert 2D points to 3D with y → -z transformation
  const start = new Vector3(door.start.x * scale * 0.1, 0, -door.start.y * scale * 0.1);
  const end = new Vector3(door.end.x * scale * 0.1, 0, -door.end.y * scale * 0.1);

  const midPoint = new Vector3().addVectors(start, end).multiplyScalar(0.5);
  const direction = new Vector3().subVectors(end, start).normalize();
  const angle = Math.atan2(direction.x, direction.z); // rotation around y-axis

  return (
    <group position={[midPoint.x, 0, midPoint.z]} rotation={[0, angle, 0]}>
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
        <DoorModel key={door.id} door={door} scale={scale} />
      ))}
    </group>
  );
};
