import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import IsometricFloorPlanScene from './IsometricFloorPlanScene';
import { 
  PlacedProduct, 
  Point, 
  Door, 
  TextAnnotation, 
  WallSegment, 
  Room, 
  DrawingMode 
} from '@/types/floorPlanTypes';
import { MeasurementUnit } from '@/utils/measurements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, RotateCcw, Grid3X3, Move3D } from 'lucide-react';

interface EnhancedCanvasWorkspace3DProps {
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  selectedProducts: string[];
  onProductSelect: (productIds: string[]) => void;
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  doors: Door[];
  setDoors: (doors: Door[]) => void;
  textAnnotations: TextAnnotation[];
  setTextAnnotations: (annotations: TextAnnotation[]) => void;
  wallSegments: WallSegment[];
  setWallSegments: (segments: WallSegment[]) => void;
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  scale: number;
  currentMode: DrawingMode;
  showGrid: boolean;
  showMeasurements: boolean;
  gridSize: number;
  measurementUnit: MeasurementUnit;
  canvasWidth: number;
  canvasHeight: number;
  onClearAll: () => void;
  onWallUpdate?: (updatedWall: WallSegment) => void;
}

export const EnhancedCanvasWorkspace3D: React.FC<EnhancedCanvasWorkspace3DProps> = ({
  placedProducts,
  setPlacedProducts,
  selectedProducts,
  onProductSelect,
  doors,
  wallSegments,
  rooms,
  scale,
  showGrid,
  onClearAll,
  onWallUpdate,
}) => {
  const [showSnapGrid, setShowSnapGrid] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([10, 8, 10]);
  const controlsRef = useRef<any>();

  const handleProductClick = (productId: string) => {
    onProductSelect([productId]);
  };

  const handleSceneClick = () => {
    onProductSelect([]);
  };

  const handleProductUpdate = (productId: string, updates: Partial<PlacedProduct>) => {
    setPlacedProducts(
      placedProducts.map(product =>
        product.id === productId ? { ...product, ...updates } : product
      )
    );
  };

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const setCameraPreset = (preset: 'isometric' | 'top' | 'side' | 'front') => {
    const presets = {
      isometric: [10, 8, 10] as [number, number, number],
      top: [0, 15, 0.1] as [number, number, number],
      side: [15, 5, 0] as [number, number, number],
      front: [0, 5, 15] as [number, number, number],
    };
    setCameraPosition(presets[preset]);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: cameraPosition, fov: 60 }}
          style={{ background: 'linear-gradient(to bottom, #e3f2fd 0%, #bbdefb 100%)' }}
        >
          <PerspectiveCamera
            makeDefault
            position={cameraPosition}
            fov={60}
            near={0.1}
            far={1000}
          />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[20, 20, 10]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />

          {/* Orbit controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={50}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
          />

          {/* Scene */}
          <IsometricFloorPlanScene
            wallSegments={wallSegments}
            placedProducts={placedProducts}
            doors={doors}
            rooms={rooms}
            scale={scale}
            onProductClick={handleProductClick}
            onSceneClick={handleSceneClick}
            selectedProducts={selectedProducts}
            showSnapGrid={showSnapGrid}
            onProductUpdate={handleProductUpdate}
            onWallUpdate={onWallUpdate}
          />
        </Canvas>
      </div>

      {/* Control Panel Below Canvas */}
      <div className="bg-background border-t p-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Move3D className="w-4 h-4" />
              3D Floor Planner Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera Controls */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setCameraPreset('isometric')}>
                Isometric View
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCameraPreset('top')}>
                Top View
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCameraPreset('side')}>
                Side View
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCameraPreset('front')}>
                Front View
              </Button>
              <Button variant="outline" size="sm" onClick={resetCamera}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Camera
              </Button>
            </div>

            {/* View Controls */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showSnapGrid ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSnapGrid(!showSnapGrid)}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                {showSnapGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Snap Grid
              </Button>
              <Button variant="destructive" size="sm" onClick={onClearAll}>
                Clear All
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground">
              <p><strong>Controls:</strong> Left click + drag to rotate • Right click + drag to pan • Scroll to zoom</p>
              <p><strong>Selection:</strong> Click products to select • Click empty space to deselect</p>
              <p><strong>Dragging:</strong> Drag products directly in 3D space • Products snap to walls and grid</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedCanvasWorkspace3D;
