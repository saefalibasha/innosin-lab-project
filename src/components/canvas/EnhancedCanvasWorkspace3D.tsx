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
  onWallClick?: (wallId: string) => void;
  selectedDoorId?: string;
  onDoorClick?: (doorId: string) => void;
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
  onWallClick,
  selectedDoorId,
  onDoorClick,
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
    onWallClick?.(wallId);
  }, [onWallClick]);

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
        
        // Convert to canvas coordinates using consistent dimensions
        const canvasPos = {
          x: normalizedX * 2000, // Match 2D canvas width (CANVAS_WIDTH)
          y: normalizedY * 1400  // Match 2D canvas height (CANVAS_HEIGHT)
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

        // Create product with unified dimension mapping: X=length, Z=width, Y=height
        const productWidthMm = product.width || product.dimensions?.width || 600;
        const productDepthMm = product.depth || product.dimensions?.length || 600;
        const productHeightMm = product.height || product.dimensions?.height || 850;

        const newProduct: PlacedProduct = {
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id || product.productId || `unknown-${Date.now()}`,
          name: product.name || 'Unknown Product',
          category: product.category || 'Cabinet',
          position: canvasPos,
          rotation: 0,
          dimensions: {
            length: productDepthMm,  // X-axis (depth/forward-back)
            width: productWidthMm,   // Z-axis (width/left-right)
            height: productHeightMm  // Y-axis (height/up-down)
          },
          originalDimensions: {
            length: productDepthMm,
            width: productWidthMm,
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

  // Calculate proper origin from wall bounds for consistent coordinate system
  const origin = React.useMemo(() => {
    if (wallSegments.length === 0) return { minX: 0, minY: 0 };
    
    const xs = wallSegments.flatMap(w => [w.start.x, w.end.x]);
    const ys = wallSegments.flatMap(w => [w.start.y, w.end.y]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    
    console.debug('[EnhancedCanvasWorkspace3D] Calculated origin:', { minX, minY });
    return { minX, minY };
  }, [wallSegments]);

  return (
    <div 
      ref={htmlRef} 
      className="relative w-full h-full bg-gray-50"
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
        selectedDoorId={selectedDoorId}
        onDoorClick={onDoorClick}
      />
    </div>
  );
};

export default EnhancedCanvasWorkspace3D;