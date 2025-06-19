import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Box, Environment } from '@react-three/drei';
import { ErrorBoundary } from 'react-error-boundary';

interface GLBModelProps {
  modelPath: string;
}

const GLBModel: React.FC<GLBModelProps> = ({ modelPath }) => {
  const [hovered, setHovered] = useState(false);
  
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
    
    return (
      <primitive 
        object={scene} 
        scale={hovered ? 1.1 : 1}
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
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
            
            <GLBModel modelPath={modelPath} />
            
            <OrbitControls 
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              autoRotate={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 4}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Enhanced3DViewer;
