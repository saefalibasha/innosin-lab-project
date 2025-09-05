import React, { useMemo } from 'react';
import { Shape, ExtrudeGeometry, BufferGeometry } from 'three';
import { Room } from '@/types/floorPlanTypes';
import { canvasTo3D } from '@/utils/coordinateTransform';
import * as THREE from 'three';

interface Enhanced3DFloorProps {
  rooms: Room[];
  scale: number;
  showSnapGrid?: boolean;
}

const FloorWithGrid = ({ room, scale, showSnapGrid }: { 
  room: Room; 
  scale: number;
  showSnapGrid?: boolean;
}) => {
  const { floorGeometry, gridGeometry } = useMemo(() => {
    if (room.points.length < 3) return { floorGeometry: null, gridGeometry: null };

    // Create floor shape
    const shape = new Shape();
    const [firstX, , firstZ] = canvasTo3D(room.points[0]);
    shape.moveTo(firstX, firstZ);

    for (let i = 1; i < room.points.length; i++) {
      const [pointX, , pointZ] = canvasTo3D(room.points[i]);
      shape.lineTo(pointX, pointZ);
    }
    shape.lineTo(firstX, firstZ);

    const extrudeSettings = {
      depth: 0.02,
      bevelEnabled: false,
    };

    const floorGeo = new ExtrudeGeometry(shape, extrudeSettings);
    floorGeo.rotateX(-Math.PI / 2);

    // Create snap grid geometry
    let gridGeo = null;
    if (showSnapGrid) {
      // Calculate room bounds
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      room.points.forEach(point => {
        const [x, , z] = canvasTo3D(point);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      });

      // Create grid lines
      const gridSize = 0.5; // 500mm grid
      const gridLines = [];
      
      // Vertical lines
      for (let x = Math.ceil(minX / gridSize) * gridSize; x <= maxX; x += gridSize) {
        gridLines.push(x, 0.001, minZ, x, 0.001, maxZ);
      }
      
      // Horizontal lines
      for (let z = Math.ceil(minZ / gridSize) * gridSize; z <= maxZ; z += gridSize) {
        gridLines.push(minX, 0.001, z, maxX, 0.001, z);
      }

      gridGeo = new BufferGeometry();
      gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridLines, 3));
    }

    return { floorGeometry: floorGeo, gridGeometry: gridGeo };
  }, [room.points, scale, showSnapGrid]);

  if (!floorGeometry) return null;

  return (
    <group>
      {/* Floor surface - Automatic grey flooring for enclosed rooms */}
      <mesh
        geometry={floorGeometry}
        position={[0, -0.01, 0]}
        receiveShadow
        name="room-floor"
      >
        <meshStandardMaterial
          color="#606060"
          roughness={0.8}
          metalness={0.1}
          transparent={false}
        />
      </mesh>

      {/* Snap grid - Only show when enabled and not inside room boundaries */}
      {gridGeometry && showSnapGrid && (
        <lineSegments geometry={gridGeometry} position={[0, 0.001, 0]}>
          <lineBasicMaterial 
            color="#999999" 
            transparent 
            opacity={0.3}
            linewidth={1}
          />
        </lineSegments>
      )}

      {/* Floor interaction plane for raycasting */}
      <mesh
        position={[0, 0, 0]}
        visible={false}
        name="floor-interaction"
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export const Enhanced3DFloor: React.FC<Enhanced3DFloorProps> = ({ 
  rooms, 
  scale, 
  showSnapGrid = true 
}) => {
  return (
    <group>
      {rooms.map((room) => (
        <FloorWithGrid
          key={room.id}
          room={room}
          scale={scale}
          showSnapGrid={showSnapGrid}
        />
      ))}
    </group>
  );
};