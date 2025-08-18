
import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { AlertCircle, Box, Loader2 } from 'lucide-react';

interface Enhanced3DViewerProps {
  modelPath: string;
  className?: string;
  onError?: () => void;
  onMissingModel?: (modelPath: string, productId?: string) => void;
  productId?: string;
}

const Model = ({ url, onError, onMissingModel, productId }: { 
  url: string; 
  onError?: () => void; 
  onMissingModel?: (modelPath: string, productId?: string) => void;
  productId?: string;
}) => {
  const meshRef = useRef<any>();
  const [modelLoaded, setModelLoaded] = useState(false);
  
  try {
    const gltf = useLoader(GLTFLoader, url);
    
    useEffect(() => {
      if (gltf && meshRef.current) {
        // Auto-center and scale the model
        const box = new Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new Vector3());
        const size = box.getSize(new Vector3());
        
        // Center the model
        gltf.scene.position.sub(center);
        
        // Scale the model to fit in a reasonable size
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = 2 / maxDim;
          gltf.scene.scale.setScalar(scale);
        }
        
        setModelLoaded(true);
        console.log('3D model loaded successfully:', url);
      }
    }, [gltf]);

    useFrame((state) => {
      if (meshRef.current && modelLoaded) {
        // Subtle rotation animation
        meshRef.current.rotation.y += 0.005;
      }
    });

    return <primitive ref={meshRef} object={gltf.scene} />;
  } catch (error) {
    console.error('Failed to load 3D model:', url, error);
    if (onMissingModel) {
      onMissingModel(url, productId);
    }
    if (onError) onError();
    return null;
  }
};

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#8b5cf6" wireframe />
  </mesh>
);

const Enhanced3DViewer = ({ 
  modelPath, 
  className = '', 
  onError, 
  onMissingModel, 
  productId 
}: Enhanced3DViewerProps) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setLoadError(true);
    setIsLoading(false);
    if (onMissingModel) {
      onMissingModel(modelPath, productId);
    }
    if (onError) onError();
  };

  // Enhanced model path resolution
  const getModelPath = (path: string): string => {
    if (!path) return '';
    
    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // If it starts with '/', treat as absolute path from public folder
    if (path.startsWith('/')) {
      return path;
    }
    
    // If it's a relative path, ensure it starts from public folder
    if (!path.startsWith('/products/') && !path.startsWith('products/')) {
      return `/products/${path}`;
    }
    
    return path.startsWith('/') ? path : `/${path}`;
  };

  const resolvedModelPath = getModelPath(modelPath);

  useEffect(() => {
    if (resolvedModelPath) {
      setIsLoading(true);
      setLoadError(false);
      
      // Test if the model file exists
      fetch(resolvedModelPath, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Model not found: ${response.status}`);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.warn('Model file check failed:', resolvedModelPath, error);
          setIsLoading(false);
          // Don't set error here, let the actual loader handle it
        });
    }
  }, [resolvedModelPath]);

  if (!resolvedModelPath || loadError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">3D model not available</p>
          <p className="text-xs text-muted-foreground">
            {resolvedModelPath ? `Path: ${resolvedModelPath}` : 'No model path provided'}
          </p>
          {onMissingModel && (
            <p className="text-xs text-muted-foreground mt-2">
              Model request logged for upload
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxDistance={10}
          minDistance={1}
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.05}
        />
        
        {/* Enhanced Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <directionalLight position={[0, 10, 0]} intensity={0.3} />
        
        <Suspense fallback={<LoadingFallback />}>
          <Model 
            url={resolvedModelPath} 
            onError={handleError} 
            onMissingModel={onMissingModel}
            productId={productId}
          />
        </Suspense>
      </Canvas>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading 3D model...</span>
          </div>
        </div>
      )}
      
      {/* Controls indicator */}
      <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default Enhanced3DViewer;
