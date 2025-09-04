import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Door } from '@/types/floorPlanTypes';

interface IsometricDoorsProps {
  doors: Door[];
  scale: number;
}

const DoorModel = ({ door, scale }: { door: Door; scale: number }) => {
  const doorWidth = (door.width || 800) * scale * 0.001;
  const doorHeight = 2100 * scale * 0.001;
  const doorThickness = 0.05;

  const groupRef = useRef<THREE.Group>(null);
  const doorRef = useRef<THREE.Mesh>(null);

  const position: [number, number, number] = [
    door.position.x * scale * 0.001,
    doorHeight / 2,
    door.position.y * scale * 0.001
  ];

  const rotationY = door.facing === 'vertical' ? Math.PI / 2 : 0;

  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.y = rotationY + Math.sin(time * 2) * 0.2; // Swing effect
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      {/* Door frame inside wall thickness */}
      <mesh
        ref={doorRef}
        castShadow
        name="door"
        position={[0, 0, -doorThickness / 2]} // Embedded halfway into wall
      >
        <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Door handle */}
      <mesh position={[doorWidth * 0.4, 0, doorThickness / 2 + 0.01]} castShadow>
        <sphereGeometry args={[0.02]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

export const IsometricDoors: React.FC<IsometricDoorsProps> = ({ doors, scale }) => {
  return (
    <group name="doors">
      {doors.map((door) => (
        <DoorModel key={door.id} door={door} scale={scale} />
      ))}
    </group>
  );
};
