import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'; // ✅ Corrected import
import { Box3, Vector3, Group } from 'three';
import { AlertCircle, Loader2 } from 'lucide-react'; // ✅ Removed invalid `Box` import
import * as THREE from 'three';

interface Enhanced3DViewerV2Props {
  modelPath: string;
  className?: string;
  onError?: () => void;
  onMissingModel?: (modelPath: string, productId?: string) => void;
  productId?: string;
}

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
  const groupRef = useRef<Group>(null);
  const { viewport } = useThree();
  const [modelLoaded, setModelLoaded] = useState(false);

  const gltf = useLoader(GLTFLoader, url);

  useEffect(() => {
    if (gltf && groupRef.current) {
      groupRef.current.clear();

      const modelClone = gltf.scene.clone();
      const box = new Box3().setFromObject(modelClone);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());

      modelClone.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const containerSize = Math.min(viewport.width, viewport.height) * 0.8;
        const scale = containerSize / maxDim;
        modelClone.scale.setScalar(scale);
      }

      groupRef.current.add(modelClone);

      setModelLoaded(true);
      onLoaded?.();

      if (!modelCache.has(url)) {
        modelCache.set(url, gltf);
      }

      console.log('3D model loaded and centered:', url);
    }
  }, [gltf, onLoaded, url, viewport]);

  useFrame(() => {
    if (groupRef.current && modelLoaded) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return <group ref={groupRef} />;
};

const LoadingFallback = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
  );
};

const Enhanced3DViewerV2 = ({
  modelPath,
  className = '',
  onError,
  onMissingModel,
  productId
}: Enhanced3DViewerV2Props) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const getModelPath = useCallback((path: string): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.includes('supabase.co/storage') || path.includes('/storage/v1/object/')) return `/${path}`;
    if (path.startsWith('/')) return path;
    if (path.startsWith('products/')) return `/${path}`;
    return `/products/${path}`;
  }, []);

  const resolvedModelPath = getModelPath(modelPath);

  useEffect(() => {
    if (resolvedModelPath) {
      setIsLoading(true);
      setLoadError(false);
      setLoadingProgress(10);

      if (modelCache.has(resolvedModelPath)) {
        setIsLoading(false);
        setLoadingProgress(100);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      setLoadingProgress(30);

      fetch(resolvedModelPath, {
        method: 'HEAD',
        signal: controller.signal
      })
        .then(response => {
          clearTimeout(timeoutId);
          setLoadingProgress(60);
          if (!response.ok && response.status !== 0) throw new Error(`Model not found: ${response.status}`);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.warn('Model file check failed:', resolvedModelPath, error);
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
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 3], fov: 50 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 3]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-10, 5, 5]} intensity={0.8} />
        <directionalLight position={[0, 10, 0]} intensity={0.6} />
        <directionalLight position={[5, -5, 5]} intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.5} />
        <pointLight position={[-5, -5, 5]} intensity={0.3} />

        <Suspense fallback={null}>
          <Environment preset="studio" background={false} environmentIntensity={0.8} />
        </Suspense>

        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.2}
          scale={3}
          blur={2}
          far={2}
          resolution={256}
        />

        <Suspense fallback={<LoadingFallback />}>
          <Model
            url={resolvedModelPath}
            onError={handleError}
            onMissingModel={onMissingModel}
            productId={productId}
            onLoaded={handleLoaded}
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxDistance={8}
          minDistance={1}
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>

      {isLoading && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">Loading 3D model...</span>
            </div>
            <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {loadingProgress}% complete
            </p>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 px-3 py-2 rounded-md backdrop-blur-sm">
        <div className="space-y-1">
          <div>Drag to rotate</div>
          <div>Scroll to zoom</div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DViewerV2;
