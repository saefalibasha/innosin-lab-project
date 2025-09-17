import React, { useMemo } from 'react';
import { WallSegment, Room } from '@/types/floorPlanTypes';
import { canvasTo3DWorld } from '@/utils/coordinateUtils';
import { wallsToPolygon } from '@/utils/polygonUtils';
import * as THREE from 'three';

interface Enhanced3DFloorProps {
  rooms: Room[];
  wallSegments?: WallSegment[];
  scale: number;
  showSnapGrid?: boolean;
  origin?: { minX: number; minY: number };
}

// Generate floor from wall segments automatically using actual wall polygon
const WallFloor = ({ wallSegments, scale, origin }: {
  wallSegments: WallSegment[];
  scale: number;
  origin?: { minX: number; minY: number };
}) => {
  const floorShape = useMemo(() => {
    if (wallSegments.length === 0) return null;

    // Get the polygon outline from walls
    const polygon = wallsToPolygon(wallSegments);
    if (polygon.length < 3) {
      // Enhanced fallback: create floor from wall extents
      if (wallSegments.length > 0) {
        const xs = wallSegments.flatMap(w => [w.start.x, w.end.x]);
        const ys = wallSegments.flatMap(w => [w.start.y, w.end.y]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        const shape = new THREE.Shape();
        const padding = 100; // Reduced padding for better fit
        const [x1, , z1] = canvasTo3DWorld({x: minX - padding, y: minY - padding}, scale);
        const [x2, , z2] = canvasTo3DWorld({x: maxX + padding, y: minY - padding}, scale);
        const [x3, , z3] = canvasTo3DWorld({x: maxX + padding, y: maxY + padding}, scale);
        const [x4, , z4] = canvasTo3DWorld({x: minX - padding, y: maxY + padding}, scale);
        
        shape.moveTo(x1, z1);
        shape.lineTo(x2, z2);
        shape.lineTo(x3, z3);
        shape.lineTo(x4, z4);
        shape.closePath();
        return shape;
      }
      
      // Ultimate fallback: create a basic rectangular floor
      const shape = new THREE.Shape();
      shape.moveTo(-5, -5);
      shape.lineTo(5, -5);
      shape.lineTo(5, 5);
      shape.lineTo(-5, 5);
      shape.closePath();
      return shape;
    }

    // Convert to 3D coordinates and create shape
    const shape = new THREE.Shape();
    
    polygon.forEach((point, index) => {
      const point3D = canvasTo3DWorld(point, scale);
      if (index === 0) {
        shape.moveTo(point3D[0], point3D[2]);
      } else {
        shape.lineTo(point3D[0], point3D[2]);
      }
    });
    
    // Close the shape
    shape.closePath();
    
    return shape;
  }, [wallSegments, scale]);

  if (!floorShape) return null;

  return (
    <mesh
      position={[0, -0.01, 0]}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <shapeGeometry args={[floorShape]} />
      <meshLambertMaterial color="#f5f5f5" />
    </mesh>
  );
};

// Room floor component for explicit rooms
const RoomFloor = ({ room, scale }: { room: Room; scale: number }) => {
  const floorGeometry = useMemo(() => {
    if (!room.points || room.points.length < 3) return null;

    // Convert room points to 3D
    const points3D = room.points.map(point => canvasTo3DWorld(point, scale));
    
    // Calculate room center and bounds
    const centerX = points3D.reduce((sum, p) => sum + p[0], 0) / points3D.length;
    const centerZ = points3D.reduce((sum, p) => sum + p[2], 0) / points3D.length;
    
    const minX = Math.min(...points3D.map(p => p[0]));
    const maxX = Math.max(...points3D.map(p => p[0]));
    const minZ = Math.min(...points3D.map(p => p[2]));
    const maxZ = Math.max(...points3D.map(p => p[2]));
    
    const width = maxX - minX;
    const depth = maxZ - minZ;

    return {
      width,
      depth,
      position: [centerX, -0.01, centerZ] as [number, number, number]
    };
  }, [room.points, scale]);

  if (!floorGeometry) return null;

  return (
    <mesh
      position={floorGeometry.position}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[floorGeometry.width, floorGeometry.depth]} />
      <meshLambertMaterial color="#f0f0f0" />
    </mesh>
  );
};

export const Enhanced3DFloor: React.FC<Enhanced3DFloorProps> = ({
  rooms,
  wallSegments,
  scale,
  showSnapGrid = false,
  origin,
}) => {
  return (
    <group>
      {/* Generate floor from wall segments when no rooms exist */}
      {(!rooms || rooms.length === 0) && wallSegments && wallSegments.length > 0 && (
        <WallFloor wallSegments={wallSegments} scale={scale} origin={origin} />
      )}

      {/* Render explicit room floors */}
      {rooms && rooms.map((room) => (
        <RoomFloor key={room.id} room={room} scale={scale} />
      ))}

      {/* Snap grid overlay */}
      {showSnapGrid && (
        <gridHelper
          args={[50, 50, "#e0e0e0", "#f0f0f0"]}
          position={[0, 0, 0]}
        />
      )}
    </group>
  );
};
