import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const originalModelRef = useRef<THREE.Object3D | null>(null);
  
  console.log('Loading GLB model from:', modelPath);
  
  // Load the model with proper error handling
  let scene: THREE.Group | null = null;
  try {
    const gltf = useGLTF(modelPath, true);
    scene = gltf.scene;
  } catch (loadError) {
    console.error(`Failed to load GLB model: ${modelPath}`, loadError);
    setError(`Failed to load 3D model: ${loadError instanceof Error ? loadError.message : 'Unknown error'}`);
  }
  
  // Process and center the model
  useEffect(() => {
    if (scene && groupRef.current && !isLoaded && !error) {
      try {
        console.log('Processing GLB model for:', modelPath);
        
        // Clone the scene to avoid modifying the original
        const modelClone = scene.clone();
        originalModelRef.current = modelClone;
        
        // Enhance materials for better quality
        modelClone.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Enable shadows
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Enhance materials with PBR properties
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.roughness = child.material.roughness || 0.4;
              child.material.metalness = child.material.metalness || 0.1;
              child.material.envMapIntensity = 1.5;
              
              // Improve texture quality
              if (child.material.map) {
                child.material.map.generateMipmaps = true;
                child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                child.material.map.magFilter = THREE.LinearFilter;
              }
            }
          }
        });
        
        // Calculate bounding box for proper centering
        const box = new THREE.Box3().setFromObject(modelClone);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        if (size.length() > 0) {
          // Center the model at origin for natural rotation
          modelClone.position.set(-center.x, -center.y, -center.z);
          
          // Scale the model to fit the viewer
          const maxDimension = Math.max(size.x, size.y, size.z);
          const isHamiltonProduct = modelPath.includes('hls-product');
          const targetSize = isHamiltonProduct ? 2.5 : 3;
          const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
          
          modelClone.scale.setScalar(scale);
          
          // Clear and add the processed model
          groupRef.current.clear();
          groupRef.current.add(modelClone);
          
          console.log('Model processed successfully:', { 
            center: center.toArray(), 
            size: size.toArray(), 
            scale,
            isHamiltonProduct 
          });
          
          setIsLoaded(true);
        } else {
          throw new Error('Model has invalid dimensions');
        }
      } catch (err) {
        console.error(`Failed to process GLB model: ${modelPath}`, err);
        setError(`Failed to process 3D model: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  }, [scene, isLoaded, error, modelPath]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (originalModelRef.current) {
        originalModelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material?.dispose?.());
            } else {
              child.material?.dispose?.();
            }
          }
        });
      }
    };
  }, []);
  
  // Subtle floating animation
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
  
  // Error state
  if (error) {
    console.log('Model error state:', error);
    return null;
  }
  
  // Loading state
  if (!scene || !isLoaded) {
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

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  console.log('3D Viewer Error Boundary triggered:', error?.message);
  return (
    <div className="flex items-center justify-center h-full bg-white rounded-lg">
      <div className="text-muted-foreground text-center">
        <div className="text-lg mb-2">3D Model Unavailable</div>
        <div className="text-sm">Unable to load 3D preview</div>
        {error && (
          <div className="text-xs mt-2 text-red-500">
            {error.message}
          </div>
        )}
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
  const [canvasError, setCanvasError] = useState<string | null>(null);
  
  console.log('Enhanced3DViewer rendering with modelPath:', modelPath);
  
  const isHamiltonProduct = modelPath.includes('hls-product');
  
  // Handle WebGL context loss
  const handleWebGLContextLost = useCallback((event: Event) => {
    event.preventDefault();
    console.warn('WebGL context lost, attempting recovery...');
    setCanvasError('WebGL context lost - refreshing...');
    
    // Attempt to recover after a short delay
    setTimeout(() => {
      setCanvasError(null);
    }, 1000);
  }, []);
  
  // Handle WebGL context restored
  const handleWebGLContextRestored = useCallback(() => {
    console.log('WebGL context restored');
    setCanvasError(null);
  }, []);
  
  if (canvasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center`}>
        <div className="text-muted-foreground text-center">
          <div className="text-sm">{canvasError}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-100`}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas 
          camera={{ 
            position: isHamiltonProduct ? [4, 2, 4] : [5, 3, 5], 
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          shadows
          gl={{ 
            antialias: true, 
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: isHamiltonProduct ? 1.0 : 1.2,
            powerPreference: "high-performance"
          }}
          onCreated={({ gl, camera }) => {
            // Enable shadows
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Set up WebGL context loss handlers
            gl.domElement.addEventListener('webglcontextlost', handleWebGLContextLost);
            gl.domElement.addEventListener('webglcontextrestored', handleWebGLContextRestored);
            
            // Set camera target to origin for natural rotation
            camera.lookAt(0, 0, 0);
            
            console.log('Canvas created with camera at:', camera.position.toArray());
          }}
        >
          <Suspense fallback={null}>
            {/* HDR Environment for realistic reflections and lighting */}
            <Environment 
              preset={isHamiltonProduct ? "warehouse" : "studio"} 
              background={false}
              environmentIntensity={isHamiltonProduct ? 0.5 : 0.6}
            />
            
            {/* Optimized lighting setup */}
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
              enablePan={false}
              enableRotate={true}
              autoRotate={false}
              target={[0, 0, 0]}
              maxPolarAngle={Math.PI * 0.9}
              minPolarAngle={Math.PI * 0.1}
              minDistance={isHamiltonProduct ? 2 : 1.5}
              maxDistance={isHamiltonProduct ? 12 : 15}
              enableDamping={true}
              dampingFactor={0.05}
              zoomSpeed={0.8}
              panSpeed={0.8}
              rotateSpeed={0.8}
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
