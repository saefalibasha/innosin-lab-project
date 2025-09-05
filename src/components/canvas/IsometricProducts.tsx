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

  // Position mapped to X/Z plane, Y handled separately - Fixed coordinate mapping
  const position: [number, number, number] = [
    product.position.x * scale * 0.001, // Convert mm to meters
    0,
    product.position.y * scale * 0.001, // Convert mm to meters
  ];

  const rotation: [number, number, number] = [
    0,
    product.rotation || 0,
    0,
  ];

  // Fallback simple box if no GLTF model - Fixed dimensions and selection box
  const productHeight = (product.dimensions.height || 850) * 0.001; // Convert mm to meters
  const productLength = product.dimensions.length * 0.001; // Convert mm to meters  
  const productWidth = product.dimensions.width * 0.001; // Convert mm to meters
  
  const fallbackGeometry = (
    <mesh
      ref={meshRef}
      position={[position[0], productHeight / 2, position[2]]} // Position on floor
      rotation={rotation}
      onClick={handleClick}
      castShadow
      name="product"
    >
      <boxGeometry 
        args={[productLength, productHeight, productWidth]} 
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
              new THREE.BoxGeometry(productLength, productHeight, productWidth)
            ]}
          />
          <lineBasicMaterial color="#ff0000" linewidth={3} />
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
  const [modelBounds, setModelBounds] = React.useState<{ size: Vector3; center: Vector3 } | null>(null);

  const gltf = useLoader(GLTFLoader, modelPath);
  
  React.useEffect(() => {
    if (gltf && groupRef.current) {
      const box = new Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      // Store bounds for accurate selection box
      setModelBounds({ size, center });

      // Center model horizontally but keep on floor
      gltf.scene.position.set(-center.x, -box.min.y, -center.z);

      // Scale model appropriately - maintain realistic proportions
      const targetSize = 1.0; // 1 meter max dimension
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const modelScale = targetSize / maxDim;
        gltf.scene.scale.setScalar(modelScale);
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
      {isSelected && modelBounds && (
        <mesh position={[0, modelBounds.size.y / 2, 0]}>
          <boxGeometry args={[
            modelBounds.size.x * 1.1, 
            modelBounds.size.y * 1.1, 
            modelBounds.size.z * 1.1
          ]} />
          <meshBasicMaterial 
            color="#ff0000" 
            wireframe 
            transparent 
            opacity={0.8}
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
