import React, { useRef, useCallback, useState } from 'react';
import { PlacedProduct, WallSegment, Door, Room, Point } from '@/types/floorPlanTypes';
import { toast } from 'sonner';
import { wallsToPolygon, rectInsidePolygon, isValidFloorPolygon } from '@/utils/polygonUtils';
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

      // Handle multiple data transfer formats
      const dataTransfer = e.dataTransfer;
      let productData = null;
      
      // Try different data formats
      try {
        productData = dataTransfer.getData('application/json');
        if (!productData) {
          productData = dataTransfer.getData('product');
        }
        if (!productData) {
          productData = dataTransfer.getData('text/plain');
        }
      } catch (error) {
        console.error('Error reading drag data:', error);
      }
      
      if (!productData) {
        toast.error('No product data found in drop');
        return;
      }

      try {
        const product = typeof productData === 'string' ? JSON.parse(productData) : productData;
        console.log('3D Drop - Product data:', product);

        // Get accurate canvas position
        const rect = htmlRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        
        // Convert to proportional coordinates (0-1 range)
        const normalizedX = relativeX / rect.width;
        const normalizedY = relativeY / rect.height;
        
        // Convert to canvas coordinates 
        const canvasPos = {
          x: normalizedX * 800, // Assuming 800px canvas width
          y: normalizedY * 600  // Assuming 600px canvas height
        };

        console.log('3D Canvas position:', canvasPos, 'from client:', {x: relativeX, y: relativeY});

        // Check if walls form a valid floor for placement
        if (wallSegments.length > 0) {
          if (!isValidFloorPolygon(wallSegments)) {
            toast.error('Complete the walls to place products inside the room.');
            return;
          }
          
          const polygon = wallsToPolygon(wallSegments);
          if (polygon.length >= 3) {
            // Use consistent dimension mapping
            const productWidthMm = product.width || product.dimensions?.length || 600;
            const productDepthMm = product.depth || product.dimensions?.width || 600;
            
            const isInside = rectInsidePolygon(
              canvasPos,
              productWidthMm * scale,
              productDepthMm * scale,
              0,
              polygon
            );
            
            if (!isInside) {
              console.warn('Product outside walls, allowing placement anyway for 3D');
              // Allow placement in 3D even if outside walls for better UX
            }
          }
        }

        // Create product with consistent dimension mapping
        const productWidthMm = product.width || product.dimensions?.length || 600;
        const productDepthMm = product.depth || product.dimensions?.width || 600;
        const productHeightMm = product.height || product.dimensions?.height || 850;

        const newProduct: PlacedProduct = {
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id || product.productId || `unknown-${Date.now()}`,
          name: product.name || 'Unknown Product',
          category: product.category || 'Cabinet',
          position: canvasPos,
          rotation: 0,
          dimensions: {
            length: productWidthMm,  // width maps to length
            width: productDepthMm,   // depth maps to width  
            height: productHeightMm
          },
          originalDimensions: {
            length: productWidthMm,
            width: productDepthMm,
            height: productHeightMm
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
        toast.success(`Added ${product.name} to 3D floor plan`);
      } catch (error) {
        console.error('Error parsing dropped product in 3D:', error);
        toast.error('Failed to parse product data');
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