import { PlacedProduct } from '@/types/floorPlanTypes';

/**
 * Check if two axis-aligned bounding boxes overlap
 */
function aabbOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

/**
 * Find a non-overlapping position for a new product near the base position
 */
export function findNonOverlappingPosition(
  basePos: { x: number; y: number },
  dimensions: { width: number; length: number },
  existingProducts: PlacedProduct[],
  padding: number = 10
): { x: number; y: number } {
  const maxAttempts = 100;
  const stepX = dimensions.width + padding;
  const stepY = dimensions.length + padding;

  // Try the base position first
  const candidates: { x: number; y: number }[] = [basePos];

  // Generate candidate positions in a spiral pattern
  for (let ring = 1; ring <= 10; ring++) {
    // Right
    for (let i = 0; i < ring; i++) {
      candidates.push({
        x: basePos.x + ring * stepX,
        y: basePos.y + i * stepY,
      });
    }
    // Down
    for (let i = 0; i < ring; i++) {
      candidates.push({
        x: basePos.x + (ring - i) * stepX,
        y: basePos.y + ring * stepY,
      });
    }
    // Left
    for (let i = 0; i < ring; i++) {
      candidates.push({
        x: basePos.x - i * stepX,
        y: basePos.y + (ring - i) * stepY,
      });
    }
    // Up
    for (let i = 0; i < ring; i++) {
      candidates.push({
        x: basePos.x - ring * stepX,
        y: basePos.y - i * stepY,
      });
    }
  }

  // Test each candidate position
  for (let i = 0; i < Math.min(candidates.length, maxAttempts); i++) {
    const candidate = candidates[i];
    let hasOverlap = false;

    for (const existing of existingProducts) {
      const existingBox = {
        x: existing.position.x - existing.dimensions.width / 2,
        y: existing.position.y - existing.dimensions.length / 2,
        width: existing.dimensions.width,
        height: existing.dimensions.length,
      };

      const candidateBox = {
        x: candidate.x - dimensions.width / 2,
        y: candidate.y - dimensions.length / 2,
        width: dimensions.width,
        height: dimensions.length,
      };

      if (aabbOverlap(existingBox, candidateBox)) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) {
      console.debug('[placementUtils] Found non-overlapping position:', {
        attempt: i,
        position: candidate,
        basePosition: basePos,
      });
      return candidate;
    }
  }

  // If all positions are occupied, warn and return base position with an offset
  console.warn('[placementUtils] Could not find non-overlapping position after', maxAttempts, 'attempts');
  return {
    x: basePos.x + dimensions.width + padding,
    y: basePos.y + dimensions.length + padding,
  };
}
