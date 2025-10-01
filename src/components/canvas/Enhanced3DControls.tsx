import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PlacedProduct, WallSegment } from '@/types/floorPlanTypes';
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

export const Enhanced3DControls: React.FC<Enhanced3DControlsProps> = ({
  placedProducts,
  wallSegments,
  scale,
  onProductUpdate,
  onProductSelect,
  selectedProductId
}) => {
  const { camera, raycaster, pointer } = useThree();
  const [isPointerDown, setIsPointerDown] = useState(false);
  
  const {
    dragState,
    snapGuides,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag
  } = useEnhanced3DDragging(wallSegments, placedProducts, scale, onProductUpdate);

  const handlePointerDown = useCallback((event: any) => {
    setIsPointerDown(true);
    
    // Improved raycasting with better scene traversal
    raycaster.setFromCamera(pointer, camera);
    
    // Get the entire scene for intersection testing
    const scene = camera.parent;
    if (!scene) return;
    
    // Filter for actual product meshes by looking for groups with productId
    const productMeshes = scene.children.filter((child: any) => 
      child.userData?.productId && 
      placedProducts.some(p => p.id === child.userData.productId)
    );
    
    const intersections = raycaster.intersectObjects(productMeshes, true);
    
    if (intersections.length > 0) {
      const intersection = intersections[0];
      let productId = intersection.object.userData?.productId;
      
      // If not found on the mesh, check parent hierarchy
      if (!productId) {
        let current = intersection.object.parent;
        while (current && !productId) {
          productId = current.userData?.productId;
          current = current.parent;
        }
      }
      
      if (productId) {
        const product = placedProducts.find(p => p.id === productId);
        if (product) {
          onProductSelect(product.id);
          startDrag(product, [intersection.point.x, intersection.point.y, intersection.point.z] as [number, number, number], event);
          return;
        }
      }
    }
  }, [placedProducts, startDrag, onProductSelect, raycaster, pointer, camera]);

  const handlePointerMove = useCallback((event: any) => {
    if (dragState.isDragging && isPointerDown) {
      // Calculate intersection point for drag update
      raycaster.setFromCamera(pointer, camera);
      
      // Intersect with floor plane
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      
      if (raycaster.ray.intersectPlane(floorPlane, intersectionPoint)) {
        updateDrag(
          [intersectionPoint.x, intersectionPoint.y, intersectionPoint.z] as [number, number, number],
          camera,
          pointer
        );
      }
    }
  }, [dragState.isDragging, isPointerDown, raycaster, camera, pointer, updateDrag]);

  const handlePointerUp = useCallback(() => {
    setIsPointerDown(false);
    
    if (dragState.isDragging) {
      endDrag(); // This hook already calls onProductUpdate internally
    }
  }, [dragState.isDragging, endDrag]);

  // Render snap guides
  const SnapGuides = () => {
    return (
      <group>
        {snapGuides.map((guide, index) => (
          <mesh key={index} position={guide.position}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color={guide.color} transparent opacity={guide.opacity} />
          </mesh>
        ))}
      </group>
    );
  };

  return (
    <group>
      {/* Invisible interaction mesh for handling events */}
      <mesh
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        visible={false}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Snap guides */}
      <SnapGuides />
    </group>
  );
};