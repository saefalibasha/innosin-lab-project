import React from 'react';
import { Door, WallSegment } from '@/types/floorPlanTypes';
import { calculateDoorTransform } from '@/utils/coordinateUtils';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
  wallSegments?: WallSegment[];
  origin?: { minX: number; minY: number };
  selectedDoorId?: string;
  onDoorClick?: (doorId: string) => void;
}

const DoorModel = ({ 
  door, 
  scale, 
  wallSegments,
  origin,
  selectedDoorId,
  onDoorClick
}: { 
  door: Door; 
  scale: number; 
  wallSegments?: WallSegment[];
  origin?: { minX: number; minY: number };
  selectedDoorId?: string;
  onDoorClick?: (doorId: string) => void;
}) => {
  // Real-world door dimensions (in meters)
  const doorWidth = 0.9; // Standard 900mm door width
  const doorHeight = 2.0; // Standard door height  
  const doorThickness = 0.05; // 5cm thick door - thinner for better wall embedding

  const transform = calculateDoorTransform(door, scale, wallSegments, origin);
  const isSelected = selectedDoorId === door.id;

  if (!transform || !transform.position || !transform.rotation) {
    console.warn('Invalid transform for door:', door);
    return null;
  }

  const { position, rotation } = transform;
  // Ensure rotation is in radians if provided in degrees
  const rotationRad: [number, number, number] = [rotation[0], rotation[1], rotation[2]];

  const handleClick = (e: any) => {
    e.stopPropagation();
    onDoorClick?.(door.id);
  };

  return (
    <group position={position} rotation={rotationRad} onClick={handleClick}>
      {/* Door frame - matches interior wall color */}
      <mesh castShadow receiveShadow position={[0, doorHeight / 2, 0]}>
        <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Door handle */}
      <mesh
        position={[doorWidth * 0.4, doorHeight / 2, doorThickness / 2 + 0.01]}
        castShadow
      >
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial color="#a8a8a8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Selection outline */}
      {isSelected && (
        <mesh position={[0, doorHeight / 2, 0]}>
          <boxGeometry args={[doorWidth + 0.05, doorHeight + 0.05, doorThickness + 0.05]} />
          <meshBasicMaterial color="#3b82f6" wireframe />
        </mesh>
      )}
    </group>
  );
};

export const IsometricDoors: React.FC<IsometricDoorsProps> = ({ 
  doors, 
  scale, 
  wallSegments, 
  origin,
  selectedDoorId,
  onDoorClick
}) => {
  return (
    <group>
      {doors.map((door) => (
        <DoorModel 
          key={door.id} 
          door={door} 
          scale={scale} 
          wallSegments={wallSegments} 
          origin={origin}
          selectedDoorId={selectedDoorId}
          onDoorClick={onDoorClick}
        />
      ))}
    </group>
  );
};
