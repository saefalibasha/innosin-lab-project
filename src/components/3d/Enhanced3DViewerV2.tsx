
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, Maximize, ZoomIn, ZoomOut } from 'lucide-react';

// Define the GLTF type properly
interface GLTFResult {
  scene: THREE.Group;
  nodes: { [key: string]: THREE.Object3D };
  materials: { [key: string]: THREE.Material };
  animations: THREE.AnimationClip[];
}

interface ModelProps {
  url: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

function Model({ url, onLoad, onError }: ModelProps) {
  const gltf = useLoader(GLTFLoader, url) as GLTFResult;
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (gltf && onLoad) {
      onLoad();
    }
  }, [gltf, onLoad]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  if (!gltf?.scene) {
    return null;
  }

  return (
    <primitive 
      ref={meshRef} 
      object={gltf.scene} 
      scale={1}
      position={[0, 0, 0]}
    />
  );
}

interface Enhanced3DViewerV2Props {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

const Enhanced3DViewerV2: React.FC<Enhanced3DViewerV2Props> = ({ 
  modelUrl, 
  className = '', 
  autoRotate = true,
  showControls = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleModelLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleModelError = (err: Error) => {
    setIsLoading(false);
    setError(err.message);
  };

  const resetView = () => {
    setZoom(1);
    // Reset camera position would require ref to controls
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Failed to load 3D model</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      {showControls && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setZoom(zoom * 1.2)}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setZoom(zoom * 0.8)}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Stage environment="city" adjustCamera intensity={0.5}>
            <Model 
              url={modelUrl} 
              onLoad={handleModelLoad}
              onError={handleModelError}
            />
          </Stage>
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
          />
          <Environment preset="apartment" background={false} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Enhanced3DViewerV2;
