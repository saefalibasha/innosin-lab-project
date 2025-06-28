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
          const isHamiltonProduct = modelPath.includes('hls-product');
          const isRecessedEyeBodyShower = modelPath.includes('bl-ebs-recessed-003');
          
          // CENTER THE MODEL AT ORIGIN - CRITICAL FOR PROPER ROTATION AND FRAMING
          if (isHamiltonProduct) {
            // For Hamilton products, ensure perfect centering by calculating the true geometric center
            const geometricCenter = new THREE.Vector3();
            
            // Get the exact center of the bounding box
            box.getCenter(geometricCenter);
            
            // Move the model so its center is at world origin (0,0,0)
            // This ensures the model rotates around its own center
            modelClone.position.set(-geometricCenter.x, -geometricCenter.y, -geometricCenter.z);
            
            // Additional check: ensure the model is truly centered by recalculating
            const verificationBox = new THREE.Box3().setFromObject(modelClone);
            const verificationCenter = verificationBox.getCenter(new THREE.Vector3());
            
            console.log('Hamilton model centering verification:', { 
              originalCenter: geometricCenter,
              finalPosition: modelClone.position,
              verificationCenter: verificationCenter,
              isNearlyCentered: Math.abs(verificationCenter.x) < 0.01 && Math.abs(verificationCenter.y) < 0.01 && Math.abs(verificationCenter.z) < 0.01
            });
            
            // If not perfectly centered, apply additional correction
            if (Math.abs(verificationCenter.x) > 0.01 || Math.abs(verificationCenter.y) > 0.01 || Math.abs(verificationCenter.z) > 0.01) {
              modelClone.position.add(new THREE.Vector3(-verificationCenter.x, -verificationCenter.y, -verificationCenter.z));
              console.log('Applied additional centering correction for Hamilton model');
            }
          } else {
            // Standard centering for other products
            modelClone.position.set(-center.x, -center.y, -center.z);
          }
          
          // Improved scaling logic based on product type
          const maxDimension = Math.max(size.x, size.y, size.z);
          
          let targetSize = 3; // Default target size
          let scale = 1;
          
          if (isHamiltonProduct) {
            // Hamilton fume hoods - larger scale for better visibility
            targetSize = 3.5;
            scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          } else if (isRecessedEyeBodyShower) {
            // Wall-recessed products need different scaling
            targetSize = 2.8;
            scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          } else {
            // Standard Broen Lab products
            targetSize = 3;
            scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          }
          
          modelClone.scale.setScalar(scale);
          
          // Clear previous children and add the centered/scaled model
          groupRef.current.clear();
          groupRef.current.add(modelClone);
          
          console.log('Model centered and scaled:', { center, size, scale, maxDimension, isHamiltonProduct });
          
          // Improved camera positioning based on product type
          const boundingSphere = box.getBoundingSphere(new THREE.Sphere());
          const radius = boundingSphere.radius * scale;
          
          if (isHamiltonProduct) {
            // Hamilton fume hoods - positioned to show the perfectly centered model
            const distance = radius * 2.0; // Optimal distance to see the centered model
            
            // Position camera at an angle that shows the centered fume hood clearly
            const cameraX = distance * 0.8;
            const cameraY = distance * 0.6;
            const cameraZ = distance * 0.8;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(0, 0, 0); // Look directly at the world origin where the model is centered
            
            console.log('Camera positioned for perfectly centered Hamilton product at:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          } else if (isRecessedEyeBodyShower) {
            // Position camera directly in front of the door/handle area
            const distance = radius * 3;
            
            const cameraX = 0;
            const cameraY = distance * 0.3;
            const cameraZ = distance;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(0, 0, 0);
            
            console.log('Camera positioned for wall-recessed shower at:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          } else {
            // Standard positioning for other Broen Lab products
            const distance = radius * 4;
            
            const cameraX = distance * 0.7;
            const cameraY = distance * 0.5;
            const cameraZ = distance * 0.7;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(0, 0, 0);
            
            console.log('Camera positioned at standard angle:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
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
  
  const isHamiltonProduct = modelPath.includes('hls-product');
  
  return (
    <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-100`}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas 
          camera={{ position: [8, 6, 8], fov: 45 }}
          shadows
          gl={{ 
            antialias: true, 
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: isHamiltonProduct ? 1.0 : 1.2
          }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={null}>
            {/* HDR Environment for realistic reflections and lighting */}
            <Environment 
              preset={isHamiltonProduct ? "warehouse" : "studio"} 
              background={false}
              environmentIntensity={isHamiltonProduct ? 0.5 : 0.6}
            />
            
            {/* Enhanced lighting setup for better model visibility and realism */}
            <ambientLight intensity={isHamiltonProduct ? 0.4 : 0.3} color="#ffffff" />
            
            {/* Key light - main illumination */}
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={isHamiltonProduct ? 1.0 : 1.2} 
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
              intensity={isHamiltonProduct ? 0.3 : 0.4} 
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
              opacity={isHamiltonProduct ? 0.3 : 0.4}
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
              minDistance={isHamiltonProduct ? 3 : 2}
              maxDistance={isHamiltonProduct ? 15 : 20}
              enableDamping={true}
              dampingFactor={0.08}
              target={[0, 0, 0]}
              minAzimuthAngle={-Infinity}
              maxAzimuthAngle={Infinity}
              zoomSpeed={0.6}
              panSpeed={0.6}
              rotateSpeed={0.6}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Enhanced3DViewer;
