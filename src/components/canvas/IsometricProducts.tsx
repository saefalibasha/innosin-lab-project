import React, { Suspense, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { Box3, Vector3, Group, Mesh } from 'three';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface IsometricProductsProps {
  placedProducts: PlacedProduct[];
  scale: number;
  onProductClick?: (productId: string) => void;
  selectedProducts: string[];
}

const ProductModel = ({ 
  product, 
  scale, 
  onProductClick, 
  isSelected 
}: { 
  product: PlacedProduct; 
  scale: number; 
  onProductClick?: (productId: string) => void;
  isSelected: boolean;
}) => {
  const meshRef = useRef<Mesh>(null); // Fixed: Use Mesh here instead of Group
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onProductClick?.(product.id);
  };

  const position: [number, number, number] = [
    product.position.x * scale * 0.001,
    0,
    product.position.y * scale * 0.001
  ];

  const rotation: [number, number, number] = [
    0,
    product.rotation || 0,
    0
  ];

  const fallbackGeometry = (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      castShadow
    >
      <boxGeometry 
        args={[
          product.dimensions.length * scale * 0.001,
          0.85,
          product.dimensions.width * scale * 0.001
        ]} 
      />
      <meshLambertMaterial 
        color={isSelected ? '#ff6b6b' : (product.color || '#8b5cf6')}
        transparent={isSelected}
        opacity={isSelected ? 0.8 : 1}
      />
      {isSelected && (
        <lineSegments>
          <edgesGeometry 
            args={[
              new THREE.BoxGeometry(
                product.dimensions.length * scale * 0.001,
                0.85,
                product.dimensions.width * scale * 0.001
              )
            ]} 
          />
          <lineBasicMaterial color="#ff0000" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );

  if (product.modelPath) {
    return (
      <Suspense fallback={fallbackGeometry}>
        <ProductGLTF 
          modelPath={product.modelPath}
          position={position}
          rotation={rotation}
          onClick={handleClick}
          isSelected={isSelected}
          scale={scale}
        />
      </Suspense>
    );
  }

  return fallbackGeometry;
};

const ProductGLTF = ({ 
  modelPath, 
  position, 
  rotation, 
  onClick, 
  isSelected,
  scale
}: {
  modelPath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onClick: (e: any) => void;
  isSelected: boolean;
  scale: number;
}) => {
  const groupRef = useRef<Group>(null);

  const gltf = useLoader(GLTFLoader, modelPath);
  
  React.useEffect(() => {
    if (gltf && groupRef.current) {
      const box = new Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      gltf.scene.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const targetScale = 1 / maxDim;
        gltf.scene.scale.setScalar(targetScale);
      }
    }
  }, [gltf]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
    >
      <primitive 
        object={gltf.scene} 
        castShadow
        receiveShadow
      />
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshBasicMaterial 
            color="#ff0000" 
            wireframe 
            transparent 
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};

export const IsometricProducts: React.FC<IsometricProductsProps> = ({ 
  placedProducts, 
  scale, 
  onProductClick, 
  selectedProducts 
}) => {
  return (
    <group>
      {placedProducts.map((product) => (
        <ProductModel
          key={product.id}
          product={product}
          scale={scale}
          onProductClick={onProductClick}
          isSelected={selectedProducts.includes(product.id)}
        />
      ))}
    </group>
  );
};
