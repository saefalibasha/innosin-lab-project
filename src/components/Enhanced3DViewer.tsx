
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Box, Environment } from '@react-three/drei';
import { ErrorBoundary } from 'react-error-boundary';
import * as THREE from 'three';

interface GLBModelProps {
  modelPath: string;
}

const GLBModel: React.FC<GLBModelProps> = ({ modelPath }) => {
  const [hovered, setHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  console.log('Attempting to load GLB model from:', modelPath);
  
  try {
    const { scene } = useGLTF(modelPath);
    console.log('Successfully loaded GLB model:', modelPath);
    
    // Auto-center and scale the model
    useEffect(() => {
      if (scene && groupRef.current && !isLoaded) {
        // Create a copy of the scene to avoid modifying the original
        const modelClone = scene.clone();
        
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(modelClone);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Only proceed if we have valid dimensions
        if (size.length() > 0) {
          // Center the model
          modelClone.position.set(-center.x, -center.y, -center.z);
          
          // Scale the model to fit nicely in the viewport
          const maxDimension = Math.max(size.x, size.y, size.z);
          const targetSize = 3; // Increased target size for better visibility
          const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          modelClone.scale.setScalar(scale);
          
          // Clear previous children and add the centered/scaled model
          groupRef.current.clear();
          groupRef.current.add(modelClone);
          
          console.log('Model centered and scaled:', { center, size, scale, maxDimension });
          
          // Improved camera positioning based on model size
          const distance = Math.max(5, targetSize * 2);
          camera.position.set(distance * 0.8, distance * 0.6, distance * 0.8);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          
          setIsLoaded(true);
        }
      }
    }, [scene, camera, isLoaded]);
    
    return (
      <group 
        ref={groupRef}
        scale={hovered ? 1.01 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    );
  } catch (error) {
    console.log(`Failed to load GLB model: ${modelPath}, using fallback. Error:`, error);
    return <FallbackModel />;
  }
};

const FallbackModel: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Box
      args={[2, 2, 2]}
      scale={hovered ? 1.05 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial color="#6366f1" />
    </Box>
  );
};

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-pulse text-muted-foreground">Loading 3D model...</div>
  </div>
);

const ErrorFallback: React.FC = () => {
  console.log('Error boundary triggered for 3D model');
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
      <FallbackModel />
    </div>
  );
};

interface Enhanced3DViewerProps {
  modelPath: string;
  className?: string;
}

const Enhanced3DViewer: React.FC<Enhanced3DViewerProps> = ({ 
  modelPath,
  className = "w-full h-64" 
}) => {
  console.log('Enhanced3DViewer rendering with modelPath:', modelPath);
  
  return (
    <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden`}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas 
          camera={{ position: [5, 4, 5], fov: 50 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="city" environmentIntensity={0.3} />
            
            {/* Reduced lighting to prevent oversaturation */}
            <ambientLight intensity={0.2} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={0.6} 
              castShadow 
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight 
              position={[-10, -10, -5]} 
              intensity={0.3} 
            />
            <pointLight 
              position={[0, 10, 0]} 
              intensity={0.2} 
            />
            <spotLight 
              position={[0, 15, 0]} 
              angle={0.3} 
              penumbra={1} 
              intensity={0.3}
              castShadow
            />
            
            <GLBModel modelPath={modelPath} />
            
            <OrbitControls 
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              autoRotate={false}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 8}
              minDistance={3}
              maxDistance={15}
              enableDamping={true}
              dampingFactor={0.08}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Enhanced3DViewer;
