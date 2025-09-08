import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { Box3, Vector3, Group, Mesh } from 'three';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface OriginOffset {
  minX: number;
  minY: number;
}

interface IsometricProductsProps {
  placedProducts: PlacedProduct[];
  scale: number;
  selectedProducts: string[];
  onProductClick?: (productId: string) => void;
  origin: OriginOffset; // ✅ pass same origin used in wall alignment
}

const ProductModel = ({
  product,
  scale,
  origin,
  onProductClick,
  isSelected
}: {
  product: PlacedProduct;
  scale: number;
  origin: OriginOffset;
  onProductClick?: (productId: string) => void;
  isSelected: boolean;
}) => {
  const meshRef = useRef<Mesh>(null);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onProductClick?.(product.id);
  };

  // ✅ Corrected position with origin alignment
  const position: [number, number, number] = [
    (product.position.x - origin.minX) * scale * 0.1,
    0,
    -(product.position.y - origin.minY) * scale * 0.1
  ];

  const rotation: [number, number, number] = [
    0,
    product.rotation || 0,
    0
  ];

  const length = product.dimensions.length * scale * 0.1;
  const width = product.dimensions.width * scale * 0.1;
  const height = (product.dimensions.height || 850) * scale * 0.1;
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
          <edgesGeometry
            args={[new THREE.BoxGeometry(length, height, width)]}
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

  useEffect(() => {
    if (gltf && groupRef.current) {
      const box = new Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      gltf.scene.position.sub(center);
      gltf.scene.position.y += size.y / 2;

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
  selectedProducts,
  onProductClick,
  origin
}) => {
  return (
    <group>
      {placedProducts.map((product) => (
        <ProductModel
          key={product.id}
          product={product}
          scale={scale}
          origin={origin}
          onProductClick={onProductClick}
          isSelected={selectedProducts.includes(product.id)}
        />
      ))}
    </group>
  );
};
