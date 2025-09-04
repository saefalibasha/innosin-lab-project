import React, { useRef, useCallback } from "react";
import {
  Point,
  PlacedProduct,
  Door,
  TextAnnotation,
  WallSegment,
  Room,
  DrawingMode,
} from "@/types/floorPlanTypes";
import { MeasurementUnit } from "@/utils/measurements";
import IsometricFloorPlanScene from "./IsometricFloorPlanScene";
import { toast } from "sonner";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

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

  const handleProductClick = useCallback(
    (productId: string) => {
      if (currentMode === "select") {
        onProductSelect((prev) =>
          prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId]
        );
      }
    },
    [currentMode, onProductSelect]
  );

  const handleWallClick = useCallback(
    (wallId: string) => {
      if (currentMode === "select") {
        const wall = wallSegments.find((w) => w.id === wallId);
        if (wall && onWallUpdate) {
          onWallUpdate(wall);
        }
      }
    },
    [currentMode, wallSegments, onWallUpdate]
  );

  const handleSceneClick = useCallback(
    (e: any) => {
      // Clear selection when clicking on empty space
      if (e.object.name !== "product" && e.object.name !== "wall") {
        onProductSelect([]);
      }
    },
    [onProductSelect]
  );

  // ✅ React-way: drop handler using raycasting
  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const productData = e.dataTransfer.getData("product");
      if (!productData) return;

      try {
        const product = JSON.parse(productData);
        const rect = sceneRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Get normalized device coordinates (NDC)
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // Access camera & scene using useThree
        const { camera, scene } = useThree.getState();

        // Raycast onto a ground plane at y=0
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const hitPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, hitPoint);

        const newProduct: PlacedProduct = {
          id: `product-${Date.now()}`,
          productId: product.id,
          name: product.name,
          category: product.category || "Unknown",
          position: {
            x: hitPoint.x * 1000, // store in "canvas coordinates"
            y: hitPoint.z * 1000,
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
        console.error("Error parsing dropped product:", error);
        toast.error("Failed to add product");
      }
    },
    [setPlacedProducts]
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
