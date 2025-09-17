import React, { Suspense, useRef, useEffect, useMemo } from 'react';
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
  origin?: { minX: number; minY: number }; // optional origin shift
}

const toMeters = (mm?: number) => (mm || 0) * 0.001;
const degToRad = (deg?: number) => ((deg || 0) * Math.PI) / 180;

const ProductModel = ({
  product,
  scale,
  onProductClick,
  isSelected,
  origin,
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

  // Calculate final position and scale with proper dimensions
  const finalPosition = useMemo(() => {
    const basePos = canvasTo3DWorld(product.position, scale);
    // Proper height offset for wall-mounted products (typical wall cabinet height: 150cm)
    const heightOffset = product.mountType === 'wall' ? 1.5 : 0;
    return [basePos[0], basePos[1] + heightOffset, basePos[2]] as [number, number, number];
  }, [product.position, product.mountType, scale]);

  // Convert dimensions to real-world units with accurate product dimensions
  const targetDimensions = useMemo(() => {
    // Use actual product dimensions from the product data
    const width = product.width || 600; // Default 600mm
    const height = product.height || 850; // Default 850mm
    const depth = product.depth || 600; // Default 600mm
    
    return {
      width: width * 0.001, // mm to meters
      height: height * 0.001,
      depth: depth * 0.001
    };
  }, [product.width, product.height, product.depth]);

  const rotationRad = degToRad(product.rotation || 0);
  const rotation: [number, number, number] = [0, rotationRad, 0];

  // Physical size in meters
  const lengthM = targetDimensions.depth;
  const widthM = targetDimensions.width;
  const heightM = targetDimensions.height;
  const halfHeight = heightM / 2;

  const fallbackGeometry = (
    <mesh
      ref={meshRef}
      position={[finalPosition[0], finalPosition[1] + halfHeight, finalPosition[2]]}
      rotation={rotation}
      onClick={handleClick}
      castShadow
      name="product"
      userData={{ productId: product.id }}
    >
      <boxGeometry args={[lengthM, heightM, widthM]} />
      <meshLambertMaterial color={isSelected ? '#ff6b6b' : product.color || '#8b5cf6'} transparent={isSelected} opacity={isSelected ? 0.8 : 1} />
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(lengthM, heightM, widthM)]} />
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
          productId={product.id}
          targetSize={[lengthM, heightM, widthM]}
          position={finalPosition}
          rotation={rotation}
          onClick={handleClick}
          isSelected={isSelected}
        />
      </Suspense>
    );
  }

  return fallbackGeometry;
};

const ProductGLTF = ({
  modelPath,
  productId,
  targetSize,
  position,
  rotation,
  onClick,
  isSelected,
}: {
  modelPath: string;
  productId: string;
  targetSize: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  onClick: (e: any) => void;
  isSelected: boolean;
}) => {
  const groupRef = useRef<Group>(null);
  const gltf = useLoader(GLTFLoader, modelPath);

  useEffect(() => {
    if (!gltf || !groupRef.current) return;

    // Compute current model bounds
    const box = new Box3().setFromObject(gltf.scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    // Center and place model on floor
    gltf.scene.position.sub(center);
    gltf.scene.position.y += size.y / 2;

    // Scale to match target physical dimensions
    const [tx, ty, tz] = targetSize;
    const sx = size.x > 0 ? tx / size.x : 1;
    const sy = size.y > 0 ? ty / size.y : 1;
    const sz = size.z > 0 ? tz / size.z : 1;
    gltf.scene.scale.set(sx, sy, sz);

    // Ensure raycasting recognizes product
    groupRef.current.traverse((child: any) => {
      child.userData = { ...(child.userData || {}), productId };
      if (!child.name) child.name = 'product';
    });
  }, [gltf, productId, targetSize]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} onClick={onClick} name="product" userData={{ productId }}>
      <primitive object={gltf.scene} castShadow receiveShadow />
      {isSelected && (
        <mesh>
          <boxGeometry args={[targetSize[0], targetSize[1], targetSize[2]]} />
          <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.35} />
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
  origin,
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
