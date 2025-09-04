import React, { useRef, useCallback } from 'react';
import * as THREE from 'three'; // ✅ for raycasting
import {
  Point,
  PlacedProduct,
  Door,
  TextAnnotation,
  WallSegment,
  Room,
  DrawingMode,
} from '@/types/floorPlanTypes';
import { MeasurementUnit } from '@/utils/measurements';
import IsometricFloorPlanScene from './IsometricFloorPlanScene';
import { toast } from 'sonner';

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
  setRoomPoints,
  wallSegments,
  setWallSegments,
  placedProducts,
  setPlacedProducts,
  doors,
  setDoors,
  textAnnotations,
  setTextAnnotations,
  rooms,
  setRooms,
  scale,
  currentMode,
  showGrid,
  showMeasurements,
  gridSize,
  measurementUnit,
  canvasWidth,
  canvasHeight,
  onClearAll,
  selectedProducts,
  onProductSelect,
  onWallUpdate,
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.Camera | null>(null); // ✅ capture R3F camera

  const handleProductClick = useCallback(
    (productId: string) => {
      if (currentMode === 'select') {
        onProductSelect((prev) =>
          prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId],
        );
      }
    },
    [currentMode, onProductSelect],
  );

  const handleWallClick = useCallback(
    (wallId: string) => {
      if (currentMode === 'select') {
        const wall = wallSegments.find((w) => w.id === wallId);
        if (wall && onWallUpdate) {
          onWallUpdate(wall);
        }
      }
    },
    [currentMode, wallSegments, onWallUpdate],
  );

  const handleSceneClick = useCallback(
    (e: any) => {
      // Clear selection when clicking on empty space
      if (e.object.name !== 'product' && e.object.name !== 'wall') {
        onProductSelect([]);
      }
    },
    [onProductSelect],
  );

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const productData = e.dataTransfer.getData('product');
      if (!productData) return;

      try {
        const product = JSON.parse(productData);
        const rect = sceneRef.current?.getBoundingClientRect();
        if (!rect || !cameraRef.current) return;

        // ✅ 1. Convert mouse coords → Normalized Device Coordinates
        const ndc = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -(((e.clientY - rect.top) / rect.height) * 2 - 1),
        );

        // ✅ 2. Raycast from camera → plane (y=0)
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(ndc, cameraRef.current);

        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // ground plane
        const hit = new THREE.Vector3();
        const didHit = raycaster.ray.intersectPlane(plane, hit);
        if (!didHit) return;

        // ✅ 3. Place product at hit point (x,z) with y=0
        const newProduct: PlacedProduct = {
          id: `product-${Date.now()}`,
          productId: product.id,
          name: product.name,
          category: product.category || 'Unknown',
          position: {
            x: hit.x, // world X
            y: hit.z, // world Z
          },
          rotation: 0,
          dimensions: product.dimensions,
          color: product.color,
          scale: 1,
          modelPath: product.modelPath,
          thumbnail: product.thumbnail,
          description: product.description,
          specifications: product.specifications,
          finishes: product.finishes,
          variants: product.variants,
        };

        setPlacedProducts((prev) => [...prev, newProduct]);
        toast.success(`Added ${product.name} to floor plan`);
      } catch (error) {
        console.error('Error parsing dropped product:', error);
        toast.error('Failed to add product');
      }
    },
    [setPlacedProducts],
  );

  return (
    <div
      ref={sceneRef}
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
        // ✅ Capture camera from R3F
        onReady={({ camera }) => {
          cameraRef.current = camera;
        }}
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
          <div className="text-primary">
            Selected: {selectedProducts.length}
          </div>
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
