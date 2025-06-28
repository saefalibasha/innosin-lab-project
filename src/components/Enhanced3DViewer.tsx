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
  
  // Check if this is a Hamilton product
  const isHamiltonProduct = modelPath.includes('hls-product');
  
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
          const isRecessedEyeBodyShower = modelPath.includes('bl-ebs-recessed-003');
          
          // Standard centering for all products
          modelClone.position.set(-center.x, -center.y, -center.z);
          
          // Standard scaling logic for all products
          const maxDimension = Math.max(size.x, size.y, size.z);
          let targetSize = 3; // Default target size
          let scale = 1;
          
          if (isRecessedEyeBodyShower) {
            // Wall-recessed products need different scaling
            targetSize = 2.8;
            scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          } else {
            // Standard scaling for all products (including Hamilton)
            targetSize = 3;
            scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          }
          
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
          
          // Camera positioning based on product type
          const boundingSphere = finalBox.getBoundingSphere(new THREE.Sphere());
          const radius = boundingSphere.radius;
          
          if (isRecessedEyeBodyShower) {
            // Position camera directly in front of the door/handle area
            const distance = radius * 3;
            
            const cameraX = actualCenter.x;
            const cameraY = actualCenter.y + distance * 0.3;
            const cameraZ = actualCenter.z + distance;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(actualCenter);
            
            console.log('Camera positioned for wall-recessed shower at:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          } else if (isHamiltonProduct) {
            // Much closer positioning for Hamilton products - similar to the reference image angle
            const distance = radius * 1.6; // Slightly closer for better detail viewing
            
            // Position camera at an angle similar to the reference image
            const cameraX = actualCenter.x + distance * 0.7; // Right side, slightly adjusted
            const cameraY = actualCenter.y + distance * 0.4; // Lower angle for better product view
            const cameraZ = actualCenter.z + distance * 0.8; // Closer to front
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(actualCenter);
            
            console.log('Camera positioned close for Hamilton product:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius, center: actualCenter });
          } else {
            // Standard positioning for Broen Lab products
            const distance = radius * 4;
            
            const cameraX = actualCenter.x + distance * 0.7;
            const cameraY = actualCenter.y + distance * 0.5;
            const cameraZ = actualCenter.z + distance * 0.7;
            
            camera.position.set(cameraX, cameraY, cameraZ);
            camera.lookAt(actualCenter);
            
            console.log('Camera positioned at standard angle for Broen product:', { x: cameraX, y: cameraY, z: cameraZ, distance, radius });
          }
          
          camera.updateProjectionMatrix();
          setIsLoaded(true);
        }
      } catch (error) {
        console.error(`Failed to process GLB model: ${modelPath}. Error:`, error);
      }
    }
  }, [scene, camera, isLoaded, modelPath, onCenterCalculated]);
  
  // Animation - disabled for Hamilton products for stability
  useFrame((state) => {
    if (groupRef.current && isLoaded) {
      // Only apply floating animation to non-Hamilton products
      if (!isHamiltonProduct) {
        // Gentle floating animation
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      }
      
      // Subtle rotation when hovered (for all products)
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
  const [rotationCenter, setRotationCenter] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const orbitControlsRef = useRef<any>(null);
  
  console.log('Enhanced3DViewer rendering with modelPath:', modelPath);
  
  const isHamiltonProduct = modelPath.includes('hls-product');
  
  const handleCenterCalculated = (center: THREE.Vector3) => {
    setRotationCenter(center);
    
    // Update OrbitControls target if it exists
    if (orbitControlsRef.current) {
      orbitControlsRef.current.target.copy(center);
      orbitControlsRef.current.update();
      console.log('Updated OrbitControls target to:', center);
    }
  };
  
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
            
            {/* Standard lighting setup for all products */}
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
            
            <GLBModel 
              modelPath={modelPath} 
              onCenterCalculated={isHamiltonProduct ? handleCenterCalculated : undefined}
            />
            
            <OrbitControls 
              ref={orbitControlsRef}
              enableZoom={true}
              enablePan={isHamiltonProduct ? false : true} // Disable panning for Hamilton products for cleaner interaction
              enableRotate={true}
              autoRotate={false}
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI * 0.85} // Slightly more restrictive for Hamilton products
              minPolarAngle={Math.PI * 0.15} // Better viewing angles
              minDistance={isHamiltonProduct ? 0.5 : 2} // Allow closer zoom for Hamilton products
              maxDistance={isHamiltonProduct ? 12 : 20} // More reasonable max distance
              enableDamping={true}
              dampingFactor={isHamiltonProduct ? 0.05 : 0.08} // Much smoother damping for Hamilton products
              target={isHamiltonProduct ? rotationCenter : new THREE.Vector3(0, 0, 0)}
              minAzimuthAngle={-Infinity}
              maxAzimuthAngle={Infinity}
              zoomSpeed={isHamiltonProduct ? 0.3 : 0.8} // Slower, more controlled zoom for Hamilton products
              panSpeed={isHamiltonProduct ? 0.3 : 0.8} // Slower panning when enabled
              rotateSpeed={isHamiltonProduct ? 0.3 : 0.8} // Much slower rotation for precise control
              mouseButtons={{
                LEFT: isHamiltonProduct ? THREE.MOUSE.ROTATE : THREE.MOUSE.ROTATE,
                MIDDLE: isHamiltonProduct ? THREE.MOUSE.DOLLY : THREE.MOUSE.DOLLY,
                RIGHT: isHamiltonProduct ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN // Use right-click for rotation too on Hamilton products
              }}
              touches={{
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
              }}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Enhanced3DViewer;
