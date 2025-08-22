
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, Room, DrawingMode, WallType } from '@/types/floorPlanTypes';
import { GRID_SIZES, MeasurementUnit, formatMeasurement, canvasToMm } from '@/utils/measurements';

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
  onClearAll
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wallStartPoint, setWallStartPoint] = useState<Point | null>(null);
  const [isWallPreview, setIsWallPreview] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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
  const [hoveredMeasurement, setHoveredMeasurement] = useState<string | null>(null);

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

  const snapToEndpoints = useCallback((point: Point): { point: Point | null, showGuides: boolean } => {
    const endpoints = findWallEndpoints();
    const snapDistance = 40; // Increased snap distance for better sensitivity
    
    for (const endpoint of endpoints) {
      const distance = Math.sqrt(
        Math.pow(point.x - endpoint.x, 2) + Math.pow(point.y - endpoint.y, 2)
      );
      
      if (distance <= snapDistance) {
        return { point: endpoint, showGuides: true };
      }
    }
    return { point: null, showGuides: false };
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
    const newLengthPx = (newLengthMm / 1000) * scale * 100; // Convert mm to pixels
    
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
  }, [wallSegments, setWallSegments, scale, findConnectedWalls]);

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
      
      // Check if clicking on a wall for selection
      const clickedWall = findWallAtPoint(snappedPoint);
      if (clickedWall) {
        setSelectedWall(clickedWall);
        return;
      } else {
        setSelectedWall(null);
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
        // First click - start wall drawing
        setWallStartPoint(snappedPoint);
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
      const newDoor: Door = {
        id: `door-${Date.now()}`,
        position: snappedPoint,
        width: 80,
        wallId: undefined,
        wallSegmentId: undefined,
        wallPosition: undefined,
        isEmbedded: false
      };
      setDoors(prev => [...prev, newDoor]);
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
        const newPosition = {
          x: point.x - dragOffset.x,
          y: point.y - dragOffset.y
        };
        const snappedPosition = snapToGrid(newPosition);
        
        setPlacedProducts(prev => prev.map(p => 
          p.id === draggedItem ? { ...p, position: snappedPosition } : p
        ));
      }
      return;
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
      
      setCurrentLineMeasurement(formatMeasurement(distanceInMm, { 
        unit: measurementUnit, 
        precision: measurementUnit === 'mm' ? 0 : 2, 
        showUnit: true 
      }));

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

      // Draw connection points at wall endpoints with enhanced size and visibility
      [wall.start, wall.end].forEach(point => {
        // Draw larger visual connection point
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#ff4444' : isHovered ? '#ffaa00' : '#3b82f6';
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
        
        const measurement = formatMeasurement(distanceInMm, { 
          unit: measurementUnit, 
          precision: measurementUnit === 'mm' ? 0 : 2, 
          showUnit: true 
        });
        
        // Draw clickable measurement with hover effects
        ctx.font = 'bold 14px Arial';
        const textWidth = ctx.measureText(measurement).width;
        const padding = 8;
        
        // Background rectangle with hover and selection states
        const bgColor = isSelected ? 'rgba(255, 68, 68, 0.9)' : 
                        isMeasurementHovered ? 'rgba(59, 130, 246, 0.9)' : 
                        'rgba(255, 255, 255, 0.9)';
        ctx.fillStyle = bgColor;
        ctx.fillRect(midX - textWidth/2 - padding, midY - 12, textWidth + padding * 2, 24);
        
        // Border with cursor indication
        ctx.strokeStyle = isSelected ? '#ff4444' : 
                          isMeasurementHovered ? '#3b82f6' : '#cccccc';
        ctx.lineWidth = isMeasurementHovered ? 2 : 1;
        ctx.strokeRect(midX - textWidth/2 - padding, midY - 12, textWidth + padding * 2, 24);
        
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
    
    // Draw doors with outswing radius
    doors.forEach(door => {
      const doorX = door.position.x;
      const doorY = door.position.y;
      const doorWidth = door.width;
      const doorThickness = 10;
      
      // Draw door rectangle
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(doorX - doorWidth/2, doorY - doorThickness/2, doorWidth, doorThickness);
      
      // Draw door frame outline
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 1;
      ctx.strokeRect(doorX - doorWidth/2, doorY - doorThickness/2, doorWidth, doorThickness);
      
      // Draw door swing arc (90-degree outswing by default)
      const swingRadius = doorWidth;
      const swingAngle = Math.PI / 2; // 90 degrees
      
      // Determine swing direction (assume outswing to the right by default)
      const swingDirection = 1; // 1 for right, -1 for left
      const hingeX = doorX - (doorWidth/2) * swingDirection;
      const hingeY = doorY;
      
      // Draw swing arc
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(hingeX, hingeY, swingRadius, 0, swingAngle * swingDirection);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw swing end position (door fully open)
      const endX = hingeX + swingRadius * Math.cos(swingAngle * swingDirection);
      const endY = hingeY + swingRadius * Math.sin(swingAngle * swingDirection);
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(hingeX, hingeY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw hinge point
      ctx.fillStyle = '#654321';
      ctx.beginPath();
      ctx.arc(hingeX, hingeY, 3, 0, 2 * Math.PI);
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
      
      // Scale dimensions from mm to canvas pixels
      const lengthPx = (product.dimensions.length * scale) || 40;
      const widthPx = (product.dimensions.width * scale) || 30;
      const heightPx = (product.dimensions.height * scale) || 20;
      
      // Draw main product body
      ctx.fillStyle = product.color || '#4caf50';
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 2;
      ctx.fillRect(-lengthPx/2, -widthPx/2, lengthPx, widthPx);
      ctx.strokeRect(-lengthPx/2, -widthPx/2, lengthPx, widthPx);
      
      // Draw depth indicator (3D effect)
      const depthOffset = Math.min(heightPx * 0.3, 8);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(-lengthPx/2 + depthOffset, -widthPx/2 + depthOffset, lengthPx, widthPx);
      
      // Draw rotation handle
      if (selectedItems.includes(product.id)) {
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(-lengthPx/2 - 3, -widthPx/2 - 3, lengthPx + 6, widthPx + 6);
        
        // Rotation handle
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(lengthPx/2 + 15, 0, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.restore();
      
      // Draw product name and dimensions
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial';
      const shortName = product.name.length > 15 ? product.name.substring(0, 12) + '...' : product.name;
      const textWidth = ctx.measureText(shortName).width;
      ctx.fillText(shortName, product.position.x - textWidth/2, product.position.y - (widthPx/2) - 8);
      
      // Show dimensions when selected
      if (selectedItems.includes(product.id)) {
        ctx.font = '9px Arial';
        ctx.fillStyle = '#666666';
        const dimensionText = `${Math.round(product.dimensions.length)}×${Math.round(product.dimensions.width)}mm`;
        const dimWidth = ctx.measureText(dimensionText).width;
        ctx.fillText(dimensionText, product.position.x - dimWidth/2, product.position.y + (widthPx/2) + 15);
      }
    });
    
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
          const productData = e.dataTransfer.getData('product');
          if (!productData) return;
          
          try {
            const product = JSON.parse(productData);
            const point = getCanvasPoint(e);
            const snappedPoint = snapToGrid(point);
            
            const newProduct: PlacedProduct = {
              id: `product-${Date.now()}`,
              productId: product.id,
              name: product.name,
              category: product.category || 'Unknown',
              position: snappedPoint,
              rotation: 0,
              dimensions: {
                length: product.dimensions?.length || 500,
                width: product.dimensions?.width || 400,
                height: product.dimensions?.height || 800
              },
              color: product.color || '#4caf50',
              scale: 1,
              modelPath: product.modelPath,
              thumbnail: product.thumbnail,
              description: product.description,
              specifications: product.specifications,
              finishes: product.finishes,
              variants: product.variants
            };
            
            setPlacedProducts(prev => [...prev, newProduct]);
          } catch (error) {
            console.error('Error placing product:', error);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
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
