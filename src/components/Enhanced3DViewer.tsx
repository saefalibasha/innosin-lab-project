import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { ErrorBoundary } from 'react-error-boundary';
import * as THREE from 'three';

interface GLBModelProps {
  modelPath: string;
  onCenterCalculated?: (center: THREE.Vector3) => void;
}

const GLBModel: React.FC<GLBModelProps> = ({ modelPath, onCenterCalculated }) => {
  const [hovered, setHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  console.log('Attempting to load GLB model from:', modelPath);
  
  const { scene } = useGLTF(modelPath, true);
  
  // Handle loading success and model enhancement
  useEffect(() => {
    if (scene && groupRef.current && !isLoaded) {
      console.log('Successfully loaded GLB model:', modelPath);
      
      try {
        // Create a copy of the scene to avoid modifying the original
        const modelClone = scene.clone();
        
        // Clean material processing for natural appearance
        modelClone.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            if (child.material instanceof THREE.MeshStandardMaterial) {
              // Keep natural material properties
              child.material.roughness = child.material.roughness || 0.4;
              child.material.metalness = child.material.metalness || 0.1;
              child.material.envMapIntensity = 0.8; // Reduced for natural look
              
              // Optimize texture quality
              if (child.material.map) {
                child.material.map.generateMipmaps = true;
                child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                child.material.map.magFilter = THREE.LinearFilter;
                child.material.map.anisotropy = gl.capabilities.getMaxAnisotropy();
              }
              
              // Natural normal map scaling
              if (child.material.normalMap) {
                child.material.normalMap.generateMipmaps = true;
                child.material.normalScale.set(1.0, 1.0);
              }
            }
          }
        });
        
        // Improved centering calculation
        const box = new THREE.Box3().setFromObject(modelClone);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Only proceed if we have valid dimensions
        if (size.length() > 0) {
          // Center the model at origin
          modelClone.position.set(-center.x, -center.y, -center.z);
          
          // Consistent scaling for all products
          const maxDimension = Math.max(size.x, size.y, size.z);
          let targetSize = 2.5; // Consistent size for all products
          
          const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          modelClone.scale.setScalar(scale);
          
          // Clear and add the centered model
          groupRef.current.clear();
          groupRef.current.add(modelClone);
          
          // Calculate final center after transformations
          const finalBox = new THREE.Box3().setFromObject(groupRef.current);
          const actualCenter = finalBox.getCenter(new THREE.Vector3());
          
          console.log('Model centered and scaled:', { 
            originalCenter: center, 
            size, 
            scale, 
            actualCenter 
          });
          
          // Simple camera positioning
          const boundingSphere = finalBox.getBoundingSphere(new THREE.Sphere());
          const radius = boundingSphere.radius;
          const distance = radius * 2.5;
          
          // Position camera for optimal viewing
          camera.position.set(
            actualCenter.x + distance * 0.7,
            actualCenter.y + distance * 0.4,
            actualCenter.z + distance * 0.7
          );
          camera.lookAt(actualCenter);
          camera.updateProjectionMatrix();
          
          // Notify parent about center for OrbitControls
          if (onCenterCalculated) {
            onCenterCalculated(actualCenter);
          }
          
          setIsLoaded(true);
        }
      } catch (error) {
        console.error(`Failed to process GLB model: ${modelPath}. Error:`, error);
      }
    }
  }, [scene, camera, isLoaded, modelPath, onCenterCalculated, gl]);
  
  if (!scene) {
    return null;
  }
  
  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
};

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-pulse text-white">Loading 3D model...</div>
  </div>
);

const ErrorFallback: React.FC = () => {
  console.log('Error boundary triggered for 3D model');
  return (
    <div className="flex items-center justify-center h-full bg-black rounded-lg">
      <div className="text-white text-center">
        <div className="text-lg mb-2">3D Model Unavailable</div>
        <div className="text-sm text-gray-300">Unable to load 3D preview</div>
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
  const [rotationCenter, setRotationCenter] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const orbitControlsRef = useRef<any>(null);
  
  console.log('Enhanced3DViewer rendering with modelPath:', modelPath);
  
  const handleCenterCalculated = (center: THREE.Vector3) => {
    setRotationCenter(center);
    
    if (orbitControlsRef.current) {
      orbitControlsRef.current.target.copy(center);
      orbitControlsRef.current.update();
      console.log('Updated OrbitControls target to:', center);
    }
  };
  
  return (
    <div className={`${className} bg-black rounded-lg overflow-hidden border border-gray-800`}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas 
          camera={{ position: [6, 4, 6], fov: 45 }}
          gl={{ 
            antialias: true,
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.9 // Reduced from 1.2 to fix overexposure
          }}
          onCreated={({ gl, scene }) => {
            scene.background = new THREE.Color(0x000000); // Pure black background
            
            // Optimize renderer settings
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          <Suspense fallback={null}>
            {/* Simplified, balanced lighting setup */}
            <ambientLight intensity={0.3} color="#ffffff" />
            
            {/* Primary light for definition */}
            <directionalLight 
              position={[8, 8, 6]} 
              intensity={0.8} 
              color="#ffffff"
            />
            
            {/* Fill light for even illumination */}
            <directionalLight 
              position={[-6, 6, -4]} 
              intensity={0.4} 
              color="#f8f8f8"
            />
            
            {/* Subtle environment lighting */}
            <Environment 
              preset="city" 
              background={false}
              environmentIntensity={0.2}
            />
            
            <GLBModel 
              modelPath={modelPath} 
              onCenterCalculated={handleCenterCalculated}
            />
            
            <OrbitControls 
              ref={orbitControlsRef}
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              autoRotate={false}
              maxPolarAngle={Math.PI * 0.85}
              minPolarAngle={Math.PI * 0.15}
              minDistance={2}
              maxDistance={15}
              enableDamping={true}
              dampingFactor={0.08}
              target={rotationCenter}
              zoomSpeed={0.8}
              panSpeed={0.8}
              rotateSpeed={0.8}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Enhanced3DViewer;
