
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { ErrorBoundary } from 'react-error-boundary';
import * as THREE from 'three';

interface GLBModelProps {
  modelPath: string;
}

const GLBModel: React.FC<GLBModelProps> = ({ modelPath }) => {
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
        
        // Enhanced material processing for better realism
        modelClone.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Enhance materials with PBR properties
            if (child.material instanceof THREE.MeshStandardMaterial) {
              // Improve material properties for better lighting response
              child.material.roughness = child.material.roughness || 0.4;
              child.material.metalness = child.material.metalness || 0.1;
              child.material.envMapIntensity = 1.5;
              
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
          // Center the model at origin
          modelClone.position.set(-center.x, -center.y, -center.z);
          
          // More conservative scaling to ensure model is clearly visible
          const maxDimension = Math.max(size.x, size.y, size.z);
          const targetSize = 3; // Smaller target size for better overview
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
          
          if (isRecessedEyeBodyShower) {
            // Position camera directly in front of the door/handle area
            const distance = boundingSphere.radius * 2.5;
            
            const cameraX = 0;
            const cameraY = distance * 0.3;
            const cameraZ = distance;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(0, 0, 0);
            
            console.log('Camera positioned for wall-recessed shower at:', { x: cameraX, y: cameraY, z: cameraZ, distance });
          } else {
            // Standard positioning for other models
            const distance = boundingSphere.radius * 8;
            
            const cameraX = distance * 0.7;
            const cameraY = distance * 0.5;
            const cameraZ = distance * 0.7;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(0, 0, 0);
            
            console.log('Camera positioned at standard angle:', { x: cameraX, y: cameraY, z: cameraZ, distance });
          }
          
          camera.updateProjectionMatrix();
          setIsLoaded(true);
        }
      } catch (error) {
        console.error(`Failed to process GLB model: ${modelPath}. Error:`, error);
      }
    }
  }, [scene, camera, isLoaded, modelPath]);
  
  // Subtle animation on hover
  useFrame((state) => {
    if (groupRef.current && isLoaded) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      
      // Subtle rotation when hovered
      if (hovered) {
        groupRef.current.rotation.y += 0.005;
      }
    }
  });
  
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
    <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-100`}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas 
          camera={{ position: [8, 6, 8], fov: 50 }}
          shadows
          gl={{ 
            antialias: true, 
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2
          }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={null}>
            {/* HDR Environment for realistic reflections and lighting */}
            <Environment 
              preset="studio" 
              background={false}
              environmentIntensity={0.6}
            />
            
            {/* Enhanced lighting setup for better model visibility and realism */}
            <ambientLight intensity={0.3} color="#ffffff" />
            
            {/* Key light - main illumination */}
            <directionalLight 
              position={[10, 10, 5]} 
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
            
            {/* Fill light - soften shadows */}
            <directionalLight 
              position={[-5, 5, -5]} 
              intensity={0.4} 
              color="#b6d7ff"
            />
            
            {/* Rim light - edge definition */}
            <directionalLight 
              position={[0, 2, -10]} 
              intensity={0.3}
              color="#fff4e6"
            />
            
            {/* Additional ambient lights for better material definition */}
            <pointLight position={[5, 5, 5]} intensity={0.3} color="#ffffff" />
            <pointLight position={[-5, -2, 5]} intensity={0.2} color="#e6f3ff" />
            
            {/* Contact shadows for ground contact realism */}
            <ContactShadows
              position={[0, -1.5, 0]}
              opacity={0.4}
              scale={10}
              blur={2.5}
              far={4}
              resolution={256}
              color="#000000"
            />
            
            <GLBModel modelPath={modelPath} />
            
            <OrbitControls 
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              autoRotate={false}
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI * 0.9}
              minPolarAngle={Math.PI * 0.1}
              minDistance={2}
              maxDistance={20}
              enableDamping={true}
              dampingFactor={0.05}
              target={[0, 0, 0]}
              minAzimuthAngle={-Infinity}
              maxAzimuthAngle={Infinity}
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
