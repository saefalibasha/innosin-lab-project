
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cone, Environment, ContactShadows } from '@react-three/drei';
import { Mesh } from 'three';
import * as THREE from 'three';

interface RealisticProduct3DViewerProps {
  productType?: 'box' | 'sphere' | 'cone';
  color?: string;
  className?: string;
}

const RealisticProduct3D = ({ productType = 'box', color = '#4F46E5' }: { productType: string; color: string }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      if (hovered) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  const scale = hovered ? 1.1 : 1;

  // Enhanced material with PBR properties
  const enhancedMaterial = (
    <meshStandardMaterial 
      color={color}
      roughness={0.3}
      metalness={0.1}
      envMapIntensity={1.5}
    />
  );

  switch (productType) {
    case 'sphere':
      return (
        <Sphere
          ref={meshRef}
          args={[1, 32, 32]}
          scale={scale}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          castShadow
          receiveShadow
        >
          {enhancedMaterial}
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
          castShadow
          receiveShadow
        >
          {enhancedMaterial}
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
          castShadow
          receiveShadow
        >
          {enhancedMaterial}
        </Box>
      );
  }
};

const RealisticProduct3DViewer: React.FC<RealisticProduct3DViewerProps> = ({ 
  productType = 'box', 
  color = '#4F46E5',
  className = "w-full h-64" 
}) => {
  return (
    <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden`}>
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
      >
        <Suspense fallback={null}>
          {/* HDR Environment for realistic lighting */}
          <Environment 
            preset="city" 
            background={false}
            environmentIntensity={0.4}
          />
          
          {/* Enhanced lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          <pointLight position={[0, 5, 0]} intensity={0.3} />
          
          {/* Contact shadows for realism */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.3}
            scale={5}
            blur={2}
            far={3}
            resolution={256}
          />
          
          <RealisticProduct3D productType={productType} color={color} />
          
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={2}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 4}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RealisticProduct3DViewer;
