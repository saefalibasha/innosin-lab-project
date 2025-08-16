
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, Box } from 'lucide-react';
import * as THREE from 'three';

interface GLBModelProps {
  modelPath: string;
  onCenterCalculated?: (center: THREE.Vector3) => void;
  onLoadingStateChange?: (loading: boolean) => void;
  onError?: (error: string) => void;
}

const GLBModel: React.FC<GLBModelProps> = ({ 
  modelPath, 
  onCenterCalculated, 
  onLoadingStateChange,
  onError 
}) => {
  const [hovered, setHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  
  console.log('Attempting to load GLB model from:', modelPath);
  
  try {
    const { scene } = useGLTF(modelPath, true);
    
    // Handle loading success and model enhancement
    useEffect(() => {
      if (scene && groupRef.current && !isLoaded) {
        onLoadingStateChange?.(false);
        console.log('Successfully loaded GLB model:', modelPath);
        
        try {
          // Create a copy of the scene to avoid modifying the original
          const modelClone = scene.clone();
          
          // Enhanced material processing for better visibility
          modelClone.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                // Optimize materials for light background
                child.material.roughness = child.material.roughness || 0.5;
                child.material.metalness = child.material.metalness || 0.2;
                child.material.envMapIntensity = 0.6;
                
                // Ensure materials have good contrast against light background
                if (child.material.color) {
                  const hsl = { h: 0, s: 0, l: 0 };
                  child.material.color.getHSL(hsl);
                  
                  // If the material is too light, darken it slightly for better contrast
                  if (hsl.l > 0.8) {
                    child.material.color.setHSL(hsl.h, hsl.s, Math.max(0.3, hsl.l - 0.2));
                  }
                }
                
                // Optimize texture quality
                if (child.material.map) {
                  child.material.map.generateMipmaps = true;
                  child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                  child.material.map.magFilter = THREE.LinearFilter;
                  child.material.map.anisotropy = gl.capabilities.getMaxAnisotropy();
                }
                
                // Enhanced normal mapping for better feature definition
                if (child.material.normalMap) {
                  child.material.normalMap.generateMipmaps = true;
                  child.material.normalScale.set(1.2, 1.2);
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
            
            // Enhanced camera positioning for better feature visibility
            const boundingSphere = finalBox.getBoundingSphere(new THREE.Sphere());
            const radius = boundingSphere.radius;
            const distance = radius * 2.8;
            
            // Position camera for optimal viewing of laboratory furniture
            camera.position.set(
              actualCenter.x + distance * 0.8,
              actualCenter.y + distance * 0.5,
              actualCenter.z + distance * 0.8
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
          onError?.(`Failed to process 3D model: ${error}`);
        }
      }
    }, [scene, camera, isLoaded, modelPath, onCenterCalculated, gl, onLoadingStateChange, onError]);
    
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
  } catch (error) {
    console.error('Error loading GLB model:', error);
    onError?.(`Failed to load 3D model: ${error}`);
    return null;
  }
};

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <div className="text-sm text-gray-600">Loading 3D model...</div>
    </div>
  </div>
);

const ErrorFallback: React.FC<{ error?: Error; resetErrorBoundary?: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  console.log('Error boundary triggered for 3D model:', error);
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-white rounded-lg border-2 border-dashed border-red-200">
      <div className="text-center text-gray-600">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
        <div className="text-lg mb-2">3D Model Error</div>
        <div className="text-sm text-gray-400 mb-3">
          {error?.message || 'Unable to load 3D preview'}
        </div>
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
          Model needs to be uploaded or fixed in admin panel
        </div>
      </div>
    </div>
  );
};

interface Enhanced3DViewerProps {
  modelPath: string;
  className?: string;
  onModelLoadError?: (error: string) => void;
}

const Enhanced3DViewer: React.FC<Enhanced3DViewerProps> = ({ 
  modelPath,
  className = "w-full h-64",
  onModelLoadError
}) => {
  const [rotationCenter, setRotationCenter] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const handleLoadingStateChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
    onModelLoadError?.(errorMessage);
  };

  // Check if modelPath exists and is valid
  if (!modelPath || modelPath.trim() === '') {
    return (
      <div className={`${className} bg-gradient-to-b from-gray-50 to-white rounded-lg border-2 border-dashed border-amber-200`}>
        <div className="flex items-center justify-center h-full text-center text-gray-600">
          <div>
            <Box className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <div className="text-lg mb-2">No 3D Model</div>
            <div className="text-sm text-gray-400">3D model not available for this product</div>
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border mt-2">
              Upload required in admin panel
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${className} bg-gradient-to-b from-gray-50 to-white rounded-lg overflow-hidden border border-gray-200 relative`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
          <LoadingFallback />
        </div>
      )}
      
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={(error) => handleError(error.message)}
      >
        <Canvas 
          camera={{ position: [6, 4, 6], fov: 45 }}
          gl={{ 
            antialias: true,
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0
          }}
          onCreated={({ gl, scene }) => {
            setIsLoading(true);
            
            // Professional laboratory background
            const gradientTexture = new THREE.DataTexture(
              new Uint8Array([
                160, 160, 160, 255, // Medium gray top
                200, 200, 200, 255, // Light gray bottom
              ]),
              1, 2, THREE.RGBAFormat
            );
            gradientTexture.needsUpdate = true;
            
            // Create gradient background
            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.ShaderMaterial({
              uniforms: {
                topColor: { value: new THREE.Color(0xa0a0a0) },
                bottomColor: { value: new THREE.Color(0xc8c8c8) },
              },
              vertexShader: `
                varying vec2 vUv;
                void main() {
                  vUv = uv;
                  gl_Position = vec4(position, 1.0);
                }
              `,
              fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                varying vec2 vUv;
                void main() {
                  gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
                }
              `,
              depthWrite: false,
              depthTest: false,
            });
            
            const backgroundMesh = new THREE.Mesh(geometry, material);
            backgroundMesh.renderOrder = -1;
            scene.add(backgroundMesh);
            
            // Optimize renderer settings
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={null}>
            {/* Enhanced lighting setup */}
            <ambientLight intensity={0.5} color="#ffffff" />
            
            <directionalLight 
              position={[10, 10, 8]} 
              intensity={1.2} 
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            
            <directionalLight 
              position={[-8, 6, -6]} 
              intensity={0.4} 
              color="#ffffff"
            />
            
            <directionalLight 
              position={[0, 8, 0]} 
              intensity={0.3} 
              color="#ffffff"
            />
            
            <Environment 
              preset="studio" 
              background={false}
              environmentIntensity={0.5}
            />
            
            <GLBModel 
              modelPath={modelPath} 
              onCenterCalculated={handleCenterCalculated}
              onLoadingStateChange={handleLoadingStateChange}
              onError={handleError}
            />
            
            <OrbitControls 
              ref={orbitControlsRef}
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              autoRotate={false}
              maxPolarAngle={Math.PI * 0.8}
              minPolarAngle={Math.PI * 0.2}
              minDistance={2}
              maxDistance={12}
              enableDamping={true}
              dampingFactor={0.05}
              target={rotationCenter}
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
