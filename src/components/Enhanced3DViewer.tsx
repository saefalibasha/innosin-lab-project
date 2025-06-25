
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
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
    
    // Improved auto-center and scale the model
    useEffect(() => {
      if (scene && groupRef.current && !isLoaded) {
        // Create a copy of the scene to avoid modifying the original
        const modelClone = scene.clone();
        
        // Calculate bounding box with more precision
        const box = new THREE.Box3().setFromObject(modelClone);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Only proceed if we have valid dimensions
        if (size.length() > 0) {
          // Center the model at origin
          modelClone.position.set(-center.x, -center.y, -center.z);
          
          // Improved scaling to ensure model fits well in viewport
          const maxDimension = Math.max(size.x, size.y, size.z);
          const targetSize = 2.5; // Optimal size for visibility
          const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          modelClone.scale.setScalar(scale);
          
          // Clear previous children and add the centered/scaled model
          groupRef.current.clear();
          groupRef.current.add(modelClone);
          
          console.log('Model centered and scaled:', { center, size, scale, maxDimension });
          
          // Improved camera positioning for better model visibility
          const distance = targetSize * 2.5;
          camera.position.set(distance * 0.8, distance * 0.5, distance * 0.8);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          
          setIsLoaded(true);
        }
      }
    }, [scene, camera, isLoaded]);
    
    return (
      <group 
        ref={groupRef}
        scale={hovered ? 1.02 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    );
  } catch (error) {
    console.log(`Failed to load GLB model: ${modelPath}. Error:`, error);
    return null; // Return nothing instead of purple cube
  }
};

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-pulse text-muted-foreground">Loading 3D model...</div>
  </div>
);

const ErrorFallback: React.FC = () => {
  console.log('Error boundary triggered for 3D model');
  return (
    <div className="flex items-center justify-center h-full bg-white rounded-lg">
      <div className="text-muted-foreground text-center">
        <div className="text-lg mb-2">3D Model Unavailable</div>
        <div className="text-sm">Unable to load 3D preview</div>
      </div>
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
    <div className={`${className} bg-white rounded-lg overflow-hidden border border-gray-100`}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas 
          camera={{ position: [4, 3, 4], fov: 50 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="studio" environmentIntensity={0.3} />
            
            {/* Optimized lighting setup */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[5, 8, 5]} 
              intensity={0.6} 
              castShadow 
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight 
              position={[-5, 3, -5]} 
              intensity={0.3} 
            />
            <pointLight position={[0, 5, 0]} intensity={0.2} />
            
            <GLBModel modelPath={modelPath} />
            
            <OrbitControls 
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              autoRotate={false}
              // Remove polar angle restrictions for full 360-degree rotation
              maxPolarAngle={Math.PI}
              minPolarAngle={0}
              minDistance={2}
              maxDistance={20}
              enableDamping={true}
              dampingFactor={0.05}
              target={[0, 0, 0]}
              // Allow full azimuthal rotation
              minAzimuthAngle={-Infinity}
              maxAzimuthAngle={Infinity}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Enhanced3DViewer;
