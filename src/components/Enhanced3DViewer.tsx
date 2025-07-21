
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
  
  // Check if this is a Hamilton or Innosin product
  const isHamiltonProduct = modelPath.includes('hls-product');
  const isInnosinProduct = modelPath.includes('innosin');
  
  // Handle loading success and model enhancement
  useEffect(() => {
    if (scene && groupRef.current && !isLoaded) {
      console.log('Successfully loaded GLB model:', modelPath);
      
      try {
        // Create a copy of the scene to avoid modifying the original
        const modelClone = scene.clone();
        
        // Enhanced material processing for better visibility and sharpness
        modelClone.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Enhance materials with optimized properties for black background
            if (child.material instanceof THREE.MeshStandardMaterial) {
              // Optimize material properties for maximum clarity
              child.material.roughness = child.material.roughness || 0.2;
              child.material.metalness = child.material.metalness || 0.05;
              child.material.envMapIntensity = 1.5; // Increased for better visibility
              
              // Enhance material brightness and contrast for black background
              if (child.material.color) {
                child.material.color.multiplyScalar(1.4); // Brighten colors for clarity
              }
              
              // Improve material quality for sharpness
              if (child.material.map) {
                child.material.map.generateMipmaps = true;
                child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                child.material.map.magFilter = THREE.LinearFilter;
                child.material.map.anisotropy = gl.capabilities.getMaxAnisotropy();
              }
              
              // Enhance normal maps for better detail
              if (child.material.normalMap) {
                child.material.normalMap.generateMipmaps = true;
                child.material.normalScale.set(1.2, 1.2);
              }
            }
          }
        });
        
        // Enhanced bounding box calculation for perfect centering
        const box = new THREE.Box3().setFromObject(modelClone);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Only proceed if we have valid dimensions
        if (size.length() > 0) {
          // Perfect centering - move model so its center is at origin
          modelClone.position.set(-center.x, -center.y, -center.z);
          
          // Improved scaling logic for laboratory furniture
          const maxDimension = Math.max(size.x, size.y, size.z);
          let targetSize = 2.8; // Increased for better detail visibility
          
          if (isInnosinProduct) {
            // Laboratory furniture specific scaling for optimal knee space visibility
            targetSize = 3.2; // Larger for better feature visibility
          }
          
          const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          modelClone.scale.setScalar(scale);
          
          // Clear previous children and add the perfectly centered model
          groupRef.current.clear();
          groupRef.current.add(modelClone);
          
          // Calculate the final center for camera targeting
          const finalBox = new THREE.Box3().setFromObject(groupRef.current);
          const actualCenter = finalBox.getCenter(new THREE.Vector3());
          
          // For Hamilton products, notify parent about the calculated center
          if (isHamiltonProduct && onCenterCalculated) {
            onCenterCalculated(actualCenter);
          }
          
          console.log('Model perfectly centered and scaled:', { center, size, scale, maxDimension, actualCenter });
          
          // Optimized camera positioning for best feature visibility
          const boundingSphere = finalBox.getBoundingSphere(new THREE.Sphere());
          const radius = boundingSphere.radius;
          
          if (isInnosinProduct) {
            // Laboratory furniture specific positioning for optimal knee space view
            const distance = radius * 2.5; // Optimal distance for detail visibility
            
            // Position camera to show knee space and all features clearly
            const cameraX = actualCenter.x + distance * 0.7;
            const cameraY = actualCenter.y + distance * 0.3; // Slightly lower for knee space
            const cameraZ = actualCenter.z + distance * 0.8;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(actualCenter);
            
            console.log('Camera positioned for optimal knee space visibility:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          } else if (isHamiltonProduct) {
            // Hamilton product positioning
            const distance = radius * 2.0;
            
            const cameraX = actualCenter.x + distance * 0.8;
            const cameraY = actualCenter.y + distance * 0.4;
            const cameraZ = actualCenter.z + distance * 0.7;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(actualCenter);
            
            console.log('Camera positioned for Hamilton product:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          } else {
            // Standard positioning for maximum clarity
            const distance = radius * 2.2;
            
            const cameraX = actualCenter.x + distance * 0.8;
            const cameraY = actualCenter.y + distance * 0.4;
            const cameraZ = actualCenter.z + distance * 0.7;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(actualCenter);
            
            console.log('Camera positioned for maximum clarity:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          }
          
          camera.updateProjectionMatrix();
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
  
  const isHamiltonProduct = modelPath.includes('hls-product');
  const isInnosinProduct = modelPath.includes('innosin');
  
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
          camera={{ position: [8, 6, 8], fov: 40 }}
          gl={{ 
            antialias: true,
            alpha: false,
            pixelRatio: Math.min(window.devicePixelRatio, 2), // High pixel ratio for sharpness
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2 // Optimized exposure for clarity
          }}
          onCreated={({ gl, scene }) => {
            scene.background = new THREE.Color(0x000000); // Pure black background
            
            // Optimize renderer for maximum sharpness
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.physicallyCorrectLights = true;
          }}
        >
          <Suspense fallback={null}>
            {/* Simplified and optimized lighting setup for maximum clarity */}
            <ambientLight intensity={0.4} color="#ffffff" />
            
            {/* Primary key light for feature definition */}
            <directionalLight 
              position={[12, 10, 8]} 
              intensity={1.4} 
              color="#ffffff"
            />
            
            {/* Fill light for even illumination */}
            <directionalLight 
              position={[-8, 8, -4]} 
              intensity={0.8} 
              color="#f8f8f8"
            />
            
            {/* Accent light for knee space visibility */}
            <directionalLight 
              position={[0, -6, 10]} 
              intensity={0.7}
              color="#ffffff"
            />
            
            {/* Single point light for enhanced detail */}
            <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
            
            <GLBModel 
              modelPath={modelPath} 
              onCenterCalculated={isHamiltonProduct ? handleCenterCalculated : undefined}
            />
            
            <OrbitControls 
              ref={orbitControlsRef}
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              autoRotate={false}
              maxPolarAngle={Math.PI * 0.85}
              minPolarAngle={Math.PI * 0.15}
              minDistance={3}
              maxDistance={20}
              enableDamping={true}
              dampingFactor={0.08}
              target={isHamiltonProduct ? rotationCenter : new THREE.Vector3(0, 0, 0)}
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
