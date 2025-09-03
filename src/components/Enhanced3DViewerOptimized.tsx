import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Box3, Vector3, DoubleSide } from 'three';
import { AlertCircle, Loader2 } from 'lucide-react';

interface Enhanced3DViewerOptimizedProps {
  modelPath: string;
  className?: string;
  onError?: () => void;
  onMissingModel?: (modelPath: string, productId?: string) => void;
  productId?: string;
  preloadModels?: string[];
}

const modelCache = new Map();

const Model = ({
  url,
  onError,
  onMissingModel,
  productId,
  onLoaded,
}: {
  url: string;
  onError?: () => void;
  onMissingModel?: (modelPath: string, productId?: string) => void;
  productId?: string;
  onLoaded?: () => void;
}) => {
  const meshRef = useRef<any>();
  const { controls } = useThree();
  const gltf = useLoader(GLTFLoader, url);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (gltf && meshRef.current) {
      const box = new Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      // Center the model
      gltf.scene.position.sub(center);

      // Scale the model
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scale = 2.5 / maxDim;
        gltf.scene.scale.setScalar(scale);
      }

      // Force materials to be double-sided for better visibility
      gltf.scene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          child.material.side = DoubleSide;
          child.material.needsUpdate = true;
        }
      });

      // Set rotation point to center
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }

      setModelLoaded(true);
      onLoaded?.();

      modelCache.set(url, gltf);
      console.log('✅ 3D model loaded and centered:', url);
    }
  }, [gltf, onLoaded, url, controls]);

  useFrame(() => {
    if (meshRef.current && modelLoaded) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return <primitive ref={meshRef} object={gltf.scene} />;
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
  preloadModels = [],
}: Enhanced3DViewerOptimizedProps) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const handleError = useCallback(() => {
    setLoadError(true);
    setIsLoading(false);
    if (onMissingModel) onMissingModel(modelPath, productId);
    if (onError) onError();
  }, [modelPath, productId, onMissingModel, onError]);

  const handleLoaded = useCallback(() => {
    setIsLoading(false);
    setLoadingProgress(100);
  }, []);

  const getModelPath = useCallback((path: string): string => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/products/${path}`;
  }, []);

  const resolvedModelPath = getModelPath(modelPath);

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
            <p className="text-xs text-muted-foreground mt-2">Model request logged for upload</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4.5]} />
        <OrbitControls
          enableZoom
          enablePan
          enableRotate
          maxDistance={10}
          minDistance={1}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />

        {/* 🔆 Enhanced lighting */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2.5} />
        <directionalLight position={[-5, -5, -5]} intensity={1.8} />
        <directionalLight position={[0, 10, 0]} intensity={1.5} />

        {/* 🌍 Ambient bounce via environment lighting */}
        <Suspense fallback={null}>
          <Environment preset="city" background={false} />
        </Suspense>

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

      {/* ⏳ Loading overlay */}
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

      {/* 🕹️ Controls help */}
      <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default Enhanced3DViewerOptimized;
