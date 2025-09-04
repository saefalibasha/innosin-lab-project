import React, { useRef, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode } from '@/types/floorPlanTypes';
import { MeasurementUnit } from '@/utils/measurements';
import IsometricFloorPlanScene from './IsometricFloorPlanScene';
import { toast } from 'sonner';
import * as THREE from 'three';
import { doesProductOverlapWall } from '@/utils/collisionDetection';

interface EnhancedCanvasWorkspace3DProps {
  roomPoints: Point[];
  setRoomPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  wallSegments: WallSegment[];
  setWallSegments: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  placedProducts: PlacedProduct[];
  setPlacedProducts: React.Dispatch<React.SetStateAction<PlacedProduct[]>>;
  doors: Door[];
  setDoors: React.Dispatch<React.SetStateAction<Door[]>>;
  textAnnotations: TextAnnotation[];
  setTextAnnotations: React.Dispatch<React.SetStateAction<TextAnnotation[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  scale: number;
  currentMode: DrawingMode;
  showGrid: boolean;
  showMeasurements: boolean;
  gridSize: number;
  measurementUnit: MeasurementUnit;
  canvasWidth: number;
  canvasHeight: number;
  onClearAll: () => void;
  selectedProducts: string[];
  onProductSelect: React.Dispatch<React.SetStateAction<string[]>>;
  onWallUpdate?: (wall: WallSegment) => void;
}

const EnhancedCanvasWorkspace3D: React.FC<EnhancedCanvasWorkspace3DProps> = ({
  roomPoints,
  wallSegments,
  placedProducts,
  setPlacedProducts,
  doors,
  rooms,
  scale,
  currentMode,
  showGrid,
  selectedProducts,
  onProductSelect,
  onWallUpdate
}) => {
  const htmlRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();

  const handleProductClick = useCallback((productId: string) => {
    if (currentMode === 'select') {
      onProductSelect(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    }
  }, [currentMode, onProductSelect]);

  const handleWallClick = useCallback((wallId: string) => {
    if (currentMode === 'select') {
      const wall = wallSegments.find(w => w.id === wallId);
      if (wall && onWallUpdate) {
        onWallUpdate(wall);
      }
    }
  }, [currentMode, wallSegments, onWallUpdate]);

  const handleSceneClick = useCallback((e: any) => {
    if (e.object.name !== 'product' && e.object.name !== 'wall') {
      onProductSelect([]);
    }
  }, [onProductSelect]);

  const handleCanvasDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const productData = e.dataTransfer.getData('product');
    if (!productData) return;

    try {
      const product = JSON.parse(productData);

      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, cameraRef.current);

      const floor = sceneRef.current.children.find(obj => obj.name === 'floor-drop-plane');
      if (!floor) {
        toast.error('Drop target not found');
        return;
      }

      const intersects = raycaster.intersectObject(floor);
      if (intersects.length === 0) {
        toast.error('Cannot place item outside of floor');
        return;
      }

      const point = intersects[0].point;

      const position = {
        x: point.x,
        y: point.z // Map Z → Y for 2D plane
      };

      const tempProduct: PlacedProduct = {
        id: `product-${Date.now()}`,
        productId: product.id,
        name: product.name,
        category: product.category || 'Unknown',
        position,
        rotation: 0,
        dimensions: product.dimensions,
        color: product.color,
        scale: 1,
        modelPath: product.modelPath,
        thumbnail: product.thumbnail,
        description: product.description,
        specifications: product.specifications,
        finishes: product.finishes,
        variants: product.variants
      };

      // ✅ Clash detection
      const overlaps = wallSegments.some(wall =>
        doesProductOverlapWall(tempProduct, wall, scale)
      );

      if (overlaps) {
        toast.error('Cannot place product — overlaps with wall');
        return;
      }

      setPlacedProducts(prev => [...prev, tempProduct]);
      toast.success(`Added ${product.name} to floor plan`);
    } catch (error) {
      console.error('Error parsing dropped product:', error);
      toast.error('Failed to add product');
    }
  }, [scale, setPlacedProducts, wallSegments]);

  return (
    <div
      ref={htmlRef}
      className="relative w-full h-full bg-gray-50"
      onDrop={handleCanvasDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <IsometricFloorPlanScene
        wallSegments={wallSegments}
        placedProducts={placedProducts}
        doors={doors}
        rooms={rooms}
        scale={scale}
        onProductClick={handleProductClick}
        onWallClick={handleWallClick}
        onSceneClick={handleSceneClick}
        selectedProducts={selectedProducts}
        showGrid={showGrid}
        sceneRef={sceneRef}
        cameraRef={cameraRef}
        rendererRef={rendererRef}
      />

      {/* Mode indicator */}
      <div className="absolute top-4 left-4 bg-background/90 rounded-md px-3 py-2 text-sm font-medium">
        Mode: {currentMode}
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 bg-background/90 rounded-md px-3 py-2 text-xs space-y-1">
        <div>Products: {placedProducts.length}</div>
        <div>Walls: {wallSegments.length}</div>
        <div>Rooms: {rooms.length}</div>
        {selectedProducts.length > 0 && (
          <div className="text-primary">Selected: {selectedProducts.length}</div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-background/90 rounded-md px-3 py-2 text-xs text-muted-foreground">
        <div>• Drag to rotate view</div>
        <div>• Scroll to zoom</div>
        <div>• Click objects to select</div>
        <div>• Drag products from library</div>
      </div>
    </div>
  );
};

export default EnhancedCanvasWorkspace3D;
