
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });
  const [currentLineMeasurement, setCurrentLineMeasurement] = useState<string>('');
  const [selectedWall, setSelectedWall] = useState<WallSegment | null>(null);
  const [hoveredWall, setHoveredWall] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

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

  const snapToEndpoints = useCallback((point: Point): Point | null => {
    const endpoints = findWallEndpoints();
    const snapDistance = 15; // Snap distance in pixels
    
    for (const endpoint of endpoints) {
      const distance = Math.sqrt(
        Math.pow(point.x - endpoint.x, 2) + Math.pow(point.y - endpoint.y, 2)
      );
      
      if (distance <= snapDistance) {
        return endpoint;
      }
    }
    return null;
  }, [findWallEndpoints]);

  const findWallAtPoint = useCallback((point: Point): WallSegment | null => {
    const tolerance = 10; // pixels
    
    for (const wall of wallSegments) {
      const distance = distanceFromPointToLine(point, wall.start, wall.end);
      if (distance <= tolerance) {
        return wall;
      }
    }
    return null;
  }, [wallSegments]);

  const distanceFromPointToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    const param = dot / lenSq;
    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    const snappedPoint = snapToGrid(point);
    setLastMousePos(snappedPoint);
    
    if (currentMode === 'select') {
      // Check if clicking on a wall for selection
      const clickedWall = findWallAtPoint(snappedPoint);
      if (clickedWall) {
        setSelectedWall(clickedWall);
        return;
      } else {
        setSelectedWall(null);
      }
    }
    
    if (currentMode === 'wall') {
      setIsDrawing(true);
      setCurrentPath([snappedPoint]);
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
  }, [currentMode, getCanvasPoint, snapToGrid, setRoomPoints, setDoors, setTextAnnotations, findWallAtPoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    
    if (isDrawing && currentMode === 'wall' && currentPath.length > 0) {
      // Try snapping to endpoints first, then grid
      const snappedToEndpoint = snapToEndpoints(point);
      const finalPoint = snappedToEndpoint || snapToGrid(point);
      setLastMousePos(finalPoint);
      
      const startPoint = currentPath[0];
      const dx = finalPoint.x - startPoint.x;
      const dy = finalPoint.y - startPoint.y;
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
      
      if (currentMode === 'wall') {
        setCurrentLineMeasurement('');
      }
    }
    
    // Handle wall hover for better UX
    if (currentMode === 'select') {
      const hoveredWallFound = findWallAtPoint(point);
      setHoveredWall(hoveredWallFound?.id || null);
    }
  }, [isDrawing, currentMode, getCanvasPoint, snapToGrid, snapToEndpoints, currentPath, scale, measurementUnit, findWallAtPoint, showGrid, gridSize]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentMode === 'wall' && currentPath.length >= 1) {
      const newWallSegment: WallSegment = {
        id: `wall-${Date.now()}`,
        start: currentPath[0],
        end: lastMousePos,
        thickness: 10,
        color: '#666666',
        type: WallType.INTERIOR
      };
      setWallSegments(prev => [...prev, newWallSegment]);
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
    setCurrentLineMeasurement('');
    setSnapLines({ x: null, y: null });
  }, [isDrawing, currentMode, currentPath, setWallSegments, lastMousePos]);

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

      // Draw connection points at wall endpoints
      [wall.start, wall.end].forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#ff4444' : isHovered ? '#ffaa00' : '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      
      // Draw wall measurements if selected with larger text
      if ((isSelected || showMeasurements) && measurementUnit) {
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
        
        // Draw measurement background with better styling
        ctx.font = '16px Arial'; // Increased from 11px
        const textWidth = ctx.measureText(measurement).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(midX - textWidth/2 - 6, midY - 12, textWidth + 12, 24);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - textWidth/2 - 6, midY - 12, textWidth + 12, 24);
        
        // Draw measurement text
        ctx.fillStyle = '#ffffff';
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
    
    // Draw current drawing path with enhanced visibility
    if (currentPath.length > 0) {
      // Draw the line from start to current mouse position
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      ctx.lineTo(lastMousePos.x, lastMousePos.y);
      ctx.stroke();
      
      // Draw start point
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(currentPath[0].x, currentPath[0].y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw current mouse position
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(lastMousePos.x, lastMousePos.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw doors
    doors.forEach(door => {
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(door.position.x - door.width/2, door.position.y - 10, door.width, 20);
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

    // Draw live measurement during wall drawing with enhanced styling and start/end indicators
    if (isDrawing && currentMode === 'wall' && currentPath.length > 0 && currentLineMeasurement) {
      const startPoint = currentPath[0];
      const endPoint = lastMousePos;
      
      // Draw start point indicator
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw end point indicator
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw measurement at midpoint
      const midX = (startPoint.x + endPoint.x) / 2;
      const midY = (startPoint.y + endPoint.y) / 2;
      
      // Draw measurement background with border
      ctx.font = 'bold 16px Arial'; // Increased from 12px
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
    
  }, [showGrid, gridSize, scale, rooms, wallSegments, roomPoints, currentPath, doors, textAnnotations, placedProducts, isDrawing, currentMode, currentLineMeasurement, lastMousePos, selectedWall, hoveredWall, selectedItems, measurementUnit, showMeasurements, snapLines]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ width: '100%', height: '100%', maxWidth: `${CANVAS_WIDTH}px`, maxHeight: `${CANVAS_HEIGHT}px` }}
        className="w-full h-full cursor-crosshair bg-white border"
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
    </div>
  );
};

export default EnhancedCanvasWorkspace;
