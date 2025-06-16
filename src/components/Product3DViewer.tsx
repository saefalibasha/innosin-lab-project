
import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cone } from '@react-three/drei';
import { Mesh } from 'three';

interface Product3DViewerProps {
  productType?: 'box' | 'sphere' | 'cone';
  color?: string;
  className?: string;
}

const Product3D = ({ productType = 'box', color = '#4F46E5' }: { productType: string; color: string }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);

  const scale = hovered ? 1.1 : 1;

  switch (productType) {
    case 'sphere':
      return (
        <Sphere
          ref={meshRef}
          args={[1, 32, 32]}
          scale={scale}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <meshStandardMaterial color={color} />
        </Sphere>
      );
    case 'cone':
      return (
        <Cone
          ref={meshRef}
          args={[1, 2, 32]}
          scale={scale}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <meshStandardMaterial color={color} />
        </Cone>
      );
    default:
      return (
        <Box
          ref={meshRef}
          args={[1.5, 1.5, 1.5]}
          scale={scale}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <meshStandardMaterial color={color} />
        </Box>
      );
  }
};

const Product3DViewer: React.FC<Product3DViewerProps> = ({ 
  productType = 'box', 
  color = '#4F46E5',
  className = "w-full h-64" 
}) => {
  return (
    <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Product3D productType={productType} color={color} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
};

export default Product3DViewer;
