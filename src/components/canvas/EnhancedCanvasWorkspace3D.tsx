import React, { useRef, useCallback } from 'react';
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
import * as THREE from 'three';
import { worldTo2DCanvas } from '@/utils/coordinateUtils';
import { wallsToPolygon, rectInsidePolygon } from '@/utils/polygonUtils';

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
  onWallSelect?: (wallId: string) => void;
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
  onWallSelect,
}) => {
  const htmlRef = useRef<HTMLDivElement>(null);
  const sceneRef3D = useRef<any>(null);

  const handleSceneReady = useCallback((context: {
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    gl: THREE.WebGLRenderer;
  }) => {
    sceneRef3D.current = context;
  }, []);

  const handleProductClick = useCallback(
    (productId: string) => {
      if (currentMode === 'select') {
        onProductSelect((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
      }
    },
    [currentMode, onProductSelect]
  );

  const handleWallClick = useCallback(
    (wallId: string) => {
      if (currentMode === 'select') {
        onWallSelect?.(wallId);
      }
    },
    [currentMode, onWallSelect]
  );

  const handleSceneClick = useCallback(
    (e: any) => {
      if (e.object.name !== 'product' && e.object.name !== 'wall') {
        onProductSelect([]);
      }
    },
    [onProductSelect]
  );

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const productData = e.dataTransfer.getData('product');
      if (!productData) return;

      try {
        const product = JSON.parse(productData);

        const { camera, scene, gl } = sceneRef3D.current;
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        const rect = gl.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        const floor = scene.children.find((obj: any) => obj.name === 'floor-drop-plane');
        if (!floor) {
          toast.error('Drop target not found');
          return;
        }

        const intersects = raycaster.intersectObject(floor);
        if (intersects.length === 0) {
          toast.error('Cannot place item outside of floor');
          return;
        }

        const point = intersects[0].point; // meters
        const canvasPos = worldTo2DCanvas(point.x, point.z, scale);

        // Validate that the product is placed within walls using shared utils
        if (wallSegments && wallSegments.length > 0) {
          const polygon = wallsToPolygon(wallSegments);
          if (polygon && polygon.length >= 3) {
            const productWidth = (product.width || 600); // in mm
            const productDepth = (product.depth || 600); // in mm
            
            const isInside = rectInsidePolygon(
              canvasPos,
              productWidth * scale, // Convert to canvas units
              productDepth * scale,
              0, // No rotation for validation
              polygon
            );
            
            if (!isInside) {
              toast.error('Product must be placed within the walls');
              return; // Don't place the product
            }
          }
        }

        const newProduct: PlacedProduct = {
          id: `product-${Date.now()}`,
          productId: product.id,
          name: product.name,
          category: product.category || 'Unknown',
          position: canvasPos,
          rotation: 0,
          dimensions: product.dimensions,
          originalDimensions: {
            length: product.depth || 600,
            width: product.width || 600,
            height: product.height || 850
          },
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
    [setPlacedProducts, wallSegments, scale]
  );

  // Update function for drag actions in scene
  const handleProductUpdate = useCallback(
    (productId: string, updates: Partial<PlacedProduct>) => {
      setPlacedProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
    },
    [setPlacedProducts]
  );

  const origin = { minX: 0, minY: 0 };

  return (
    <div ref={htmlRef} className="relative w-full h-full bg-gray-50" onDrop={handleCanvasDrop} onDragOver={(e) => e.preventDefault()}>
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
        origin={origin}
        onProductUpdate={handleProductUpdate}
      />

      {/* Clean UI - moved stats to controls below */}
    </div>
  );
};

export default EnhancedCanvasWorkspace3D;
