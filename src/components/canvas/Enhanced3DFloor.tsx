import React, { useMemo } from 'react';
import { Grid } from '@react-three/drei';
import { WallSegment, Room, Point } from '@/types/floorPlanTypes';
import { canvasTo3DWorld } from '@/utils/coordinateUtils';
import { wallsToPolygon } from '@/utils/polygonUtils';
import * as THREE from 'three';

// Helper: compute average wall thickness in mm
const computeAverageThicknessMm = (wallSegments: WallSegment[]): number => {
  if (wallSegments.length === 0) return 100; // default 100mm
  const sum = wallSegments.reduce((acc, w) => acc + (w.thickness || 100), 0);
  return sum / wallSegments.length;
};

// Helper: check if polygon is axis-aligned (all edges horizontal/vertical)
const isAxisAligned = (polygon: Point[], tolerance = 1): boolean => {
  if (polygon.length < 3) return false;
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    // Must be either horizontal (dy small) or vertical (dx small)
    if (dx > tolerance && dy > tolerance) return false;
  }
  return true;
};

// Helper: inset rectilinear (axis-aligned) polygon by moving each edge inward
const insetRectilinearPolygon = (polygon: Point[], insetPx: number): Point[] => {
  if (polygon.length < 3) return polygon;
  
  const result: Point[] = [];
  const n = polygon.length;
  
  for (let i = 0; i < n; i++) {
    const prev = polygon[(i - 1 + n) % n];
    const curr = polygon[i];
    const next = polygon[(i + 1) % n];
    
    // Determine edge directions (unit vectors)
    const edge1dx = curr.x - prev.x;
    const edge1dy = curr.y - prev.y;
    const edge1len = Math.sqrt(edge1dx * edge1dx + edge1dy * edge1dy);
    const e1ux = edge1len > 0 ? edge1dx / edge1len : 0;
    const e1uy = edge1len > 0 ? edge1dy / edge1len : 0;
    
    const edge2dx = next.x - curr.x;
    const edge2dy = next.y - curr.y;
    const edge2len = Math.sqrt(edge2dx * edge2dx + edge2dy * edge2dy);
    const e2ux = edge2len > 0 ? edge2dx / edge2len : 0;
    const e2uy = edge2len > 0 ? edge2dy / edge2len : 0;
    
    // Perpendicular inward normals (rotate 90° clockwise for inward)
    const n1x = e1uy;
    const n1y = -e1ux;
    const n2x = e2uy;
    const n2y = -e2ux;
    
    // Average normal (bisector direction)
    let nx = n1x + n2x;
    let ny = n1y + n2y;
    const nlen = Math.sqrt(nx * nx + ny * ny);
    if (nlen < 0.001) {
      // Degenerate corner, use one normal
      nx = n1x;
      ny = n1y;
    } else {
      nx /= nlen;
      ny /= nlen;
    }
    
    // Offset distance accounting for corner angle
    const cosAngle = e1ux * e2ux + e1uy * e2uy;
    const offsetDist = Math.abs(cosAngle) > 0.99 ? insetPx : insetPx / Math.sqrt((1 + cosAngle) / 2);
    
    result.push({
      x: curr.x + nx * offsetDist,
      y: curr.y + ny * offsetDist
    });
  }
  
  return result;
};

// Fallback: shrink polygon toward centroid by insetPx
const shrinkPolygonTowardCentroid = (polygon: Point[], insetPx: number): Point[] => {
  if (polygon.length < 3) return polygon;
  const cx = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length;
  const cy = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length;
  return polygon.map(p => {
    const dx = cx - p.x;
    const dy = cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.001) return p; // avoid division by zero
    const ratio = Math.max(0, (dist - insetPx)) / dist;
    return {
      x: cx - dx * ratio,
      y: cy - dy * ratio
    };
  });
};

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

    // Use minimal epsilon (5mm) to prevent z-fighting, not full wall thickness inset
    const epsilonMm = 5;
    const epsilonPx = epsilonMm * scale;
    
    console.debug('[Enhanced3DFloor] Using minimal epsilon:', { epsilonMm, epsilonPx });

    // Get the polygon outline from walls
    const polygon = wallsToPolygon(wallSegments);
    if (polygon.length < 3) {
      console.debug('Floor generation: wallsToPolygon returned insufficient points, using fallback');
      // Enhanced fallback: create floor from wall extents with precise coordinate mapping
      if (wallSegments.length > 0) {
        const xs = wallSegments.flatMap(w => [w.start.x, w.end.x]);
        const ys = wallSegments.flatMap(w => [w.start.y, w.end.y]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        console.debug('[Enhanced3DFloor] Fallback floor bounds:', { minX, minY, maxX, maxY });
        
        const shape = new THREE.Shape();
        // Apply origin offset for coordinate consistency
        const offsetX = origin?.minX || 0;
        const offsetY = origin?.minY || 0;
        // Use minimal epsilon instead of full wall thickness
        const [x1, , z1] = canvasTo3DWorld({x: (minX + epsilonPx) - offsetX, y: (minY + epsilonPx) - offsetY}, scale);
        const [x2, , z2] = canvasTo3DWorld({x: (maxX - epsilonPx) - offsetX, y: (minY + epsilonPx) - offsetY}, scale);
        const [x3, , z3] = canvasTo3DWorld({x: (maxX - epsilonPx) - offsetX, y: (maxY - epsilonPx) - offsetY}, scale);
        const [x4, , z4] = canvasTo3DWorld({x: (minX + epsilonPx) - offsetX, y: (maxY - epsilonPx) - offsetY}, scale);
        
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

    // Apply minimal epsilon to prevent z-fighting
    let insetPolygon: Point[];
    
    if (isAxisAligned(polygon)) {
      console.debug('[Enhanced3DFloor] Using minimal epsilon for axis-aligned polygon');
      insetPolygon = insetRectilinearPolygon(polygon, epsilonPx);
    } else {
      console.debug('[Enhanced3DFloor] Using minimal epsilon for general polygon');
      insetPolygon = shrinkPolygonTowardCentroid(polygon, epsilonPx);
    }
    
    // If epsilon caused collapse, use original polygon
    if (insetPolygon.length < 3) {
      console.warn('[Enhanced3DFloor] Epsilon collapsed polygon, using original');
      insetPolygon = polygon;
    }
    
    console.debug('[Enhanced3DFloor] First 3 floor vertices (2D):', insetPolygon.slice(0, 3));

    // Convert to 3D coordinates and create shape
    const shape = new THREE.Shape();
    
    // Apply origin offset for coordinate consistency
    const offsetX = origin?.minX || 0;
    const offsetY = origin?.minY || 0;
    
    insetPolygon.forEach((point, index) => {
      const point3D = canvasTo3DWorld({x: point.x - offsetX, y: point.y - offsetY}, scale);
      if (index === 0) {
        shape.moveTo(point3D[0], point3D[2]);
      } else {
        shape.lineTo(point3D[0], point3D[2]);
      }
    });
    
    // Close the shape
    shape.closePath();
    
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
      <meshLambertMaterial color="#f5f5f5" side={2} />
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
      const point3D = canvasTo3DWorld({x: point.x - offsetX, y: point.y - offsetY}, scale);
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
      <meshLambertMaterial color={room.color || '#f0f0f0'} side={2} />
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
