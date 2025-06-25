
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
  
  // useGLTF returns only the GLTF data, no error property
  const { scene } = useGLTF(modelPath, true);
  
  // Handle loading success
  useEffect(() => {
    if (scene && groupRef.current && !isLoaded) {
      console.log('Successfully loaded GLB model:', modelPath);
      
      try {
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
          
          // More conservative scaling to ensure model is clearly visible
          const maxDimension = Math.max(size.x, size.y, size.z);
          const targetSize = 2; // Smaller target size for better overview
          const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          modelClone.scale.setScalar(scale);
          
          // Clear previous children and add the centered/scaled model
          groupRef.current.clear();
          groupRef.current.add(modelClone);
          
          console.log('Model centered and scaled:', { center, size, scale, maxDimension });
          
          // Check if this is the Eye and Body Shower, Wall-Recessed model
          const isRecessedEyeBodyShower = modelPath.includes('bl-ebs-recessed-003');
          
          // Adjust camera positioning based on the specific product
          const boundingSphere = box.getBoundingSphere(new THREE.Sphere());
          let distance;
          
          if (isRecessedEyeBodyShower) {
            // Much closer camera positioning for the recessed eye and body shower
            distance = boundingSphere.radius * 3; // Closer view for this specific model
          } else {
            // Standard zoomed out positioning for other models
            distance = boundingSphere.radius * 6; // Much larger distance for better overview
          }
          
          // Position camera further away at a good viewing angle
          const cameraX = distance * 0.7;
          const cameraY = distance * 0.5;
          const cameraZ = distance * 0.7;
          
          camera.position.set(cameraX, cameraY, cameraZ);
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();
          
          console.log('Camera positioned at:', { x: cameraX, y: cameraY, z: cameraZ, distance, isRecessedEyeBodyShower });
          
          setIsLoaded(true);
        }
      } catch (error) {
        console.error(`Failed to process GLB model: ${modelPath}. Error:`, error);
      }
    }
  }, [scene, camera, isLoaded, modelPath]);
  
  // Return null if no scene is available
  if (!scene) {
    return null;
  }
  
  return (
    <group 
      ref={groupRef}
      scale={hovered ? 1.02 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
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
          camera={{ position: [8, 6, 8], fov: 60 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="studio" environmentIntensity={0.4} />
            
            {/* Enhanced lighting setup for better model visibility */}
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[5, 8, 5]} 
              intensity={0.8} 
              castShadow 
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight 
              position={[-5, 3, -5]} 
              intensity={0.4} 
            />
            <pointLight position={[0, 5, 0]} intensity={0.3} />
            <pointLight position={[0, -5, 0]} intensity={0.2} />
            
            <GLBModel modelPath={modelPath} />
            
            <OrbitControls 
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              autoRotate={false}
              maxPolarAngle={Math.PI}
              minPolarAngle={0}
              minDistance={2}
              maxDistance={50}
              enableDamping={true}
              dampingFactor={0.05}
              target={[0, 0, 0]}
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
