import React, { Suspense, useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { Box3, Vector3, Group, Mesh } from 'three';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { canvasTo3DWorld } from '@/utils/coordinateUtils';

interface IsometricProductsProps {
  placedProducts: PlacedProduct[];
  scale: number;
  onProductClick?: (productId: string) => void;
  selectedProducts: string[];
  origin?: { minX: number; minY: number }; // ✅ Optional origin shift
}

const ProductModel = ({
  product,
  scale,
  onProductClick,
  isSelected,
  origin
}: {
  product: PlacedProduct;
  scale: number;
  onProductClick?: (productId: string) => void;
  isSelected: boolean;
  origin?: { minX: number; minY: number };
}) => {
  const meshRef = useRef<Mesh>(null);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onProductClick?.(product.id);
  };

  // Use product's exact 2D coordinates without origin offset
  const productPoint = {
    x: product.position.x,
    y: product.position.y
  };

  console.log('Product position calculation:', {
    productId: product.id,
    originalPosition: product.position,
    finalPosition: productPoint
  });
  
  const [x, y, z] = canvasTo3DWorld(productPoint);
  const position: [number, number, number] = [x, y, z];

  const rotation: [number, number, number] = [
    0,
    product.rotation || 0,
    0
  ];

  // Convert dimensions: 2D uses mm directly, convert to meters for 3D
  // Use the 2D scale factor (0.08 px/mm) to maintain proportions
  const length = product.dimensions.length * 0.001; // mm to meters
  const width = product.dimensions.width * 0.001;   // mm to meters
  const height = (product.dimensions.height || 850) * 0.001; // mm to meters
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

      // Center and place model on floor
      gltf.scene.position.sub(center);
      gltf.scene.position.y += size.y / 2;

      // Normalize size
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
          origin={origin}
        />
      ))}
    </group>
  );
};
