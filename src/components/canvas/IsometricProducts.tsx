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
  const meshRef = useRef<Mesh>(null);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onProductClick?.(product.id);
  };

  // Use proper coordinate transformation consistent with walls
  const position: [number, number, number] = [
    product.position.x * scale * 0.1,
    0,
    -product.position.y * scale * 0.1, // Flip Y to -Z
  ];

  const rotation: [number, number, number] = [
    0,
    product.rotation || 0,
    0,
  ];

  // Fallback simple box if no GLTF model
  const fallbackGeometry = (
    <mesh
      ref={meshRef}
      position={[position[0], 0.425, position[2]]} // ✅ lift by half height
      rotation={rotation}
      onClick={handleClick}
      castShadow
      name="product"
    >
      <boxGeometry 
        args={[
          product.dimensions.length * scale * 0.0001, // Consistent scaling
          0.85 * scale * 0.1, // Scale height
          product.dimensions.width * scale * 0.0001, // Consistent scaling
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
                product.dimensions.length * 0.001,
                0.85,
                product.dimensions.width * 0.001
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

      // Center model
      gltf.scene.position.sub(center);

      // ✅ Move bottom of model to Y=0 (floor plane)
      gltf.scene.position.y += size.y / 2;

      // Normalize scale
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
      name="product"
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
