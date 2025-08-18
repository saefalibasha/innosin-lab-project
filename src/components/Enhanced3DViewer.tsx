
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Box, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { GLTFModel } from './3d/GLTFModel';
import { useMissingModelsTracker } from '@/hooks/useMissingModelsTracker';

interface Enhanced3DViewerProps {
  modelPath?: string;
  productName: string;
  productId: string;
  className?: string;
  showControls?: boolean;
  autoRotate?: boolean;
  onError?: () => void;
}

const Enhanced3DViewer = ({ 
  modelPath, 
  productName, 
  productId,
  className = "", 
  showControls = true,
  autoRotate = false,
  onError 
}: Enhanced3DViewerProps) => {
  const [modelError, setModelError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const controlsRef = useRef<any>();
  const { trackMissingModel } = useMissingModelsTracker();

  // Enhanced model path resolution
  const getResolvedModelPath = (path?: string): string | null => {
    if (!path) return null;

    // Handle absolute URLs (Supabase storage)
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Handle relative paths starting with /
    if (path.startsWith('/')) {
      return path;
    }

    // Handle paths without leading slash
    if (!path.startsWith('/')) {
      return `/${path}`;
    }

    return path;
  };

  const resolvedModelPath = getResolvedModelPath(modelPath);

  // Track missing models when path is not available
  useEffect(() => {
    if (!resolvedModelPath) {
      console.warn(`❌ No model path available for product: ${productName} (${productId})`);
      trackMissingModel(productId, productName);
      setModelError(true);
      setIsLoading(false);
    } else {
      console.log(`✅ Model path resolved: ${resolvedModelPath}`);
      setModelError(false);
    }
  }, [resolvedModelPath, productId, productName, trackMissingModel]);

  const handleModelLoad = () => {
    console.log(`✅ 3D Model loaded successfully: ${productName}`);
    setIsLoading(false);
    setModelError(false);
  };

  const handleModelError = (error: any) => {
    console.error(`❌ Failed to load 3D model for ${productName}:`, error);
    setModelError(true);
    setIsLoading(false);
    trackMissingModel(productId, productName);
    if (onError) {
      onError();
    }
  };

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  // Loading state
  if (isLoading && resolvedModelPath) {
    return (
      <Card className={`aspect-square bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200 ${className}`}>
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="font-semibold text-slate-700 mb-2">Loading 3D Model</h3>
          <p className="text-sm text-slate-500">{productName}</p>
          <Badge variant="outline" className="mt-2">
            {modelPath?.split('/').pop() || 'model.glb'}
          </Badge>
        </div>
      </Card>
    );
  }

  // Error state or no model path
  if (modelError || !resolvedModelPath) {
    return (
      <Card className={`aspect-square bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200 ${className}`}>
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-100 rounded-full p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-2">3D Model Unavailable</h3>
          <p className="text-sm text-slate-500 mb-4">
            {!resolvedModelPath 
              ? 'No 3D model configured for this product'
              : 'Failed to load 3D model'
            }
          </p>
          <Badge variant="secondary" className="mb-2">
            {productName}
          </Badge>
          {resolvedModelPath && (
            <p className="text-xs text-slate-400 font-mono break-all">
              Path: {resolvedModelPath}
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`aspect-square relative overflow-hidden ${className}`}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="w-full h-full"
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <GLTFModel 
            url={resolvedModelPath}
            onLoad={handleModelLoad}
            onError={handleModelError}
            scale={zoom}
          />
          <Environment preset="studio" />
          <ContactShadows 
            position={[0, -1.4, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={1.5} 
            far={4.5} 
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          maxPolarAngle={Math.PI}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Model Info Badge */}
      <div className="absolute bottom-4 left-4">
        <Badge variant="secondary" className="bg-white/90">
          <Box className="h-3 w-3 mr-1" />
          3D Model
        </Badge>
      </div>
    </Card>
  );
};

export default Enhanced3DViewer;
