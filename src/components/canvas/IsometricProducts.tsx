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

  // Click handling disabled in 3D view

  // Calculate final position and scale with proper dimensions
  const finalPosition = useMemo(() => {
    // Apply origin offset for coordinate consistency
    const offsetX = origin?.minX || 0;
    const offsetY = origin?.minY || 0;
    
    // CRITICAL: Use product.position directly (already in canvas coordinates)
    const basePos = canvasTo3DWorld({ 
      x: product.position.x - offsetX, 
      y: product.position.y - offsetY 
    }, scale);
    
    // Check if this is a wall-mounted product based on name/category
    const isWallMounted = product.name?.toLowerCase().includes('wall') || 
                         product.category?.toLowerCase().includes('wall');
    
    // Check if product has custom height offset (for worktops)
    let yBase: number;
    if (product.heightOffset !== undefined && product.heightOffset !== null) {
      // Convert height offset from mm to meters
      yBase = product.heightOffset * 0.001;
    } else if (isWallMounted) {
      yBase = 1.5; // Wall-mounted at ~1.5m
    } else {
      yBase = 0.002; // Floor products: slightly above floor to avoid z-fighting
    }
    
    const result = [basePos[0], yBase, basePos[2]] as [number, number, number];
    
    console.debug('[IsometricProducts] Product positioning:', {
      productId: product.id,
      name: product.name,
      storedPosition: product.position,
      offsetApplied: { offsetX, offsetY },
      position3D: result,
      heightOffset: product.heightOffset
    });
    
    return result;
  }, [product.position, product.name, product.category, product.heightOffset, scale, origin, product.id]);

  // Convert dimensions to real-world units with accurate product dimensions
  const targetDimensions = useMemo(() => {
    // CRITICAL: dimensions are stored in PIXELS in the data model
    // We need to convert them to MILLIMETERS first, then to METERS
    const widthMm = product.originalDimensions?.width || (product.dimensions?.width / scale) || 600;
    const heightMm = product.originalDimensions?.height || (product.dimensions?.height / scale) || 850;
    const depthMm = product.originalDimensions?.length || (product.dimensions?.length / scale) || 600;
    
    return {
      width: widthMm * 0.001, // mm to meters
      height: heightMm * 0.001,
      depth: depthMm * 0.001
    };
  }, [product.originalDimensions, product.dimensions, scale]);

  // Rotation is stored in radians consistently across 2D and 3D
  const rotationRad = product.rotation || 0;
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
  isSelected,
}: {
  modelPath: string;
  productId: string;
  targetSize: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  isSelected: boolean;
}) => {
  const groupRef = useRef<Group>(null);
  const gltf = useLoader(GLTFLoader, modelPath);
  const [useFallback, setUseFallback] = React.useState(false);

  useEffect(() => {
    if (!gltf || !groupRef.current) return;

    // Compute current model bounds BEFORE any transformations
    const box = new Box3().setFromObject(gltf.scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    console.debug('[ProductGLTF] Original GLTF bounds:', {
      modelPath: modelPath.split('/').pop(),
      size: { x: size.x, y: size.y, z: size.z }
    });

    // Check if model is degenerate (empty/placeholder/corrupt)
    const MIN_VALID_SIZE = 1e-4;
    if (size.x < MIN_VALID_SIZE || size.y < MIN_VALID_SIZE || size.z < MIN_VALID_SIZE) {
      console.warn('[ProductGLTF] Degenerate model detected, using fallback proxy:', modelPath);
      setUseFallback(true);
      return;
    }

    // Center horizontally (x), anchor back face at z=0, and place bottom on floor
    // Subtract center.x to center horizontally, use -box.min.z so back face sits at z=0, and -min.y to lift bottom to y=0
    gltf.scene.position.set(-center.x, -box.min.y, -box.min.z);

    // Scale to match target physical dimensions
    const [tx, ty, tz] = targetSize;
    const sx = size.x > 0 ? tx / size.x : 1;
    const sy = size.y > 0 ? ty / size.y : 1;
    const sz = size.z > 0 ? tz / size.z : 1;
    gltf.scene.scale.set(sx, sy, sz);

    console.debug('[ProductGLTF] Transformed:', {
      modelPath: modelPath.split('/').pop(),
      scale: { x: sx, y: sy, z: sz },
      targetSize
    });

    // Add productId to all children for raycasting
    groupRef.current.traverse((child: any) => {
      child.userData = { ...(child.userData || {}), productId };
      if (!child.name) child.name = 'product';
    });
  }, [gltf, productId, targetSize, modelPath]);

  // Render fallback proxy if model is degenerate
  if (useFallback) {
    const halfHeight = targetSize[1] / 2;
    return (
      <group position={position} rotation={rotation} name="product" userData={{ productId }}>
        <mesh position={[0, halfHeight, targetSize[2] / 2]} castShadow receiveShadow userData={{ productId }}>
          <boxGeometry args={targetSize} />
          <meshLambertMaterial color={isSelected ? '#ff6b6b' : '#cccccc'} transparent={isSelected} opacity={isSelected ? 0.8 : 1} />
          {isSelected && (
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(...targetSize)]} />
              <lineBasicMaterial color="#ff0000" linewidth={2} />
            </lineSegments>
          )}
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} rotation={rotation} name="product" userData={{ productId }}>
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
      {placedProducts.map((product, index) => (
        <ProductModel
          key={`${product.id}-${index}`}
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
