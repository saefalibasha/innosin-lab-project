import React, { Suspense, useRef, useEffect } from 'react';
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
  origin: { minX: number; minY: number }; // ✅ origin from wall bounds
}

interface ProductModelProps {
  product: PlacedProduct;
  scale: number;
  onProductClick?: (productId: string) => void;
  isSelected: boolean;
  origin: { minX: number; minY: number }; // ✅ used for aligning positions
}

const ProductModel: React.FC<ProductModelProps> = ({
  product,
  scale,
  onProductClick,
  isSelected,
  origin
}) => {
  const meshRef = useRef<Mesh>(null);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onProductClick?.(product.id);
  };

  // ✅ Translate coordinates relative to origin and convert to meters
  const px = (product.position.x - origin.minX) * scale * 0.1 * 0.001;
  const py = (product.position.y - origin.minY) * scale * 0.1 * 0.001;

  const position: [number, number, number] = [px, 0, -py];

  const rotation: [number, number, number] = [
    0,
    product.rotation || 0,
    0
  ];

  const length = product.dimensions.length * scale * 0.1 * 0.001;
  const width = product.dimensions.width * scale * 0.1 * 0.001;
  const height = (product.dimensions.height || 850) * scale * 0.1 * 0.001;
  const halfHeight = height / 2;

  const fallbackGeometry = (
    <mesh
      ref={meshRef}
      position={[position[0], halfHeight, position[2]]}
      rotation={rotation}
      onClick={handleClick}
      castShadow
      name="product"
    >
      <boxGeometry args={[length, height, width]} />
      <meshLambertMaterial
        color={isSelected ? '#ff6b6b' : (product.color || '#8b5cf6')}
        transparent={isSelected}
        opacity={isSelected ? 0.8 : 1}
      />
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(length, height, width)]} />
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
        />
      </Suspense>
    );
  }

  return fallbackGeometry;
};

interface ProductGLTFProps {
  modelPath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onClick: (e: any) => void;
  isSelected: boolean;
}

const ProductGLTF: React.FC<ProductGLTFProps> = ({
  modelPath,
  position,
  rotation,
  onClick,
  isSelected
}) => {
  const groupRef = useRef<Group>(null);
  const gltf = useLoader(GLTFLoader, modelPath);

  useEffect(() => {
    if (gltf && groupRef.current) {
      const box = new Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      gltf.scene.position.sub(center);
      gltf.scene.position.y += size.y / 2;

      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        gltf.scene.scale.setScalar(1 / maxDim);
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
      <primitive object={gltf.scene} castShadow receiveShadow />
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
  selectedProducts,
  origin
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
          origin={origin} // ✅ required for position alignment
        />
      ))}
    </group>
  );
};
