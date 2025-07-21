
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
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
        
        // Enhanced material processing for better visibility against black background
        modelClone.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Enhance materials with PBR properties for black background
            if (child.material instanceof THREE.MeshStandardMaterial) {
              // Optimize material properties for black background visibility
              child.material.roughness = child.material.roughness || 0.3;
              child.material.metalness = child.material.metalness || 0.1;
              child.material.envMapIntensity = 1.2; // Increased for better visibility
              
              // Enhance material brightness for black background
              if (child.material.color) {
                child.material.color.multiplyScalar(1.3); // Brighten colors slightly
              }
              
              // Enable shadows
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Improve material quality
              if (child.material.map) {
                child.material.map.generateMipmaps = true;
                child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                child.material.map.magFilter = THREE.LinearFilter;
              }
            }
          }
        });
        
        // Calculate bounding box with more precision
        const box = new THREE.Box3().setFromObject(modelClone);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Only proceed if we have valid dimensions
        if (size.length() > 0) {
          // Center the model properly
          modelClone.position.set(-center.x, -center.y, -center.z);
          
          // Improved scaling logic for laboratory furniture
          const maxDimension = Math.max(size.x, size.y, size.z);
          let targetSize = 2.5;
          
          if (isInnosinProduct) {
            // Laboratory furniture specific scaling for better knee space visibility
            targetSize = 2.8; // Slightly larger for better detail visibility
          }
          
          const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          modelClone.scale.setScalar(scale);
          
          // Clear previous children and add the centered/scaled model
          groupRef.current.clear();
          groupRef.current.add(modelClone);
          
          // Calculate the actual center after positioning and scaling
          const finalBox = new THREE.Box3().setFromObject(groupRef.current);
          const actualCenter = finalBox.getCenter(new THREE.Vector3());
          
          // For Hamilton products, notify parent about the calculated center
          if (isHamiltonProduct && onCenterCalculated) {
            onCenterCalculated(actualCenter);
          }
          
          console.log('Model centered and scaled:', { center, size, scale, maxDimension, actualCenter });
          
          // Improved camera positioning for knee space visibility
          const boundingSphere = finalBox.getBoundingSphere(new THREE.Sphere());
          const radius = boundingSphere.radius;
          
          if (isInnosinProduct) {
            // Laboratory furniture specific positioning for optimal knee space view
            const distance = radius * 2.2; // Closer for better detail
            
            // Position camera to show knee space clearly
            const cameraX = actualCenter.x + distance * 0.6;
            const cameraY = actualCenter.y + distance * 0.4; // Lower angle for knee space
            const cameraZ = actualCenter.z + distance * 0.9;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(actualCenter);
            
            console.log('Camera positioned for knee space visibility:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          } else if (isHamiltonProduct) {
            // Hamilton product positioning
            const distance = radius * 1.6;
            
            const cameraX = actualCenter.x + distance * 0.7;
            const cameraY = actualCenter.y + distance * 0.4;
            const cameraZ = actualCenter.z + distance * 0.8;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(actualCenter);
            
            console.log('Camera positioned for Hamilton product:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          } else {
            // Standard positioning
            const distance = radius * 3;
            
            const cameraX = actualCenter.x + distance * 0.7;
            const cameraY = actualCenter.y + distance * 0.5;
            const cameraZ = actualCenter.z + distance * 0.7;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(actualCenter);
            
            console.log('Camera positioned at standard angle:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          }
          
          camera.updateProjectionMatrix();
          setIsLoaded(true);
        }
      } catch (error) {
        console.error(`Failed to process GLB model: ${modelPath}. Error:`, error);
      }
    }
  }, [scene, camera, isLoaded, modelPath, onCenterCalculated]);
  
  // Minimal animation for laboratory furniture
  useFrame((state) => {
    if (groupRef.current && isLoaded && !isHamiltonProduct) {
      // Very subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
      
      // Subtle rotation when hovered
      if (hovered) {
        groupRef.current.rotation.y += 0.003;
      }
    }
  });
  
  if (!scene) {
    return null;
  }
  
  return (
    <group 
      ref={groupRef}
      scale={hovered ? 1.01 : 1}
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
          camera={{ position: [8, 6, 8], fov: 45 }}
          shadows
          gl={{ 
            antialias: true, 
            alpha: false, // Disable alpha for solid black background
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1 // Slightly increased for better visibility
          }}
          onCreated={({ gl, scene }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            scene.background = new THREE.Color(0x000000); // Solid black background
          }}
        >
          <Suspense fallback={null}>
            {/* Enhanced lighting setup for black background and knee space visibility */}
            <ambientLight intensity={0.3} color="#ffffff" />
            
            {/* Primary light for knee space visibility */}
            <directionalLight 
              position={[10, 8, 5]} 
              intensity={1.2} 
              castShadow 
              shadow-mapSize={[2048, 2048]}
              shadow-camera-near={0.1}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
              color="#ffffff"
            />
            
            {/* Fill light for better detail visibility */}
            <directionalLight 
              position={[-8, 6, -3]} 
              intensity={0.8} 
              color="#f0f0f0"
            />
            
            {/* Additional light for knee space area */}
            <directionalLight 
              position={[0, -5, 8]} 
              intensity={0.6}
              color="#ffffff"
            />
            
            {/* Point lights for enhanced visibility */}
            <pointLight position={[8, 8, 8]} intensity={0.4} color="#ffffff" />
            <pointLight position={[-8, -4, 8]} intensity={0.3} color="#e6f3ff" />
            <pointLight position={[0, -8, 0]} intensity={0.2} color="#ffffff" />
            
            {/* Subtle contact shadows for depth */}
            <ContactShadows
              position={[0, -1.5, 0]}
              opacity={0.2}
              scale={10}
              blur={3}
              far={4}
              resolution={512}
              color="#000000"
            />
            
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
              autoRotateSpeed={0}
              maxPolarAngle={Math.PI * 0.8}
              minPolarAngle={Math.PI * 0.2}
              minDistance={2}
              maxDistance={15}
              enableDamping={true}
              dampingFactor={0.05}
              target={isHamiltonProduct ? rotationCenter : new THREE.Vector3(0, 0, 0)}
              zoomSpeed={0.5}
              panSpeed={0.5}
              rotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Enhanced3DViewer;
