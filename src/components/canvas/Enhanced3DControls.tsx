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
    
    // Manual raycasting for more reliable product detection
    raycaster.setFromCamera(pointer, camera);
    
    // Create array of all 3D objects in the scene to check intersections
    const sceneObjects: THREE.Object3D[] = [];
    camera.parent?.traverse((obj) => {
      if (obj.visible && obj !== camera) {
        sceneObjects.push(obj);
      }
    });
    
    const intersections = raycaster.intersectObjects(sceneObjects, true);
    
    if (intersections.length > 0) {
      const intersection = intersections[0];
      let object = intersection.object;
      
      // Walk up the hierarchy to find the product root
      while (object && !object.userData?.productId) {
        object = object.parent!;
      }
      
      if (object?.userData?.productId) {
        const product = placedProducts.find(p => p.id === object.userData.productId);
        if (product) {
          startDrag(product, [intersection.point.x, intersection.point.y, intersection.point.z] as [number, number, number], event);
          onProductSelect(product.id);
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