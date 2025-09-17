import React from 'react';
import { Door, WallSegment } from '@/types/floorPlanTypes';
import { calculateDoorTransform } from '@/utils/coordinateUtils';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
  wallSegments?: WallSegment[];
  origin?: { minX: number; minY: number };
}

const DoorModel = ({ 
  door, 
  scale, 
  wallSegments,
  origin 
}: { 
  door: Door; 
  scale: number; 
  wallSegments?: WallSegment[];
  origin?: { minX: number; minY: number };
}) => {
  // Real-world door dimensions (in meters)
  const doorWidth = 0.9; // Standard 900mm door width
  const doorHeight = 2.0; // Standard door height  
  const doorThickness = 0.05; // 5cm thick door - thinner for better wall embedding

  const transform = calculateDoorTransform(door, scale, wallSegments);

  if (!transform || !transform.position || !transform.rotation) {
    console.warn('Invalid transform for door:', door);
    return null;
  }

  const { position, rotation } = transform;
  // Ensure rotation is in radians if provided in degrees
  const rotationRad: [number, number, number] = [rotation[0], rotation[1], rotation[2]];

  return (
    <group position={position} rotation={rotationRad}>
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

export const IsometricDoors: React.FC<IsometricDoorsProps> = ({ doors, scale, wallSegments, origin }) => {
  return (
    <group>
      {doors.map((door) => (
        <DoorModel key={door.id} door={door} scale={scale} wallSegments={wallSegments} origin={origin} />
      ))}
    </group>
  );
};
