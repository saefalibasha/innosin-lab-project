import React, { useRef, useCallback, useState } from 'react';
import { PlacedProduct, WallSegment, Door, Room, Point } from '@/types/floorPlanTypes';
import { toast } from 'sonner';
import { wallsToPolygon, rectInsidePolygon } from '@/utils/polygonUtils';
import { canvasTo3DWorld } from '@/utils/coordinateUtils';
import IsometricFloorPlanScene from './IsometricFloorPlanScene';

interface EnhancedCanvasWorkspace3DProps {
  roomPoints: Point[];
  setRoomPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  wallSegments: WallSegment[];
  setWallSegments: React.Dispatch<React.SetStateAction<WallSegment[]>>;
  placedProducts: PlacedProduct[];
  setPlacedProducts: React.Dispatch<React.SetStateAction<PlacedProduct[]>>;
  doors: Door[];
  setDoors: React.Dispatch<React.SetStateAction<Door[]>>;
  textAnnotations: any[];
  setTextAnnotations: React.Dispatch<React.SetStateAction<any[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  scale: number;
  showGrid: boolean;
  selectedProducts: string[];
  onProductSelect: (productIds: string[]) => void;
  onClearAll: () => void;
  currentMode?: string;
  showMeasurements?: boolean;
  gridSize?: number;
  measurementUnit?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  onWallUpdate?: (wall: any) => void;
  onWallDelete?: (id: string) => void;
  onWallSelect?: () => void;
}

const EnhancedCanvasWorkspace3D: React.FC<EnhancedCanvasWorkspace3DProps> = ({
  wallSegments,
  placedProducts,
  setPlacedProducts,
  doors,
  rooms,
  scale,
  selectedProducts,
  onProductSelect,
  showGrid,
}) => {
  const htmlRef = useRef<HTMLDivElement>(null);
  const [sceneRef3D, setSceneRef3D] = useState<any>(null);

  const handleSceneReady = useCallback((scene: any) => {
    setSceneRef3D(scene);
  }, []);

  const handleProductClick = useCallback(
    (productId: string) => {
      if (selectedProducts.includes(productId)) {
        onProductSelect(selectedProducts.filter(id => id !== productId));
      } else {
        onProductSelect([...selectedProducts, productId]);
      }
    },
    [selectedProducts, onProductSelect]
  );

  const handleWallClick = useCallback((wallId: string) => {
    console.log('Wall clicked:', wallId);
  }, []);

  const handleSceneClick = useCallback(() => {
    if (selectedProducts.length > 0) {
      onProductSelect([]);
    }
  }, [selectedProducts, onProductSelect]);

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!htmlRef.current) return;

      // Handle both 'application/json' and 'product' data types
      const jsonData = e.dataTransfer.getData('application/json');
      const productData = e.dataTransfer.getData('product');
      const data = jsonData || productData;
      
      if (!data) {
        toast.error('No product data found');
        return;
      }

      try {
        const product = JSON.parse(data);
        console.log('Dropped product data:', product);

        // Get canvas position relative to the drop area
        const rect = htmlRef.current.getBoundingClientRect();
        const canvasPos = {
          x: (e.clientX - rect.left),
          y: (e.clientY - rect.top)
        };

        console.log('Canvas position:', canvasPos);

        // Basic validation if walls exist
        if (wallSegments.length > 0) {
          const polygon = wallsToPolygon(wallSegments);
          if (polygon.length >= 3) {
            const productWidth = (product.width || 600);
            const productDepth = (product.depth || 600);
            
            const isInside = rectInsidePolygon(
              canvasPos,
              productWidth * scale,
              productDepth * scale,
              0,
              polygon
            );
            
            if (!isInside) {
              toast.error('Product must be placed within the walls');
              return;
            }
          }
        }

        // Create new product with proper dimensions
        const productWidth = product.width || 600;
        const productDepth = product.depth || 600;
        const productHeight = product.height || 850;

        const newProduct: PlacedProduct = {
          id: `product-${Date.now()}`,
          productId: product.id,
          name: product.name,
          category: product.category || 'Unknown',
          position: canvasPos,
          rotation: 0,
          dimensions: {
            length: productWidth,
            width: productDepth,
            height: productHeight
          },
          originalDimensions: {
            length: productWidth,
            width: productDepth,
            height: productHeight
          },
          color: product.color || '#4caf50',
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

  const handleProductUpdate = useCallback(
    (productId: string, updates: Partial<PlacedProduct>) => {
      setPlacedProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
    },
    [setPlacedProducts]
  );

  const origin = { minX: 0, minY: 0 };

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
        origin={origin}
        onProductUpdate={handleProductUpdate}
      />
    </div>
  );
};

export default EnhancedCanvasWorkspace3D;