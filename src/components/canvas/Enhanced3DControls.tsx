import React, { useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Point, PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
import { canvasTo3D, threeDToCanvas } from '@/utils/coordinateTransform';
import { useEnhanced3DDragging } from '@/hooks/useEnhanced3DDragging';
import * as THREE from 'three';

interface Enhanced3DControlsProps {
  placedProducts: PlacedProduct[];
  wallSegments: WallSegment[];
  scale: number;
  onProductUpdate: (productId: string, updates: Partial<PlacedProduct>) => void;
  onProductSelect: (productId: string) => void;
  selectedProductId?: string;
}

const DragGizmo: React.FC<{
  product: PlacedProduct;
  scale: number;
  onDragStart: (product: PlacedProduct, intersection: [number, number, number], event: any) => void;
  onDragUpdate: (intersection: [number, number, number] | null, camera: any, pointer: { x: number; y: number }) => void;
  onDragEnd: () => void;
  onSelect: () => void;
  isSelected: boolean;
  isDragging: boolean;
}> = ({ product, scale, onDragStart, onDragUpdate, onDragEnd, onSelect, isSelected, isDragging }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const { camera, raycaster, gl } = useThree();

  const handlePointerDown = useCallback((event: any) => {
    event.stopPropagation();
    
    if (!isDragging) {
      // Start new drag operation
      onSelect();
      
      // Calculate intersection point with floor
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      
      // Raycast against floor plane
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(floorPlane, intersection);
      
      if (intersection) {
        onDragStart(product, [intersection.x, intersection.y, intersection.z], event);
        dragStartRef.current = { x: event.clientX, y: event.clientY };
      }
    }
  }, [isDragging, onSelect, onDragStart, product, camera, raycaster, gl.domElement]);

  const handlePointerMove = useCallback((event: any) => {
    if (!isDragging) return;

    // Calculate intersection with floor plane
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    const hasIntersection = raycaster.ray.intersectPlane(floorPlane, intersection);
    
    const intersectionPoint = hasIntersection ? 
      [intersection.x, intersection.y, intersection.z] as [number, number, number] : 
      null;
    
    onDragUpdate(intersectionPoint, camera, { x: event.clientX, y: event.clientY });
  }, [isDragging, onDragUpdate, camera, raycaster, gl.domElement]);

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      onDragEnd();
      dragStartRef.current = null;
    }
  }, [isDragging, onDragEnd]);

  React.useEffect(() => {
    if (isDragging) {
      const canvas = gl.domElement;
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointercancel', handlePointerUp);
      
      return () => {
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointercancel', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp, gl.domElement]);

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
  selectedProductId
}) => {
  const { dragState, snapGuides, startDrag, updateDrag, endDrag } = useEnhanced3DDragging(
    wallSegments,
    placedProducts,
    scale,
    onProductUpdate
  );

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
          scale={scale}
          onDragStart={startDrag}
          onDragUpdate={updateDrag}
          onDragEnd={endDrag}
          onSelect={() => handleProductSelect(product.id)}
          isSelected={product.id === selectedProductId}
          isDragging={dragState.isDragging && dragState.draggedProduct?.id === product.id}
        />
      ))}
    </group>
  );
};