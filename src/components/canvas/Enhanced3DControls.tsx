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
  const { camera, raycaster, pointer, scene } = useThree();
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
    event.stopPropagation();
    setIsPointerDown(true);
    
    // Raycast from pointer to scene
    raycaster.setFromCamera(pointer, camera);
    
    // Intersect all scene objects recursively
    const intersections = raycaster.intersectObjects(scene.children, true);
    
    if (intersections.length > 0) {
      // Find the FIRST intersection that belongs to a product (has productId in its hierarchy)
      let foundProductId: string | null = null;
      let hit: any = null;
      for (const inter of intersections) {
        let pid = inter.object.userData?.productId as string | undefined;
        let current: any = inter.object.parent;
        while (!pid && current) {
          pid = current.userData?.productId;
          current = current.parent;
        }
        if (pid) {
          foundProductId = pid;
          hit = inter;
          break;
        }
      }
      
      if (foundProductId) {
        const product = placedProducts.find(p => p.id === foundProductId);
        if (product) {
          onProductSelect(product.id);
          // Dragging disabled in 3D view: selection only
          return;
        }
      }
    }
  }, [placedProducts, onProductSelect, raycaster, pointer, camera, scene]);

  const handlePointerMove = useCallback((event: any) => {
    if (dragState.isDragging && isPointerDown) {
      event.stopPropagation();
      
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

  const handlePointerUp = useCallback((event: any) => {
    event.stopPropagation();
    setIsPointerDown(false);
    
    if (dragState.isDragging) {
      endDrag();
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
      {/* Invisible interaction plane to capture pointer events */}
      <mesh 
        onPointerDown={handlePointerDown} 
        onPointerMove={handlePointerMove} 
        onPointerUp={handlePointerUp}
        position={[0, -0.0001, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
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