import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3 } from 'three';
import { AlertCircle, Box, Loader2 } from 'lucide-react';

interface Enhanced3DViewerOptimizedProps {
  modelPath: string;
  className?: string;
  onError?: () => void;
  onMissingModel?: (modelPath: string, productId?: string) => void;
  productId?: string;
  preloadModels?: string[]; // For preloading variant models
}

// Model cache for performance
const modelCache = new Map();
const loadingPromises = new Map();

const Model = ({ 
  url, 
  onError, 
  onMissingModel, 
  productId,
  onLoaded 
}: { 
  url: string; 
  onError?: () => void; 
  onMissingModel?: (modelPath: string, productId?: string) => void;
  productId?: string;
  onLoaded?: () => void;
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
        onLoaded?.();
        
        // Cache the loaded model
        modelCache.set(url, gltf);
        console.log('3D model loaded and cached:', url);
      }
    }, [gltf, onLoaded, url]);

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

const Enhanced3DViewerOptimized = ({ 
  modelPath, 
  className = '', 
  onError, 
  onMissingModel, 
  productId,
  preloadModels = []
}: Enhanced3DViewerOptimizedProps) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleError = useCallback(() => {
    setLoadError(true);
    setIsLoading(false);
    if (onMissingModel) {
      onMissingModel(modelPath, productId);
    }
    if (onError) onError();
  }, [modelPath, productId, onMissingModel, onError]);

  const handleLoaded = useCallback(() => {
    setIsLoading(false);
    setLoadingProgress(100);
  }, []);

  // Enhanced model path resolution optimized for Supabase
  const getModelPath = useCallback((path: string): string => {
    if (!path) return '';
    
    // Already a full URL (Supabase storage)
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Supabase storage pattern detection
    if (path.includes('supabase.co/storage') || path.includes('/storage/v1/object/')) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    
    // Local file paths
    if (path.startsWith('/')) {
      return path;
    }
    
    // Default: treat as relative path from public/products/
    if (path.startsWith('products/')) {
      return `/${path}`;
    }
    
    return `/products/${path}`;
  }, []);

  // Preload models for better performance
  useEffect(() => {
    const preloadModel = async (path: string) => {
      const resolvedPath = getModelPath(path);
      if (!resolvedPath || modelCache.has(resolvedPath) || loadingPromises.has(resolvedPath)) {
        return;
      }

      const promise = fetch(resolvedPath, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            console.log('Preloaded model available:', resolvedPath);
          }
        })
        .catch(error => {
          console.warn('Preload failed for:', resolvedPath, error);
        })
        .finally(() => {
          loadingPromises.delete(resolvedPath);
        });

      loadingPromises.set(resolvedPath, promise);
      return promise;
    };

    // Preload variant models in background
    preloadModels.forEach(modelPath => {
      if (modelPath && modelPath !== modelPath) {
        preloadModel(modelPath);
      }
    });
  }, [preloadModels, getModelPath, modelPath]);

  const resolvedModelPath = getModelPath(modelPath);

  useEffect(() => {
    if (resolvedModelPath) {
      setIsLoading(true);
      setLoadError(false);
      setLoadingProgress(10);
      
      // Check if model is cached
      if (modelCache.has(resolvedModelPath)) {
        setIsLoading(false);
        setLoadingProgress(100);
        return;
      }
      
      // Test if the model file exists with optimized timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout
      
      setLoadingProgress(30);
      
      fetch(resolvedModelPath, { 
        method: 'HEAD',
        signal: controller.signal
      })
        .then(response => {
          clearTimeout(timeoutId);
          setLoadingProgress(60);
          if (!response.ok && response.status !== 0) {
            throw new Error(`Model not found: ${response.status}`);
          }
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.warn('Model file check failed:', resolvedModelPath, error);
          // Don't set error immediately - let the loader handle it
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
        
        {/* Optimized Lighting Setup */}
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
            onLoaded={handleLoaded}
          />
        </Suspense>
      </Canvas>
      
      {/* Enhanced loading indicator with progress */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading 3D model...</span>
            </div>
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
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

export default Enhanced3DViewerOptimized;