import React, { useMemo } from 'react';
import { Grid } from '@react-three/drei';
import { WallSegment, Room, Point } from '@/types/floorPlanTypes';
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

    // Get the polygon outline from walls - USE EXACT WALL COORDINATES
    const polygon = wallsToPolygon(wallSegments);
    
    if (polygon.length < 3) {
      console.warn('[Enhanced3DFloor] wallsToPolygon returned insufficient points, using fallback');
      // Fallback: create floor from wall extents
      if (wallSegments.length > 0) {
        const xs = wallSegments.flatMap(w => [w.start.x, w.end.x]);
        const ys = wallSegments.flatMap(w => [w.start.y, w.end.y]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        console.debug('[Enhanced3DFloor] Fallback floor bounds (canvas):', { minX, minY, maxX, maxY });
        
        const shape = new THREE.Shape();
        const offsetX = origin?.minX || 0;
        const offsetY = origin?.minY || 0;
        
        const [x1, , z1] = canvasTo3DWorld({x: minX - offsetX, y: -(minY - offsetY)}, scale);
        const [x2, , z2] = canvasTo3DWorld({x: maxX - offsetX, y: -(minY - offsetY)}, scale);
        const [x3, , z3] = canvasTo3DWorld({x: maxX - offsetX, y: -(maxY - offsetY)}, scale);
        const [x4, , z4] = canvasTo3DWorld({x: minX - offsetX, y: -(maxY - offsetY)}, scale);
        
        shape.moveTo(x1, z1);
        shape.lineTo(x2, z2);
        shape.lineTo(x3, z3);
        shape.lineTo(x4, z4);
        shape.closePath();
        return shape;
      }
      
      return null;
    }

    console.debug('[Enhanced3DFloor] Floor polygon from walls:', {
      vertexCount: polygon.length,
      first3Vertices: polygon.slice(0, 3),
      origin
    });

    // Convert wall polygon to 3D coordinates - INVERT by reversing polygon order for correct winding
    const shape = new THREE.Shape();
    const offsetX = origin?.minX || 0;
    const offsetY = origin?.minY || 0;
    
    const vertices3D: [number, number, number][] = [];
    
    // Reverse polygon to invert coordinates/winding order
    const reversedPolygon = [...polygon].reverse();
    
    reversedPolygon.forEach((point, index) => {
      const point3D = canvasTo3DWorld({x: point.x - offsetX, y: -(point.y - offsetY)}, scale);
      vertices3D.push(point3D);
      
      if (index === 0) {
        shape.moveTo(point3D[0], point3D[2]);
      } else {
        shape.lineTo(point3D[0], point3D[2]);
      }
    });
    
    shape.closePath();
    
    console.debug('[Enhanced3DFloor] 3D floor vertices (inverted, origin-aware):', {
      first3: vertices3D.slice(0, 3).map(v => ({ x: v[0], y: v[1], z: v[2] })),
      origin: { offsetX, offsetY }
    });
    
    return shape;
  }, [wallSegments, scale, origin]);

  if (!floorShape) return null;

  return (
    <mesh
      position={[0, -0.02, 0]}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <shapeGeometry args={[floorShape]} />
      <meshStandardMaterial 
        color="#4a4a4a" 
        side={2} 
        polygonOffset={true}
        polygonOffsetFactor={2}
        polygonOffsetUnits={2}
      />
    </mesh>
  );
};

// Room floor component for explicit rooms - use actual polygon shape
const RoomFloor = ({ room, scale, origin }: { room: Room; scale: number; origin?: { minX: number; minY: number } }) => {
  const floorShape = useMemo(() => {
    if (!room.points || room.points.length < 3) return null;

    // Build THREE.Shape from actual room polygon points
    const shape = new THREE.Shape();
    
    // Apply origin offset for coordinate consistency
    const offsetX = origin?.minX || 0;
    const offsetY = origin?.minY || 0;
    
    room.points.forEach((point, index) => {
      const point3D = canvasTo3DWorld({x: point.x - offsetX, y: -(point.y - offsetY)}, scale);
      if (index === 0) {
        shape.moveTo(point3D[0], point3D[2]);
      } else {
        shape.lineTo(point3D[0], point3D[2]);
      }
    });
    
    shape.closePath();
    return shape;
  }, [room.points, scale, origin]);

  if (!floorShape) return null;

  return (
    <mesh
      position={[0, -0.02, 0]}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <shapeGeometry args={[floorShape]} />
      <meshStandardMaterial 
        color={room.color || '#4a4a4a'} 
        side={2}
        polygonOffset={true}
        polygonOffsetFactor={2}
        polygonOffsetUnits={2}
      />
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
  // Calculate floor bounds for grid positioning
  const floorBounds = useMemo(() => {
    const allPoints: Point[] = [];
    
    if (wallSegments && wallSegments.length > 0) {
      const polygon = wallsToPolygon(wallSegments);
      allPoints.push(...polygon);
    }
    
    if (rooms) {
      rooms.forEach(room => allPoints.push(...room.points));
    }
    
    if (allPoints.length === 0) return { centerX: 0, centerZ: 0, sizeX: 100, sizeZ: 100 };
    
    // Convert to 3D with origin offset
    const points3D = allPoints.map(p => canvasTo3DWorld(
      { x: p.x - (origin?.minX || 0), y: p.y - (origin?.minY || 0) },
      scale
    ));
    
    const xs = points3D.map(p => p[0]);
    const zs = points3D.map(p => p[2]);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    
    return {
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
      sizeX: Math.max(100, (maxX - minX) * 1.5),
      sizeZ: Math.max(100, (maxZ - minZ) * 1.5)
    };
  }, [wallSegments, rooms, scale, origin]);

  return (
    <group>
      {/* Generate floor from wall segments when no rooms exist */}
      {(!rooms || rooms.length === 0) && wallSegments && wallSegments.length > 0 && (
        <WallFloor wallSegments={wallSegments} scale={scale} origin={origin} />
      )}

      {/* Render explicit room floors */}
      {rooms && rooms.map((room) => (
        <RoomFloor key={room.id} room={room} scale={scale} origin={origin} />
      ))}

      {/* Snap grid overlay - positioned at floor center */}
      {showSnapGrid && (
        <Grid 
          args={[floorBounds.sizeX, floorBounds.sizeZ]} 
          position={[floorBounds.centerX, 0.001, floorBounds.centerZ]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#e0e0e0" 
          sectionSize={10} 
          sectionThickness={1} 
          sectionColor="#c0c0c0" 
          fadeDistance={50} 
          fadeStrength={1} 
        />
      )}
    </group>
  );
};
