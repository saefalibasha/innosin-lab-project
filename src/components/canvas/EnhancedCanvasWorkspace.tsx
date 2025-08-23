
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode, WallType } from '@/types/floorPlanTypes';
import { GRID_SIZES, MeasurementUnit, formatMeasurement, canvasToMm, mmToCanvas } from '@/utils/measurements';
import { getProductDimensionsInMm } from '@/utils/productDimensions';
import { SnapSystem, SnapResult } from '@/utils/snapSystem';
import { toast } from 'sonner';

interface EnhancedCanvasWorkspaceProps {
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
  onProductSelect: (products: string[]) => void;
  // doorOrientation removed - automatic based on wall direction
  onWallUpdate?: (wall: WallSegment) => void;
}

export const EnhancedCanvasWorkspace: React.FC<EnhancedCanvasWorkspaceProps> = ({
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
  // doorOrientation removed - automatic based on wall direction
  onWallUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wallStartPoint, setWallStartPoint] = useState<Point | null>(null);
  const [isWallPreview, setIsWallPreview] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedProducts || []);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });
  const [currentLineMeasurement, setCurrentLineMeasurement] = useState<string>('');
  const [selectedWall, setSelectedWall] = useState<WallSegment | null>(null);
  const [hoveredWall, setHoveredWall] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [snapGuides, setSnapGuides] = useState<{ horizontal: number | null; vertical: number | null }>({ horizontal: null, vertical: null });
  const [editingMeasurement, setEditingMeasurement] = useState<{ wallId: string; value: string } | null>(null);

  // Sync selectedItems with selectedProducts prop
  useEffect(() => {
    setSelectedItems(selectedProducts || []);
  }, [selectedProducts]);
  const [hoveredMeasurement, setHoveredMeasurement] = useState<string | null>(null);
  const [dragMeasurements, setDragMeasurements] = useState<{ top: number; right: number; bottom: number; left: number } | null>(null);
  const [doorSnapPreview, setDoorSnapPreview] = useState<{ point: Point; wall: WallSegment } | null>(null);
  
  // Initialize snap system
  const snapSystem = new SnapSystem(
    {
      enabled: true,
      gridSnap: showGrid,
      objectSnap: true,
      snapDistance: 20,
      strength: 'medium',
      snapToObjects: true,
      snapToAlignment: true,
      snapToGrid: showGrid
    },
    gridSize,
    scale
  );

  const CANVAS_WIDTH = canvasWidth;
  const CANVAS_HEIGHT = canvasHeight;

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    // Get the actual canvas size vs display size ratio
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const snapToGrid = useCallback((point: Point): Point => {
    if (!showGrid) return point;
    
    const gridPixels = gridSize * scale;
    const snappedPoint = {
      x: Math.round(point.x / gridPixels) * gridPixels,
      y: Math.round(point.y / gridPixels) * gridPixels
    };
    
    return snappedPoint;
  }, [showGrid, gridSize, scale]);

  const findWallEndpoints = useCallback((): Point[] => {
    const endpoints: Point[] = [];
    wallSegments.forEach(wall => {
      endpoints.push(wall.start, wall.end);
    });
    return endpoints;
  }, [wallSegments]);

  const snapToEndpoints = useCallback((point: Point): { point: Point | null, showGuides: boolean, isSnapping: boolean } => {
    const endpoints = findWallEndpoints();
    const snapDistance = 40; // Increased snap distance for better sensitivity
    
    for (const endpoint of endpoints) {
      const distance = Math.sqrt(
        Math.pow(point.x - endpoint.x, 2) + Math.pow(point.y - endpoint.y, 2)
      );
      
      if (distance <= snapDistance) {
        return { point: endpoint, showGuides: true, isSnapping: true };
      }
    }
    return { point: null, showGuides: false, isSnapping: false };
  }, [findWallEndpoints]);

  // Constrain to vertical/horizontal lines
  const constrainToOrtho = useCallback((startPoint: Point, currentPoint: Point): Point => {
    const dx = currentPoint.x - startPoint.x;
    const dy = currentPoint.y - startPoint.y;
    
    // If the movement is more horizontal than vertical
    if (Math.abs(dx) > Math.abs(dy)) {
      return { x: currentPoint.x, y: startPoint.y }; // Horizontal line
    } else {
      return { x: startPoint.x, y: currentPoint.y }; // Vertical line
    }
  }, []);

  // Check if product intersects with walls (collision detection)
  const checkWallCollision = useCallback((product: PlacedProduct): boolean => {
    const halfWidth = product.dimensions.length / 2;
    const halfHeight = product.dimensions.width / 2;
    
    const productBounds = {
      left: product.position.x - halfWidth,
      right: product.position.x + halfWidth,
      top: product.position.y - halfHeight,
      bottom: product.position.y + halfHeight
    };
    
    for (const wall of wallSegments) {
      // Check if product rectangle intersects with wall line (with wall thickness)
      const wallThickness = wall.thickness || 10;
      const minX = Math.min(wall.start.x, wall.end.x) - wallThickness/2;
      const maxX = Math.max(wall.start.x, wall.end.x) + wallThickness/2;
      const minY = Math.min(wall.start.y, wall.end.y) - wallThickness/2;
      const maxY = Math.max(wall.start.y, wall.end.y) + wallThickness/2;
      
      if (productBounds.right >= minX && productBounds.left <= maxX &&
          productBounds.bottom >= minY && productBounds.top <= maxY) {
        return true; // Collision detected
      }
    }
    return false;
  }, [wallSegments]);

  // Calculate distance to nearest wall for measurements
  const calculateWallDistances = useCallback((point: Point): { top: number; right: number; bottom: number; left: number } => {
    let minTop = Infinity, minRight = Infinity, minBottom = Infinity, minLeft = Infinity;
    
    for (const wall of wallSegments) {
      // For simplicity, consider walls as rectangles based on their orientation
      const isHorizontal = Math.abs(wall.start.y - wall.end.y) < Math.abs(wall.start.x - wall.end.x);
      
      if (isHorizontal) {
        const wallY = (wall.start.y + wall.end.y) / 2;
        const wallMinX = Math.min(wall.start.x, wall.end.x);
        const wallMaxX = Math.max(wall.start.x, wall.end.x);
        
        if (point.x >= wallMinX && point.x <= wallMaxX) {
          if (wallY < point.y) {
            minTop = Math.min(minTop, point.y - wallY);
          } else {
            minBottom = Math.min(minBottom, wallY - point.y);
          }
        }
      } else {
        const wallX = (wall.start.x + wall.end.x) / 2;
        const wallMinY = Math.min(wall.start.y, wall.end.y);
        const wallMaxY = Math.max(wall.start.y, wall.end.y);
        
        if (point.y >= wallMinY && point.y <= wallMaxY) {
          if (wallX < point.x) {
            minLeft = Math.min(minLeft, point.x - wallX);
          } else {
            minRight = Math.min(minRight, wallX - point.x);
          }
        }
      }
    }
    
    return {
      top: minTop === Infinity ? 0 : Math.round(canvasToMm(minTop, scale)),
      right: minRight === Infinity ? 0 : Math.round(canvasToMm(minRight, scale)),
      bottom: minBottom === Infinity ? 0 : Math.round(canvasToMm(minBottom, scale)),
      left: minLeft === Infinity ? 0 : Math.round(canvasToMm(minLeft, scale))
    };
  }, [wallSegments, scale]);

  // Snap island/bench products to wall distances
  const snapToWallDistance = useCallback((product: PlacedProduct, targetDistance: number = 600): Point => {
    const isIslandOrBench = product.name.toLowerCase().includes('island') || 
                           product.name.toLowerCase().includes('bench') ||
                           product.category?.toLowerCase().includes('bench');
    
    if (!isIslandOrBench) return product.position;
    
    const distances = calculateWallDistances(product.position);
    const snapThreshold = 50; // mm
    
    let adjustedPosition = { ...product.position };
    
    // Snap to standard distances if close
    if (Math.abs(distances.left - targetDistance) < snapThreshold) {
      adjustedPosition.x = product.position.x + (targetDistance - distances.left) * scale / 10;
    }
    if (Math.abs(distances.right - targetDistance) < snapThreshold) {
      adjustedPosition.x = product.position.x - (targetDistance - distances.right) * scale / 10;
    }
    if (Math.abs(distances.top - targetDistance) < snapThreshold) {
      adjustedPosition.y = product.position.y + (targetDistance - distances.top) * scale / 10;
    }
    if (Math.abs(distances.bottom - targetDistance) < snapThreshold) {
      adjustedPosition.y = product.position.y - (targetDistance - distances.bottom) * scale / 10;
    }
    
    return adjustedPosition;
  }, [calculateWallDistances, scale]);

  // Find product at point for dragging
  const findProductAtPoint = useCallback((point: Point): PlacedProduct | null => {
    for (const product of placedProducts) {
      const halfWidth = product.dimensions.length / 2;
      const halfHeight = product.dimensions.width / 2;
      
      if (point.x >= product.position.x - halfWidth &&
          point.x <= product.position.x + halfWidth &&
          point.y >= product.position.y - halfHeight &&
          point.y <= product.position.y + halfHeight) {
        return product;
      }
    }
    return null;
  }, [placedProducts]);

  // Helper function to calculate distance from point to line segment
  const distanceToLineSegment = useCallback((point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    
    if (param < 0) {
      return Math.sqrt(A * A + B * B);
    } else if (param > 1) {
      const dx = point.x - lineEnd.x;
      const dy = point.y - lineEnd.y;
      return Math.sqrt(dx * dx + dy * dy);
    } else {
      const projX = lineStart.x + param * C;
      const projY = lineStart.y + param * D;
      const dx = point.x - projX;
      const dy = point.y - projY;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const findWallAtPoint = useCallback((point: Point): WallSegment | null => {
    const tolerance = 10; // pixels
    
    for (const wall of wallSegments) {
      const distance = distanceToLineSegment(point, wall.start, wall.end);
      if (distance <= tolerance) {
        return wall;
      }
    }
    return null;
  }, [wallSegments, distanceToLineSegment]);

  // Helper function to check if clicking on measurement text
  const findMeasurementAtPoint = useCallback((point: Point): string | null => {
    const tolerance = 30; // Increased tolerance for better clickability
    
    for (const wall of wallSegments) {
      const midX = (wall.start.x + wall.end.x) / 2;
      const midY = (wall.start.y + wall.end.y) / 2;
      
      const distance = Math.sqrt(
        Math.pow(point.x - midX, 2) + Math.pow(point.y - midY, 2)
      );
      
      if (distance <= tolerance) {
        return wall.id;
      }
    }
    return null;
  }, [wallSegments]);

  // Helper function to find connected walls
  const findConnectedWalls = useCallback((wallId: string): string[] => {
    const targetWall = wallSegments.find(w => w.id === wallId);
    if (!targetWall) return [];
    
    const connected: string[] = [];
    const tolerance = 5;
    
    for (const wall of wallSegments) {
      if (wall.id === wallId) continue;
      
      // Check if walls share endpoints (are connected)
      const startToStart = Math.sqrt(
        Math.pow(wall.start.x - targetWall.start.x, 2) + 
        Math.pow(wall.start.y - targetWall.start.y, 2)
      );
      const startToEnd = Math.sqrt(
        Math.pow(wall.start.x - targetWall.end.x, 2) + 
        Math.pow(wall.start.y - targetWall.end.y, 2)
      );
      const endToStart = Math.sqrt(
        Math.pow(wall.end.x - targetWall.start.x, 2) + 
        Math.pow(wall.end.y - targetWall.start.y, 2)
      );
      const endToEnd = Math.sqrt(
        Math.pow(wall.end.x - targetWall.end.x, 2) + 
        Math.pow(wall.end.y - targetWall.end.y, 2)
      );
      
      if (startToStart <= tolerance || startToEnd <= tolerance || 
          endToStart <= tolerance || endToEnd <= tolerance) {
        connected.push(wall.id);
      }
    }
    
    return connected;
  }, [wallSegments]);

  // Function to adjust wall length and connected walls
  const adjustWallLength = useCallback((wallId: string, newLengthMm: number) => {
    const targetWall = wallSegments.find(w => w.id === wallId);
    if (!targetWall) return;
    
    const currentLengthPx = Math.sqrt(
      Math.pow(targetWall.end.x - targetWall.start.x, 2) + 
      Math.pow(targetWall.end.y - targetWall.start.y, 2)
    );
    const newLengthPx = mmToCanvas(newLengthMm, scale); // Convert mm to canvas pixels
    
    // Calculate direction vector
    const dirX = (targetWall.end.x - targetWall.start.x) / currentLengthPx;
    const dirY = (targetWall.end.y - targetWall.start.y) / currentLengthPx;
    
    // Calculate new end point
    const newEnd = {
      x: targetWall.start.x + dirX * newLengthPx,
      y: targetWall.start.y + dirY * newLengthPx
    };
    
    // Get original end point for reference
    const originalEnd = targetWall.end;
    const endPointChange = {
      x: newEnd.x - originalEnd.x,
      y: newEnd.y - originalEnd.y
    };
    
    // Find connected walls and update their endpoints
    const connectedWallIds = findConnectedWalls(wallId);
    
    // Update wall segments including connected walls
    const updatedWalls = wallSegments.map(wall => {
      if (wall.id === wallId) {
        return { ...wall, end: newEnd };
      }
      
      // Update connected walls
      if (connectedWallIds.includes(wall.id)) {
        const tolerance = 5;
        
        // Check which endpoint is connected and update accordingly
        let updatedWall = { ...wall };
        
        // Check if wall start is connected to target wall's end
        const startToOriginalEnd = Math.sqrt(
          Math.pow(wall.start.x - originalEnd.x, 2) + 
          Math.pow(wall.start.y - originalEnd.y, 2)
        );
        if (startToOriginalEnd <= tolerance) {
          updatedWall.start = newEnd;
        }
        
        // Check if wall end is connected to target wall's end
        const endToOriginalEnd = Math.sqrt(
          Math.pow(wall.end.x - originalEnd.x, 2) + 
          Math.pow(wall.end.y - originalEnd.y, 2)
        );
        if (endToOriginalEnd <= tolerance) {
          updatedWall.end = newEnd;
        }
        
        return updatedWall;
      }
      
      return wall;
    });
    
    setWallSegments(updatedWalls);
    
    // Call onWallUpdate if provided
    const updatedTargetWall = updatedWalls.find(w => w.id === wallId);
    if (updatedTargetWall && onWallUpdate) {
      onWallUpdate(updatedTargetWall);
    }
  }, [wallSegments, setWallSegments, scale, findConnectedWalls, onWallUpdate]);

  // Snap to wall lengths for interior walls
  const snapToWallLength = useCallback((point: Point): { point: Point | null, showGuides: boolean } => {
    const snapDistance = 20;
    let closestPoint: Point | null = null;
    let minDistance = Infinity;
    
    for (const wall of wallSegments) {
      const A = point.x - wall.start.x;
      const B = point.y - wall.start.y;
      const C = wall.end.x - wall.start.x;
      const D = wall.end.y - wall.start.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      
      if (lenSq === 0) continue; // Skip zero-length walls
      
      const param = dot / lenSq;
      
      // Only consider points along the wall (not extending beyond endpoints)
      if (param >= 0 && param <= 1) {
        const projectedPoint = {
          x: wall.start.x + param * C,
          y: wall.start.y + param * D
        };
        
        const distance = Math.sqrt(
          Math.pow(point.x - projectedPoint.x, 2) + Math.pow(point.y - projectedPoint.y, 2)
        );
        
        if (distance <= snapDistance && distance < minDistance) {
          minDistance = distance;
          closestPoint = projectedPoint;
        }
      }
    }
    
    return { point: closestPoint, showGuides: closestPoint !== null };
  }, [wallSegments]);

  // Helper function to calculate final position with all constraints applied
  const calculateFinalPosition = useCallback((startPoint: Point, currentPoint: Point, mode: DrawingMode): Point => {
    // Step 1: Apply orthogonal constraint
    const constrainedPoint = constrainToOrtho(startPoint, currentPoint);
    
    if (mode === 'interior-wall') {
      // For interior walls: try wall length snapping first, then endpoints, then grid
      const wallSnapResult = snapToWallLength(constrainedPoint);
      if (wallSnapResult.point) {
        return wallSnapResult.point;
      }
      
      const endpointSnapResult = snapToEndpoints(constrainedPoint);
      if (endpointSnapResult.point) {
        return endpointSnapResult.point;
      }
      
      return snapToGrid(constrainedPoint);
    } else {
      // For exterior walls: try endpoints first, then grid (original behavior)
      const snapResult = snapToEndpoints(constrainedPoint);
      if (snapResult.point) {
        return snapResult.point;
      }
      
      return snapToGrid(constrainedPoint);
    }
  }, [constrainToOrtho, snapToEndpoints, snapToGrid, snapToWallLength]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    const snappedPoint = snapToGrid(point);
    setLastMousePos(snappedPoint);
    
    if (currentMode === 'select') {
      // Check if clicking on measurement text first
      const clickedMeasurement = findMeasurementAtPoint(snappedPoint);
      if (clickedMeasurement) {
        const wall = wallSegments.find(w => w.id === clickedMeasurement);
        if (wall) {
          const lengthPx = Math.sqrt(
            Math.pow(wall.end.x - wall.start.x, 2) + 
            Math.pow(wall.end.y - wall.start.y, 2)
          );
          const lengthMm = (lengthPx / scale / 100) * 1000; // Convert pixels to mm
          setEditingMeasurement({
            wallId: clickedMeasurement,
            value: Math.round(lengthMm).toString()
          });
          return;
        }
      }
      
      // Check if clicking on a product for selection
      const clickedProduct = findProductAtPoint(snappedPoint);
      if (clickedProduct) {
        // Toggle product selection with Ctrl/Cmd for multi-select
        const isCtrlPressed = e.metaKey || e.ctrlKey;
        if (isCtrlPressed) {
          // Multi-select: toggle this product
          const currentSelection = selectedProducts || [];
          const newSelection = currentSelection.includes(clickedProduct.id)
            ? currentSelection.filter(id => id !== clickedProduct.id)
            : [...currentSelection, clickedProduct.id];
          onProductSelect(newSelection);
        } else {
          // Single select: clear others and select this one
          onProductSelect([clickedProduct.id]);
        }
        return;
      }
      
      // Check if clicking on a wall for selection
      const clickedWall = findWallAtPoint(snappedPoint);
      if (clickedWall) {
        setSelectedWall(clickedWall);
        return;
      } else {
        setSelectedWall(null);
        // Clear product selection if clicking on empty space
        onProductSelect([]);
      }
    }

    if (currentMode === 'move') {
      // Check if clicking on a product for dragging
      const clickedProduct = findProductAtPoint(snappedPoint);
      if (clickedProduct) {
        setDraggedItem(clickedProduct.id);
        setIsDragging(true);
        setDragOffset({
          x: snappedPoint.x - clickedProduct.position.x,
          y: snappedPoint.y - clickedProduct.position.y
        });
        return;
      }
    }
    
    if (currentMode === 'wall' || currentMode === 'interior-wall') {
      if (!wallStartPoint) {
        // PRIORITY 1: First try to snap to endpoints (blue dots) - HIGHEST PRIORITY
        const endpointSnap = snapToEndpoints(point);
        if (endpointSnap.point && endpointSnap.isSnapping) {
          setWallStartPoint(endpointSnap.point);
          setIsWallPreview(true);
          return;
        }
        
        // PRIORITY 2: If no endpoint snap, use grid snap
        const gridSnappedPoint = snapToGrid(point);
        setWallStartPoint(gridSnappedPoint);
        setIsWallPreview(true);
      } else {
        // Second click - complete wall using same positioning logic as preview
        const finalEndPoint = calculateFinalPosition(wallStartPoint, point, currentMode);
        
        const newWallSegment: WallSegment = {
          id: `wall-${Date.now()}`,
          start: wallStartPoint,
          end: finalEndPoint,
          thickness: currentMode === 'interior-wall' ? 6 : 10,
          color: currentMode === 'interior-wall' ? '#999999' : '#666666',
          type: currentMode === 'interior-wall' ? WallType.PARTITION : WallType.EXTERIOR
        };
        setWallSegments(prev => [...prev, newWallSegment]);
        setWallStartPoint(null);
        setIsWallPreview(false);
        setCurrentLineMeasurement('');
        setSnapGuides({ horizontal: null, vertical: null });
      }
    } else if (currentMode === 'room') {
      setRoomPoints(prev => [...prev, snappedPoint]);
    } else if (currentMode === 'door') {
      // Enhanced door placement with wall detection
      const doorSnapResult = snapSystem.snapDoorToWall(point, wallSegments);
      
      if (doorSnapResult.snapped && doorSnapResult.target) {
        const targetWall = doorSnapResult.target as WallSegment;
        
        console.log(`=== PLACING DOOR ON WALL ===`);
        console.log(`Wall start: (${targetWall.start.x}, ${targetWall.start.y})`);
        console.log(`Wall end: (${targetWall.end.x}, ${targetWall.end.y})`);
        
        // Simple logic: determine if wall is horizontal or vertical
        const wallDeltaX = Math.abs(targetWall.end.x - targetWall.start.x);
        const wallDeltaY = Math.abs(targetWall.end.y - targetWall.start.y);
        
        console.log(`Wall deltas: X=${wallDeltaX}, Y=${wallDeltaY}`);
        
        // If wall is more horizontal than vertical, door should be horizontal
        // If wall is more vertical than horizontal, door should be vertical
        const isWallHorizontal = wallDeltaX > wallDeltaY;
        const doorFacing: 'horizontal' | 'vertical' = isWallHorizontal ? 'horizontal' : 'vertical';
        
        console.log(`Wall is horizontal: ${isWallHorizontal}, Door facing: ${doorFacing}`);
        
        const newDoor: Door = {
          id: `door-${Date.now()}`,
          position: doorSnapResult.point,
          width: 80,
          wallId: targetWall.id,
          wallSegmentId: targetWall.id,
          wallPosition: undefined,
          isEmbedded: true,
          facing: doorFacing
        };
        setDoors(prev => [...prev, newDoor]);
        toast.success('Door placed on wall');
      } else {
        // Fallback to regular placement if no wall nearby
        const newDoor: Door = {
          id: `door-${Date.now()}`,
          position: snappedPoint,
          width: 80,
          wallId: undefined,
          wallSegmentId: undefined,
          wallPosition: undefined,
          isEmbedded: false,
          facing: 'horizontal' // Default fallback when no wall detected
        };
        setDoors(prev => [...prev, newDoor]);
        toast.info('Door placed without wall alignment');
      }
    } else if (currentMode === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newAnnotation: TextAnnotation = {
          id: `text-${Date.now()}`,
          position: snappedPoint,
          text,
          fontSize: 14,
          color: '#000000'
        };
        setTextAnnotations(prev => [...prev, newAnnotation]);
      }
    }
  }, [currentMode, getCanvasPoint, snapToGrid, setRoomPoints, setDoors, setTextAnnotations, findWallAtPoint, findProductAtPoint, wallStartPoint, setWallSegments, findMeasurementAtPoint, wallSegments, scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    
    // Handle product dragging
    if (isDragging && draggedItem && currentMode === 'move') {
      const draggedProduct = placedProducts.find(p => p.id === draggedItem);
      if (draggedProduct) {
        let newPosition = {
          x: point.x - dragOffset.x,
          y: point.y - dragOffset.y
        };
        
        // Apply grid snapping
        newPosition = snapToGrid(newPosition);
        
        // Check for wall collision and prevent placement if collision detected
        const testProduct = { ...draggedProduct, position: newPosition };
        if (!checkWallCollision(testProduct)) {
          // Apply island/bench wall snapping
          newPosition = snapToWallDistance(testProduct);
          
          // Calculate and show real-time measurements
          const measurements = calculateWallDistances(newPosition);
          setDragMeasurements(measurements);
          
          setPlacedProducts(prev => prev.map(p => 
            p.id === draggedItem 
              ? { ...p, position: newPosition }
              : p
          ));
        }
      }
    } else {
      setDragMeasurements(null);
    }
    
    if (isWallPreview && wallStartPoint && (currentMode === 'wall' || currentMode === 'interior-wall')) {
      // Use the same positioning logic as completion
      const finalPoint = calculateFinalPosition(wallStartPoint, point, currentMode);
      setLastMousePos(finalPoint);
      
      // Show snap guides based on snap type
      let showGuides = false;
      const constrainedPoint = constrainToOrtho(wallStartPoint, point);
      
      if (currentMode === 'interior-wall') {
        const wallSnapResult = snapToWallLength(constrainedPoint);
        const endpointSnapResult = snapToEndpoints(constrainedPoint);
        showGuides = wallSnapResult.showGuides || endpointSnapResult.showGuides;
      } else {
        const endpointSnapResult = snapToEndpoints(constrainedPoint);
        showGuides = endpointSnapResult.showGuides;
      }
      
      setSnapGuides({
        horizontal: showGuides ? finalPoint.y : null,
        vertical: showGuides ? finalPoint.x : null
      });
      
      const dx = finalPoint.x - wallStartPoint.x;
      const dy = finalPoint.y - wallStartPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const distanceInMm = canvasToMm(distance, scale);
      
      setCurrentLineMeasurement(formatMeasurement(distanceInMm, measurementUnit, measurementUnit === 'mm' ? 0 : 2));

      // Update snap lines for grid alignment
      if (showGrid) {
        const gridPixels = gridSize * scale;
        const snapThreshold = 10; // pixels
        
        // Check for vertical snap line
        const nearestVerticalGrid = Math.round(finalPoint.x / gridPixels) * gridPixels;
        const verticalDistance = Math.abs(finalPoint.x - nearestVerticalGrid);
        
        // Check for horizontal snap line
        const nearestHorizontalGrid = Math.round(finalPoint.y / gridPixels) * gridPixels;
        const horizontalDistance = Math.abs(finalPoint.y - nearestHorizontalGrid);
        
        setSnapLines({
          x: verticalDistance <= snapThreshold ? nearestVerticalGrid : null,
          y: horizontalDistance <= snapThreshold ? nearestHorizontalGrid : null
        });
      }
    } else {
      const snappedPoint = snapToGrid(point);
      setLastMousePos(snappedPoint);
      setSnapLines({ x: null, y: null });
      setSnapGuides({ horizontal: null, vertical: null });
      
      if ((currentMode === 'wall' || currentMode === 'interior-wall') && !isWallPreview) {
        setCurrentLineMeasurement('');
      }
    }
    
    // Handle door snap preview for door placement mode
    if (currentMode === 'door') {
      const doorSnapResult = snapSystem.snapDoorToWall(point, wallSegments);
      if (doorSnapResult.snapped && doorSnapResult.target) {
        setDoorSnapPreview({
          point: doorSnapResult.point,
          wall: doorSnapResult.target as WallSegment
        });
      } else {
        setDoorSnapPreview(null);
      }
    } else {
      setDoorSnapPreview(null);
    }
    
    // Handle wall hover for better UX
    if (currentMode === 'select') {
      const hoveredWallFound = findWallAtPoint(point);
      setHoveredWall(hoveredWallFound?.id || null);
      
      // Check for measurement hover
      const hoveredMeasurementFound = findMeasurementAtPoint(point);
      setHoveredMeasurement(hoveredMeasurementFound);
    }
  }, [isWallPreview, wallStartPoint, isDragging, draggedItem, currentMode, getCanvasPoint, snapToGrid, snapToEndpoints, constrainToOrtho, scale, measurementUnit, findWallAtPoint, showGrid, gridSize, dragOffset, placedProducts, setPlacedProducts, findMeasurementAtPoint]);

  const handleMouseUp = useCallback(() => {
    // Reset dragging state (but not wall preview state)
    setIsDragging(false);
    setDraggedItem(null);
    
    // Don't reset wall preview state here - it's handled in handleMouseDown
    if (!isWallPreview) {
      setSnapLines({ x: null, y: null });
      setSnapGuides({ horizontal: null, vertical: null });
    }
  }, [isWallPreview]);

  const handleDoubleClick = useCallback(() => {
    if (currentMode === 'room' && roomPoints.length >= 3) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: `Room ${rooms.length + 1}`,
        points: [...roomPoints],
        area: calculatePolygonArea(roomPoints),
        perimeter: calculatePolygonPerimeter(roomPoints),
        color: '#e3f2fd'
      };
      setRooms(prev => [...prev, newRoom]);
      setRoomPoints([]);
    }
  }, [currentMode, roomPoints, rooms.length, setRooms, setRoomPoints]);

  const calculatePolygonArea = (points: Point[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  const calculatePolygonPerimeter = (points: Point[]): number => {
    if (points.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid if enabled with better visibility
    if (showGrid) {
      const gridPixels = gridSize * scale;
      
      // Draw minor grid lines
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x <= CANVAS_WIDTH; x += gridPixels) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      
      for (let y = 0; y <= CANVAS_HEIGHT; y += gridPixels) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
      
      // Draw major grid lines every 5 units
      const majorGridPixels = gridPixels * 5;
      ctx.strokeStyle = '#d1d1d1';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= CANVAS_WIDTH; x += majorGridPixels) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      
      for (let y = 0; y <= CANVAS_HEIGHT; y += majorGridPixels) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    }
    
    // Draw rooms
    rooms.forEach(room => {
      if (room.points.length >= 3) {
        ctx.fillStyle = room.color;
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(room.points[0].x, room.points[0].y);
        room.points.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
    
    // Draw wall segments with enhanced selection feedback and connection points
    wallSegments.forEach(wall => {
      const isSelected = selectedWall?.id === wall.id;
      const isHovered = hoveredWall === wall.id;
      
      // Draw wall line
      ctx.strokeStyle = isSelected ? '#ff4444' : isHovered ? '#ffaa00' : wall.color;
      ctx.lineWidth = wall.thickness + (isSelected ? 4 : isHovered ? 2 : 0);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();

    // Draw connection points at wall endpoints with snap color change
      [wall.start, wall.end].forEach(point => {
        // Check if this point is near other endpoints for color change
        const snapResult = snapToEndpoints(point);
        
        // Draw larger visual connection point with snap color
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#ff4444' : 
                       isHovered ? '#ffaa00' : 
                       snapResult.isSnapping ? '#ef4444' : '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw larger invisible hit area for better clicking
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 15, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
      
      // Always draw clickable measurements for walls
      if (measurementUnit) {
        const isMeasurementHovered = hoveredMeasurement === wall.id;
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const distanceInMm = canvasToMm(distance, scale);
        const midX = (wall.start.x + wall.end.x) / 2;
        const midY = (wall.start.y + wall.end.y) / 2;
        
        const measurement = formatMeasurement(distanceInMm, measurementUnit, measurementUnit === 'mm' ? 0 : 2);
        
        // Draw clickable measurement with hover effects
        ctx.font = 'bold 24px Arial';
        const textWidth = ctx.measureText(measurement).width;
        const padding = 8;
        
        // Background rectangle with enhanced visibility and shadow
        const bgColor = isSelected ? 'rgba(255, 68, 68, 0.95)' : 
                        isMeasurementHovered ? 'rgba(59, 130, 246, 0.95)' : 
                        'rgba(255, 255, 255, 0.95)';
        
        // Add shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(midX - textWidth/2 - padding, midY - 18, textWidth + padding * 2, 36);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Border with enhanced visibility
        ctx.strokeStyle = isSelected ? '#ff4444' : 
                          isMeasurementHovered ? '#3b82f6' : '#000000';
        ctx.lineWidth = isMeasurementHovered ? 3 : 2;
        ctx.strokeRect(midX - textWidth/2 - padding, midY - 18, textWidth + padding * 2, 36);
        
        // Text
        ctx.fillStyle = (isSelected || isMeasurementHovered) ? '#ffffff' : '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(measurement, midX, midY);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      }
    });
    
    // Draw current room path
    if (roomPoints.length > 0) {
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
      roomPoints.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      
      // Draw points
      roomPoints.forEach(point => {
        ctx.fillStyle = '#2196f3';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // Draw wall preview line with enhanced visibility
    if (isWallPreview && wallStartPoint) {
      // Draw the line from start to current mouse position
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(wallStartPoint.x, wallStartPoint.y);
      ctx.lineTo(lastMousePos.x, lastMousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw start point
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(wallStartPoint.x, wallStartPoint.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw current mouse position
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(lastMousePos.x, lastMousePos.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw doors with scaled size and outswing radius
    doors.forEach(door => {
      const doorX = door.position.x;
      const doorY = door.position.y;
      
      // Debug: log door details
      console.log(`=== RENDERING DOOR ${door.id} ===`);
      console.log(`Door facing: ${door.facing}`);
      console.log(`Door position: (${doorX}, ${doorY})`);
      
      // Find nearest wall to scale door size
      let nearestWall = null;
      let minDistance = Infinity;
      
      for (const wall of wallSegments) {
        const distance = distanceToLineSegment(door.position, wall.start, wall.end);
        if (distance < minDistance) {
          minDistance = distance;
          nearestWall = wall;
        }
      }
      
      // Scale door to wall thickness (70% of wall thickness for door thickness, standard width)
      const wallThickness = nearestWall?.thickness || 10;
      const doorThickness = Math.max(wallThickness * 0.7, 6); // Minimum 6px
      const doorWidth = Math.min(Math.max(door.width, 60), 120); // Standard door width range (60-120px)
      
      console.log(`Wall thickness: ${wallThickness}, Door thickness: ${doorThickness}, Door width: ${doorWidth}`);
      
      // Use door.facing to determine orientation
      const isHorizontal = door.facing === 'horizontal';
      console.log(`Is horizontal door: ${isHorizontal}`);
      
      // For a door parallel to the wall:
      // - Horizontal door: wide rectangle (door width = normal, door thickness = wall thickness)
      // - Vertical door: tall rectangle (door width = wall thickness, door height = normal door width)
      const rectWidth = isHorizontal ? doorWidth : doorThickness;
      const rectHeight = isHorizontal ? doorThickness : doorWidth;
      
      console.log(`Rectangle dimensions: ${rectWidth} x ${rectHeight} (width x height)`);
      
      // Draw door rectangle with correct orientation (parallel to wall)
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(doorX - rectWidth/2, doorY - rectHeight/2, rectWidth, rectHeight);
      
      // Draw door frame outline
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 1;
      ctx.strokeRect(doorX - rectWidth/2, doorY - rectHeight/2, rectWidth, rectHeight);
      
      // Draw door swing arc (90-degree outswing by default)
      const swingRadius = (isHorizontal ? doorWidth : doorWidth) * 0.9; // Use door width for swing radius
      const swingAngle = Math.PI / 2; // 90 degrees
      
      // Determine swing direction and hinge position based on orientation
      let hingeX, hingeY, swingStartAngle;
      
       if (isHorizontal) {
         // Horizontal door (parallel to horizontal wall) - hinge at edge of door
         hingeX = doorX - rectWidth/2; // Hinge at left edge
         hingeY = doorY;
         swingStartAngle = -Math.PI/2; // Start swing downward from door
       } else {
         // Vertical door (parallel to vertical wall) - hinge at edge of door
         hingeX = doorX;
         hingeY = doorY - rectHeight/2; // Hinge at top edge
         swingStartAngle = 0; // Start swing to the right from door
       }
      
      // Draw swing arc
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(hingeX, hingeY, swingRadius, swingStartAngle, swingStartAngle + swingAngle);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw swing end position (door fully open)
      const endX = hingeX + swingRadius * Math.cos(swingStartAngle + swingAngle);
      const endY = hingeY + swingRadius * Math.sin(swingStartAngle + swingAngle);
      
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(hingeX, hingeY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw hinge point
      ctx.fillStyle = '#654321';
      ctx.beginPath();
      ctx.arc(hingeX, hingeY, 2.5, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw text annotations
    textAnnotations.forEach(annotation => {
      ctx.fillStyle = annotation.color;
      ctx.font = `${annotation.fontSize}px Arial`;
      ctx.fillText(annotation.text, annotation.position.x, annotation.position.y);
    });
    
    // Draw placed products with enhanced 2D representation
    placedProducts.forEach(product => {
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation || 0);
      
      // Use dimensions directly as they're already converted to canvas pixels
      const lengthPx = product.dimensions.length || 40;
      const widthPx = product.dimensions.width || 30;
      
      // Draw main product body
      ctx.fillStyle = product.color || '#4caf50';
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 2;
      ctx.fillRect(-lengthPx/2, -widthPx/2, lengthPx, widthPx);
      ctx.strokeRect(-lengthPx/2, -widthPx/2, lengthPx, widthPx);
      
      // Draw selection indicator and rotation handle
      if (selectedItems && selectedItems.includes(product.id)) {
        // Selection outline
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(-lengthPx/2 - 5, -widthPx/2 - 5, lengthPx + 10, widthPx + 10);
        
        // Rotation handle - larger and more visible
        ctx.fillStyle = '#ff4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(lengthPx/2 + 20, 0, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Add rotation indicator arrow
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lengthPx/2 + 14, -3);
        ctx.lineTo(lengthPx/2 + 20, 0);
        ctx.lineTo(lengthPx/2 + 14, 3);
        ctx.stroke();
        // Add rotation instruction text with better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(-40, widthPx/2 + 10, 80, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press R to rotate', 0, widthPx/2 + 24);
        ctx.textAlign = 'start';
      }
      
      ctx.restore();
    });
    
    // Show rotation hint when products are selected
    if (selectedItems && selectedItems.length > 0) {
      // Background for better visibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      const hintText = `Press R to rotate selected products (${selectedItems.length})`;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      const textWidth = ctx.measureText(hintText).width;
      ctx.fillRect(CANVAS_WIDTH / 2 - textWidth/2 - 10, 10, textWidth + 20, 25);
      
      // White text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(hintText, CANVAS_WIDTH / 2, 28);
      ctx.textAlign = 'start';
    }
    
    // Draw snap lines when near grid lines
    if (snapLines.x !== null || snapLines.y !== null) {
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      // Draw vertical snap line
      if (snapLines.x !== null) {
        ctx.beginPath();
        ctx.moveTo(snapLines.x, 0);
        ctx.lineTo(snapLines.x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      
      // Draw horizontal snap line
      if (snapLines.y !== null) {
        ctx.beginPath();
        ctx.moveTo(0, snapLines.y);
        ctx.lineTo(CANVAS_WIDTH, snapLines.y);
        ctx.stroke();
      }
      
      ctx.setLineDash([]); // Reset dash
    }

    // Draw real-time drag measurements
    if (dragMeasurements && isDragging) {
      const draggedProduct = placedProducts.find(p => p.id === draggedItem);
      if (draggedProduct) {
        const pos = draggedProduct.position;
        
        // Draw measurement lines and text
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        
        // Top measurement
        if (dragMeasurements.top > 0) {
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y - 50);
          ctx.lineTo(pos.x, pos.y - dragMeasurements.top * scale / 10);
          ctx.stroke();
          ctx.fillText(`${dragMeasurements.top}mm`, pos.x, pos.y - 60);
        }
        
        // Right measurement
        if (dragMeasurements.right > 0) {
          ctx.beginPath();
          ctx.moveTo(pos.x + 50, pos.y);
          ctx.lineTo(pos.x + dragMeasurements.right * scale / 10, pos.y);
          ctx.stroke();
          ctx.save();
          ctx.translate(pos.x + 60, pos.y);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(`${dragMeasurements.right}mm`, 0, 0);
          ctx.restore();
        }
        
        // Bottom measurement
        if (dragMeasurements.bottom > 0) {
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y + 50);
          ctx.lineTo(pos.x, pos.y + dragMeasurements.bottom * scale / 10);
          ctx.stroke();
          ctx.fillText(`${dragMeasurements.bottom}mm`, pos.x, pos.y + 70);
        }
        
        // Left measurement
        if (dragMeasurements.left > 0) {
          ctx.beginPath();
          ctx.moveTo(pos.x - 50, pos.y);
          ctx.lineTo(pos.x - dragMeasurements.left * scale / 10, pos.y);
          ctx.stroke();
          ctx.save();
          ctx.translate(pos.x - 60, pos.y);
          ctx.rotate(Math.PI / 2);
          ctx.fillText(`${dragMeasurements.left}mm`, 0, 0);
          ctx.restore();
        }
        
        ctx.setLineDash([]);
      }
    }

    // Draw door snap preview for door placement
    if (doorSnapPreview && currentMode === 'door') {
      const { point, wall } = doorSnapPreview;
      
      // Highlight the target wall
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 6;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw door preview at snap point
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.strokeStyle = 'rgb(16, 185, 129)';
      ctx.lineWidth = 2;
      ctx.fillRect(point.x - 40, point.y - 6, 80, 12);
      ctx.strokeRect(point.x - 40, point.y - 6, 80, 12);
      
      // Draw snap indicator
      ctx.fillStyle = 'rgb(16, 185, 129)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw snap guides for snapping feedback
    if (snapGuides.vertical !== null || snapGuides.horizontal !== null) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      
      // Draw vertical snap guide
      if (snapGuides.vertical !== null) {
        ctx.beginPath();
        ctx.moveTo(snapGuides.vertical, 0);
        ctx.lineTo(snapGuides.vertical, CANVAS_HEIGHT);
        ctx.stroke();
      }
      
      // Draw horizontal snap guide
      if (snapGuides.horizontal !== null) {
        ctx.beginPath();
        ctx.moveTo(0, snapGuides.horizontal);
        ctx.lineTo(CANVAS_WIDTH, snapGuides.horizontal);
        ctx.stroke();
      }
      
      ctx.setLineDash([]); // Reset dash
    }

    // Draw live measurement during wall preview with enhanced styling
    if (isWallPreview && wallStartPoint && currentLineMeasurement) {
      const startPoint = wallStartPoint;
      const endPoint = lastMousePos;
      
      // Draw measurement at midpoint
      const midX = (startPoint.x + endPoint.x) / 2;
      const midY = (startPoint.y + endPoint.y) / 2;
      
      // Draw measurement background with border
      ctx.font = 'bold 16px Arial';
      const textWidth = ctx.measureText(currentLineMeasurement).width;
      const padding = 8;
      const rectX = midX - textWidth/2 - padding;
      const rectY = midY - 16;
      const rectWidth = textWidth + (padding * 2);
      const rectHeight = 28;
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
      
      // Draw measurement text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentLineMeasurement, midX, midY);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    }
    
  }, [showGrid, gridSize, scale, rooms, wallSegments, roomPoints, wallStartPoint, isWallPreview, doors, textAnnotations, placedProducts, currentMode, currentLineMeasurement, lastMousePos, selectedWall, hoveredWall, selectedItems, measurementUnit, showMeasurements, snapLines, snapGuides]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWallPreview) {
        // Cancel wall drawing
        setWallStartPoint(null);
        setIsWallPreview(false);
        setCurrentLineMeasurement('');
        setSnapLines({ x: null, y: null });
        setSnapGuides({ horizontal: null, vertical: null });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWallPreview]);

  return (
    <div className="relative w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ width: '100%', height: '100%', maxWidth: `${CANVAS_WIDTH}px`, maxHeight: `${CANVAS_HEIGHT}px` }}
        className={`w-full h-full bg-white border ${
          currentMode === 'select' && hoveredMeasurement ? 'cursor-pointer' : 
          currentMode === 'select' ? 'cursor-default' :
          'cursor-crosshair'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onDrop={(e) => {
          e.preventDefault();
          console.log('Canvas drop event triggered');
          
          // Get the drop position
          const dropPoint = getCanvasPoint(e);
          const snappedPoint = snapToGrid(dropPoint);
          
          console.log('=== DROP EVENT ===');
          console.log('Available data transfer types:', Array.from(e.dataTransfer.types));
          
          // Get product data from application/json format
          let productData = e.dataTransfer.getData('application/json');
          
          console.log('Raw product data received:', productData);
          console.log('Data length:', productData?.length || 0);
          
          if (!productData) {
            console.error('No product data found in drop event');
            toast.error('Failed to place product - no data received');
            return;
          }
          
          try {
            const product = JSON.parse(productData);
            console.log('Parsed product:', product);
            
            const point = getCanvasPoint(e);
            const snappedPoint = snapToGrid(point);
            
            // Get accurate dimensions from database in mm
            const accurateDimensionsMm = getProductDimensionsInMm(product);
            
            if (!accurateDimensionsMm) {
              console.error('Unable to get product dimensions:', product);
              toast.error('Product dimensions not available');
              return;
            }
            
            // Convert mm dimensions to canvas pixels for accurate placement
            // Note: Use proper dimension mapping for laboratory furniture
            const canvasDimensions = {
              length: mmToCanvas(accurateDimensionsMm.width, scale),  // Width becomes length for proper display
              width: mmToCanvas(accurateDimensionsMm.depth, scale),   // Depth becomes width for proper display  
              height: mmToCanvas(accurateDimensionsMm.height, scale)  // Height remains height
            };
            
            const originalDimensions = {
              length: accurateDimensionsMm.width,   // Store actual width as length for display
              width: accurateDimensionsMm.depth,    // Store actual depth as width for display
              height: accurateDimensionsMm.height   // Height remains height
            };
            
            // Add 50mm spacing to prevent overlapping when placing side by side
            const spacingMm = 50;
            const spacingPx = mmToCanvas(spacingMm, scale);
            
            // Check for nearby products and adjust position to maintain spacing
            let adjustedPosition = { ...snappedPoint };
            for (const existingProduct of placedProducts) {
              const distance = Math.sqrt(
                Math.pow(snappedPoint.x - existingProduct.position.x, 2) + 
                Math.pow(snappedPoint.y - existingProduct.position.y, 2)
              );
              
              const minDistance = (canvasDimensions.length + existingProduct.dimensions.length) / 2 + spacingPx;
              
              if (distance < minDistance) {
                // Move product to maintain spacing
                const angle = Math.atan2(
                  snappedPoint.y - existingProduct.position.y,
                  snappedPoint.x - existingProduct.position.x
                );
                adjustedPosition.x = existingProduct.position.x + Math.cos(angle) * minDistance;
                adjustedPosition.y = existingProduct.position.y + Math.sin(angle) * minDistance;
              }
            }
            
            const newProduct: PlacedProduct = {
              id: `product-${Date.now()}`,
              productId: product.id,
              name: product.name,
              category: product.category || 'Unknown',
              position: adjustedPosition,
              rotation: 0,
              dimensions: canvasDimensions, // Use accurate canvas dimensions
              originalDimensions: originalDimensions, // Store original mm dimensions
              color: product.color || '#4caf50',
              scale: 1,
              modelPath: product.modelPath,
              thumbnail: product.thumbnail,
              description: product.description,
              specifications: product.specifications,
              finishes: product.finishes,
              variants: product.variants
            };
            
            // Check for wall collision with accurate dimensions before placing
            // Allow placement even if no walls exist (empty canvas scenario)
            const hasWallCollision = wallSegments.length > 0 ? checkWallCollision(newProduct) : false;
            
            if (!hasWallCollision) {
              // Apply island/bench wall snapping if applicable and walls exist
              const snappedPosition = wallSegments.length > 0 ? snapToWallDistance(newProduct) : newProduct.position;
              newProduct.position = snappedPosition;
              
              setPlacedProducts(prev => [...prev, newProduct]);
              
              console.log('Product placed successfully:', newProduct);
              
              console.log('Product placed with accurate dimensions:', {
                name: newProduct.name,
                originalMmDimensions: accurateDimensionsMm,
                canvasPixelDimensions: canvasDimensions,
                position: newProduct.position
              });
              
              toast.success(`${newProduct.name} placed successfully`);
            } else {
              console.log('Product placement blocked due to wall collision');
              toast.error('Cannot place product - it would intersect with a wall');
            }
          } catch (error) {
            console.error('Error placing product:', error);
            toast.error('Failed to place product - invalid data format');
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
      />
      
      {/* Measurement editing input */}
      {editingMeasurement && (
        <div 
          className="absolute bg-white border-2 border-blue-500 rounded px-2 py-1 shadow-lg z-10"
          style={{
            left: '50%',
            top: '20px',
            transform: 'translateX(-50%)'
          }}
        >
          <input
            type="number"
            value={editingMeasurement.value}
            onChange={(e) => setEditingMeasurement(prev => 
              prev ? { ...prev, value: e.target.value } : null
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const newLength = parseInt(editingMeasurement.value);
                if (!isNaN(newLength) && newLength > 0) {
                  adjustWallLength(editingMeasurement.wallId, newLength);
                }
                setEditingMeasurement(null);
              } else if (e.key === 'Escape') {
                setEditingMeasurement(null);
              }
            }}
            onBlur={() => {
              const newLength = parseInt(editingMeasurement.value);
              if (!isNaN(newLength) && newLength > 0) {
                adjustWallLength(editingMeasurement.wallId, newLength);
              }
              setEditingMeasurement(null);
            }}
            className="w-24 text-center border-none outline-none bg-transparent font-bold text-blue-600"
            autoFocus
          />
          <span className="text-sm text-gray-600 ml-1">mm</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedCanvasWorkspace;
