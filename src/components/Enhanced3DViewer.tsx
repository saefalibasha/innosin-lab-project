
import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Box3, Vector3 } from 'three';
import { AlertCircle, Box } from 'lucide-react';

interface Enhanced3DViewerProps {
  modelPath: string;
  className?: string;
  onError?: () => void;
}

const Model = ({ url, onError }: { url: string; onError?: () => void }) => {
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
    if (onError) onError();
    return null;
  }
};

const Enhanced3DViewer = ({ modelPath, className = '', onError }: Enhanced3DViewerProps) => {
  const [loadError, setLoadError] = useState(false);

  const handleError = () => {
    setLoadError(true);
    if (onError) onError();
  };

  if (!modelPath || loadError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Unable to load 3D model</p>
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
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense 
          fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="gray" wireframe />
            </mesh>
          }
        >
          <Model url={modelPath} onError={handleError} />
        </Suspense>
      </Canvas>
      
      {/* Loading indicator */}
      <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default Enhanced3DViewer;
