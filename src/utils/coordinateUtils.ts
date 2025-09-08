/**
 * Calculate door position and rotation from wall segment
 * Uses consistent coordinate system with walls and optional origin shift
 */
export function calculateDoorTransform(
  door: any,
  scale: number,
  origin: { minX: number; minY: number } = { minX: 0, minY: 0 }
) {
  // Add null checks to prevent undefined errors
  if (!door || !door.wallStart || !door.wallEnd) {
    console.warn('calculateDoorTransform received invalid door data:', door);
    return {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number]
    };
  }

  const wallStart = {
    x: door.wallStart.x - origin.minX,
    y: door.wallStart.y - origin.minY
  };

  const wallEnd = {
    x: door.wallEnd.x - origin.minX,
    y: door.wallEnd.y - origin.minY
  };

  const wallVector = {
    x: wallEnd.x - wallStart.x,
    y: wallEnd.y - wallStart.y
  };

  const wallLength = Math.sqrt(wallVector.x ** 2 + wallVector.y ** 2);
  
  if (wallLength === 0) {
    console.warn('calculateDoorTransform: wall has zero length');
    return {
      position: canvasTo3DWorld(wallStart, scale),
      rotation: [0, 0, 0] as [number, number, number]
    };
  }

  const normalizedWall = {
    x: wallVector.x / wallLength,
    y: wallVector.y / wallLength
  };

  const wallPosition = typeof door.wallPosition === 'number' ? door.wallPosition : 0.5;
  const doorPosition = {
    x: wallStart.x + normalizedWall.x * wallLength * wallPosition,
    y: wallStart.y + normalizedWall.y * wallLength * wallPosition
  };

  const rotation = Math.atan2(-normalizedWall.y, normalizedWall.x);

  return {
    position: canvasTo3DWorld(doorPosition, scale),
    rotation: [0, rotation, 0] as [number, number, number]
  };
}
