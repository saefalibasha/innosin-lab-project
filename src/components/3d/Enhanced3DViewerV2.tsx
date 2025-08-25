
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box } from 'three';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, RotateCw, AlertCircle } from 'lucide-react';

interface ModelProps {
  url: string;
  onLoad?: (model: any) => void;
  onError?: (error: any) => void;
}

const Model: React.FC<ModelProps> = ({ url, onLoad, onError }) => {
  const modelRef = useRef<THREE.Group>(null);
  
  try {
    const gltf = useLoader(GLTFLoader, url);
    
    useEffect(() => {
      if (gltf && modelRef.current) {
        // Center the model
        const box = new Box().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center);
        
        // Scale the model to fit
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        gltf.scene.scale.setScalar(scale);
        
        onLoad?.(gltf);
      }
    }, [gltf, onLoad]);

    useFrame(() => {
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }
    });

    return (
      <group ref={modelRef}>
        <primitive object={gltf.scene} />
      </group>
    );
  } catch (error) {
    onError?.(error);
    return null;
  }
};

interface Enhanced3DViewerV2Props {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

export const Enhanced3DViewerV2: React.FC<Enhanced3DViewerV2Props> = ({
  modelUrl,
  className = "",
  autoRotate = true,
  showControls = true
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const controlsRef = useRef<any>();

  const handleModelLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleModelError = (err: any) => {
    console.error('3D Model loading error:', err);
    setLoading(false);
    setError('Failed to load 3D model');
  };

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      setZoom(1);
    }
  };

  const zoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(0.8);
      controlsRef.current.update();
      setZoom(prev => prev * 1.2);
    }
  };

  const zoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(0.8);
      controlsRef.current.update();
      setZoom(prev => prev / 1.2);
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Enhanced Lighting Setup */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />
          
          {/* Environment for better reflections */}
          <Environment preset="studio" />
          
          {/* 3D Model */}
          <Model 
            url={modelUrl} 
            onLoad={handleModelLoad}
            onError={handleModelError}
          />
          
          {/* Camera and Controls */}
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            minDistance={1}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>

      {/* Control Buttons */}
      {showControls && !loading && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={zoomIn}
            className="p-2"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={zoomOut}
            className="p-2"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={resetView}
            className="p-2"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
