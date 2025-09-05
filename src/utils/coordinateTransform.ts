import { Point } from '@/types/floorPlanTypes';

// Enhanced coordinate transformation utilities
export const COORDINATE_SCALE = 0.001; // Convert mm to meters

// Convert 2D canvas coordinates to 3D world coordinates
export const canvasTo3D = (
  point: Point, 
  scale: number = 1,
  yPosition: number = 0
): [number, number, number] => {
  return [
    point.x * COORDINATE_SCALE, // X axis (left-right)
    yPosition,                  // Y axis (up-down) 
    point.y * COORDINATE_SCALE  // Z axis (forward-back, canvas Y becomes world Z)
  ];
};

// Convert 3D world coordinates back to 2D canvas coordinates
export const worldTo2DCanvas = (
  x: number, 
  z: number, 
  scale: number = 1
): Point => {
  return {
    x: x / COORDINATE_SCALE,
    y: z / COORDINATE_SCALE
  };
};

// Alias for backward compatibility
export const threeDToCanvas = worldTo2DCanvas;

// Enhanced door positioning calculation
export const calculateDoorTransform = (door: any, scale: number) => {
  if (!door.wallId || !door.position) {
    return { 
      position: [0, 0, 0] as [number, number, number], 
      rotation: [0, 0, 0] as [number, number, number] 
    };
  }

  // Convert door position to 3D world coordinates
  const [x, y, z] = canvasTo3D(door.position, scale);
  
  // Calculate rotation based on wall orientation
  const rotation = door.rotation || 0;
  
  return {
    position: [x, 1.05, z] as [number, number, number], // Position door at half height
    rotation: [0, rotation, 0] as [number, number, number]
  };
};

// Enhanced product positioning for consistent 2D-3D mapping
export const calculateProductTransform = (
  product: any, 
  scale: number
): { position: [number, number, number]; rotation: [number, number, number] } => {
  const [x, y, z] = canvasTo3D(product.position, scale);
  
  return {
    position: [x, 0, z],
    rotation: [0, product.rotation || 0, 0]
  };
};

// Room boundary detection for floor rendering
export const isPointInRoom = (point: Point, roomPoints: Point[]): boolean => {
  if (roomPoints.length < 3) return false;
  
  let inside = false;
  let j = roomPoints.length - 1;
  
  for (let i = 0; i < roomPoints.length; i++) {
    const xi = roomPoints[i].x;
    const yi = roomPoints[i].y;
    const xj = roomPoints[j].x;
    const yj = roomPoints[j].y;
    
    if (((yi > point.y) !== (yj > point.y)) && 
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
    j = i;
  }
  
  return inside;
};

// Calculate room bounds for grid generation
export const calculateRoomBounds = (roomPoints: Point[]) => {
  if (roomPoints.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }
  
  const bounds = roomPoints.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.x),
      maxX: Math.max(acc.maxX, point.x),
      minY: Math.min(acc.minY, point.y),
      maxY: Math.max(acc.maxY, point.y),
    }),
    { 
      minX: roomPoints[0].x, 
      maxX: roomPoints[0].x, 
      minY: roomPoints[0].y, 
      maxY: roomPoints[0].y 
    }
  );
  
  return bounds;
};