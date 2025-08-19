
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { AlertCircle, Loader2 } from 'lucide-react';
import { usePerformanceLogger } from '@/hooks/usePerformanceLogger';

interface OptimizedProductViewer3DProps {
  modelPath: string;
  productName: string;
  onLoadComplete?: () => void;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p className="text-sm">Loading 3D model...</p>
    </div>
  </div>
);

const ErrorFallback = ({ modelPath }: { modelPath: string }) => (
  <div className="flex items-center justify-center h-full bg-muted/20">
    <div className="text-center text-muted-foreground p-6">
      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
      <p className="text-lg font-medium mb-2">3D Model Not Available</p>
      <p className="text-sm mb-2">Preview will be available soon</p>
      <p className="text-xs opacity-60">Path: {modelPath}</p>
    </div>
  </div>
);

const Simple3DPlaceholder = ({ productName }: { productName: string }) => (
  <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center relative">
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </Canvas>
    <div className="absolute bottom-4 left-4 right-4 text-center">
      <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3">
        <p className="text-sm font-medium">{productName}</p>
        <p className="text-xs text-muted-foreground mt-1">3D Preview</p>
      </div>
    </div>
  </div>
);

const OptimizedProductViewer3D: React.FC<OptimizedProductViewer3DProps> = ({ 
  modelPath, 
  productName, 
  onLoadComplete 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  usePerformanceLogger('OptimizedProductViewer3D');

  // Quick check if model exists - if not, show placeholder immediately
  React.useEffect(() => {
    if (!modelPath || modelPath.includes('PLACEHOLDER')) {
      setHasError(true);
      setIsLoading(false);
      onLoadComplete?.();
      return;
    }

    // Timeout for model loading
    const timeout = setTimeout(() => {
      setIsLoading(false);
      onLoadComplete?.();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [modelPath, onLoadComplete]);

  if (hasError || !modelPath) {
    return <Simple3DPlaceholder productName={productName} />;
  }

  return (
    <div className="w-full h-full min-h-[400px] relative">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <LoadingFallback />
        </div>
      )}
      <div className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
        <Simple3DPlaceholder productName={productName} />
      </div>
    </div>
  );
};

export default OptimizedProductViewer3D;
