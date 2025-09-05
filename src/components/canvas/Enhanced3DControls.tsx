import React, { useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Point, PlacedProduct } from '@/types/floorPlanTypes';
import { canvasTo3D, threeDToCanvas } from '@/utils/coordinateTransform';
import { use3DSnapping } from '@/hooks/use3DSnapping';
import * as THREE from 'three';

interface Enhanced3DControlsProps {
  placedProducts: PlacedProduct[];
  wallSegments: any[];
  scale: number;
  onProductUpdate: (productId: string, position: Point) => void;
  onProductSelect: (productId: string) => void;
  selectedProducts: string[];
}

const DragGizmo = ({ 
  product, 
  isSelected, 
  onDrag, 
  onSelect 
}: { 
  product: PlacedProduct;
  isSelected: boolean;
  onDrag: (position: Point) => void;
  onSelect: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3>(new THREE.Vector3());
  const { camera, raycaster, scene } = useThree();

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    onSelect();
    
    const intersect = e.intersections[0];
    if (intersect && meshRef.current) {
      const worldPos = intersect.point;
      const meshPos = meshRef.current.position;
      setDragOffset(worldPos.clone().sub(meshPos));
    }
  }, [onSelect]);

  const handlePointerMove = useCallback((e: any) => {
    if (!isDragging || !meshRef.current) return;
    
    // Create a plane at y=0 for floor intersection
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const mouse = new THREE.Vector2();
    
    // Convert screen position to normalized device coordinates
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersectPoint = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
      const newPos = intersectPoint.sub(dragOffset);
      meshRef.current.position.copy(newPos);
      
      // Convert back to 2D coordinates for state update
      const position2D = threeDToCanvas(newPos.x, newPos.z);
      onDrag(position2D);
    }
  }, [isDragging, camera, raycaster, dragOffset, onDrag]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const position3D = canvasTo3D(product.position);

  return (
    <group position={position3D}>
      {/* Invisible interaction sphere */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        visible={false}
      >
        <sphereGeometry args={[0.5]} />
        <meshBasicMaterial />
      </mesh>
      
      {/* Visual gizmo for selected products */}
      {isSelected && (
        <>
          {/* Selection outline */}
          <mesh position={[0, 0.1, 0]}>
            <ringGeometry args={[0.8, 1.0, 16]} />
            <meshBasicMaterial color="#4ecdc4" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          
          {/* Drag handles */}
          <mesh position={[1, 0.1, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ff6b6b" />
          </mesh>
          <mesh position={[-1, 0.1, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ff6b6b" />
          </mesh>
          <mesh position={[0, 0.1, 1]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ff6b6b" />
          </mesh>
          <mesh position={[0, 0.1, -1]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ff6b6b" />
          </mesh>
        </>
      )}
    </group>
  );
};

const SnapGuides = ({ guides }: { guides: any[] }) => {
  return (
    <group>
      {guides.map((guide, index) => (
        <group key={index}>
          {guide.type === 'line' && (
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    guide.position[0], 0, guide.position[2],
                    guide.position[0], 2, guide.position[2]
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={guide.color} linewidth={2} />
            </line>
          )}
          {guide.type === 'point' && (
            <mesh position={guide.position}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color={guide.color} />
            </mesh>
          )}
          {guide.type === 'grid' && (
            <mesh position={guide.position} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.2, 0.3, 8]} />
              <meshBasicMaterial color={guide.color} transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

export const Enhanced3DControls: React.FC<Enhanced3DControlsProps> = ({
  placedProducts,
  wallSegments,
  scale,
  onProductUpdate,
  onProductSelect,
  selectedProducts
}) => {
  const { snapGuides } = use3DSnapping(wallSegments, placedProducts, scale);

  const handleProductDrag = useCallback((productId: string, position: Point) => {
    onProductUpdate(productId, position);
  }, [onProductUpdate]);

  const handleProductSelect = useCallback((productId: string) => {
    onProductSelect(productId);
  }, [onProductSelect]);

  return (
    <group>
      {/* Snap guides */}
      <SnapGuides guides={snapGuides} />
      
      {/* Interactive gizmos for each product */}
      {placedProducts.map((product) => (
        <DragGizmo
          key={product.id}
          product={product}
          isSelected={selectedProducts.includes(product.id)}
          onDrag={(position) => handleProductDrag(product.id, position)}
          onSelect={() => handleProductSelect(product.id)}
        />
      ))}
    </group>
  );
};