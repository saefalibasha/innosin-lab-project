import React, { useMemo } from 'react';
import * as THREE from 'three';

interface Enhanced3DGridProps {
  size?: number;
  divisions?: number;
  color?: string;
  visible?: boolean;
  opacity?: number;
}

export const Enhanced3DGrid: React.FC<Enhanced3DGridProps> = ({
  size = 50,
  divisions = 50,
  color = "#cccccc",
  visible = true,
  opacity = 0.2
}) => {
  const gridGeometry = useMemo(() => {
    const gridSize = size;
    const gridDivisions = divisions;
    const step = gridSize / gridDivisions;
    const halfSize = gridSize / 2;

    const vertices = [];

    // Vertical lines
    for (let i = 0; i <= gridDivisions; i++) {
      const x = -halfSize + i * step;
      vertices.push(x, 0, -halfSize);
      vertices.push(x, 0, halfSize);
    }

    // Horizontal lines
    for (let i = 0; i <= gridDivisions; i++) {
      const z = -halfSize + i * step;
      vertices.push(-halfSize, 0, z);
      vertices.push(halfSize, 0, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [size, divisions]);

  if (!visible) return null;

  return (
    <lineSegments geometry={gridGeometry} position={[0, 0.01, 0]}>
      <lineBasicMaterial 
        color={color} 
        transparent 
        opacity={opacity}
        toneMapped={false}
      />
    </lineSegments>
  );
};