
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
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  console.log('Attempting to load GLB model from:', modelPath);
  
  // Special debugging for bl-hes-bench-001
  if (modelPath.includes('bl-hes-bench-001')) {
    console.log('🔍 DEBUGGING bl-hes-bench-001 specifically');
    console.log('🔍 Full model path:', modelPath);
    console.log('🔍 Expected path: /products/bl-hes-bench-001/model.glb');
  }
  
  try {
    const { scene } = useGLTF(modelPath);
    console.log('Successfully loaded GLB model:', modelPath);
    
    // Special success log for bl-hes-bench-001
    if (modelPath.includes('bl-hes-bench-001')) {
      console.log('✅ bl-hes-bench-001 GLB model loaded successfully!');
    }
    
    // Auto-center and scale the model
    useEffect(() => {
      if (scene && groupRef.current) {
        // Create a copy of the scene to avoid modifying the original
        const modelClone = scene.clone();
        
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(modelClone);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        modelClone.position.set(-center.x, -center.y, -center.z);
        
        // Scale the model to fit nicely in the viewport
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 2; // Target size for the model
        const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
        modelClone.scale.setScalar(scale);
        
        // Clear previous children and add the centered/scaled model
        groupRef.current.clear();
        groupRef.current.add(modelClone);
        
        console.log('Model centered and scaled:', { center, size, scale });
        
        // Adjust camera position based on model size
        const distance = Math.max(3, maxDimension * 1.5);
        camera.position.set(0, 0, distance);
        camera.updateProjectionMatrix();
      }
    }, [scene, camera]);
    
    return (
      <group 
        ref={groupRef}
        scale={hovered ? 1.05 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    );
  } catch (error) {
    console.log(`Failed to load GLB model: ${modelPath}, using fallback. Error:`, error);
    
    // Special error log for bl-hes-bench-001
    if (modelPath.includes('bl-hes-bench-001')) {
      console.log('❌ bl-hes-bench-001 GLB model failed to load!');
      console.log('❌ Error details:', error);
    }
    
    return <FallbackModel />;
  }
};

const FallbackModel: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Box
      args={[1.5, 1.5, 1.5]}
      scale={hovered ? 1.1 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial color="#4F46E5" />
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
  
  // Special debugging for bl-hes-bench-001
  if (modelPath.includes('bl-hes-bench-001')) {
    console.log('🔍 Enhanced3DViewer: Rendering bl-hes-bench-001');
  }
  
  return (
    <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden`}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} />
            <directionalLight position={[-10, -10, -5]} intensity={0.8} />
            <pointLight position={[0, 10, 0]} intensity={0.6} />
            
            <GLBModel modelPath={modelPath} />
            
            <OrbitControls 
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              autoRotate={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 6}
              minDistance={1.5}
              maxDistance={8}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Enhanced3DViewer;
