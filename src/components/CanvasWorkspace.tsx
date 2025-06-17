import React, { useState, useRef, useEffect } from 'react';
import { Point, PlacedProduct, Door, TextAnnotation } from '@/types/floorPlanTypes';
import { isPointInPolygon, isProductWithinRoom, getRotatedRectangleCorners, closestPointOnLineSegment, findClosestWallSegment, getWallAngle, findOptimalDoorPosition, checkDoorConflict } from '@/utils/collisionDetection';
import { toast } from 'sonner';

interface CanvasWorkspaceProps {
  roomPoints: Point[];
  setRoomPoints: (points: Point[]) => void;
  placedProducts: PlacedProduct[];
  setPlacedProducts: (products: PlacedProduct[]) => void;
  doors: Door[];
  setDoors: (doors: Door[]) => void;
  textAnnotations: TextAnnotation[];
  setTextAnnotations: (annotations: TextAnnotation[]) => void;
  scale: number;
  currentTool: string;
  showGrid: boolean;
  showRuler: boolean;
  onClearAll: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  roomPoints,
  setRoomPoints,
  placedProducts,
  setPlacedProducts,
  doors,
  setDoors,
  textAnnotations,
  setTextAnnotations,
  scale,
  currentTool,
  showGrid,
  showRuler,
  onClearAll,
  canvasRef
}) => {
  const [mousePosition, setMousePosition] = useState<Point | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });
  const [selectedProduct, setSelectedProduct] = useState<PlacedProduct | null>(null);
  const [selectedText, setSelectedText] = useState<TextAnnotation | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotationStartAngle, setRotationStartAngle] = useState<number>(0);
  const [rotatingProduct, setRotatingProduct] = useState<PlacedProduct | null>(null);
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
  const [wallEditStartPoint, setWallEditStartPoint] = useState<Point | null>(null);
  const [wallEditOriginalLength, setWallEditOriginalLength] = useState<number>(0);

  const doorWidth = 90;

  // Enhanced crosshair rendering with pixel-perfect accuracy
  const drawCrosshair = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    
    // Use pixel-perfect positioning by rounding to nearest pixel
    const pixelX = Math.round(x);
    const pixelY = Math.round(y);
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.lineCap = 'butt';
    ctx.setLineDash([]);
    
    // Ensure crisp lines by offsetting by 0.5 for odd line widths
    const offset = 0.5;
    
    // Draw crosshair with precise pixel alignment
    ctx.beginPath();
    // Horizontal line
    ctx.moveTo(pixelX - 15 + offset, pixelY + offset);
    ctx.lineTo(pixelX + 15 + offset, pixelY + offset);
    // Vertical line
    ctx.moveTo(pixelX + offset, pixelY - 15 + offset);
    ctx.lineTo(pixelX + offset, pixelY + 15 + offset);
    ctx.stroke();
    
    // Add center dot for precision
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  };

  // Enhanced grid drawing with proper alignment
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    if (!showGrid) return;
    
    ctx.save();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.6;
    
    const gridSize = 20;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Calculate grid offset to ensure alignment
    const offsetX = (offset.x % gridSize + gridSize) % gridSize;
    const offsetY = (offset.y % gridSize + gridSize) % gridSize;
    
    ctx.beginPath();
    
    // Vertical lines with pixel-perfect positioning
    for (let x = offsetX; x < width; x += gridSize) {
      const pixelX = Math.round(x) + 0.5;
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, height);
    }
    
    // Horizontal lines with pixel-perfect positioning
    for (let y = offsetY; y < height; y += gridSize) {
      const pixelY = Math.round(y) + 0.5;
      ctx.moveTo(0, pixelY);
      ctx.lineTo(width, pixelY);
    }
    
    ctx.stroke();
    ctx.restore();
  };

  // Enhanced snap to grid function with precise alignment
  const snapToGrid = (point: Point, gridSize: number = 20): Point => {
    const snappedX = Math.round((point.x - offset.x) / gridSize) * gridSize + offset.x;
    const snappedY = Math.round((point.y - offset.y) / gridSize) * gridSize + offset.y;
    return { x: snappedX, y: snappedY };
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.max(0.2, Math.min(5, prevZoom * scaleFactor)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (e.buttons === 2) {
      setIsPanning(true);
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
      return;
    }

    const canvasX = (x - offset.x) / zoom;
    const canvasY = (y - offset.y) / zoom;

    if (currentTool === 'select') {
      // Check if a product is clicked
      const clickedProduct = placedProducts.find(product => {
        if (!product.dimensions) return false;
        const productScale = product.scale || 1;
        const width = product.dimensions.length * scale * productScale * zoom;
        const height = product.dimensions.width * scale * productScale * zoom;
        const corners = getRotatedRectangleCorners(
          { x: product.position.x * zoom + offset.x, y: product.position.y * zoom + offset.y },
          width,
          height,
          product.rotation
        );
        return isPointInPolygon({ x: e.clientX, y: e.clientY }, corners);
      });

      if (clickedProduct) {
        setSelectedProduct(clickedProduct);
        setIsDragging(true);
        canvas.style.cursor = 'move';
        return;
      }

      // Check if a text annotation is clicked
      const clickedText = textAnnotations.find(text => {
        const textWidth = text.text.length * 8;
        const textHeight = 16;
        return (
          canvasX >= text.position.x &&
          canvasX <= text.position.x + textWidth / zoom &&
          canvasY >= text.position.y &&
          canvasY <= text.position.y + textHeight / zoom
        );
      });

      if (clickedText) {
        setSelectedText(clickedText);
        setIsDragging(true);
        canvas.style.cursor = 'move';
        return;
      }

      setSelectedProduct(null);
      setSelectedText(null);
    }

    if (currentTool === 'rotate') {
      const clickedProduct = placedProducts.find(product => {
        if (!product.dimensions) return false;
        const productScale = product.scale || 1;
        const width = product.dimensions.length * scale * productScale * zoom;
        const height = product.dimensions.width * scale * productScale * zoom;
        const corners = getRotatedRectangleCorners(
          { x: product.position.x * zoom + offset.x, y: product.position.y * zoom + offset.y },
          width,
          height,
          product.rotation
        );
        return isPointInPolygon({ x: e.clientX, y: e.clientY }, corners);
      });

      if (clickedProduct) {
        setRotatingProduct(clickedProduct);
        setIsDragging(true);
        const dx = x - (clickedProduct.position.x * zoom + offset.x);
        const dy = y - (clickedProduct.position.y * zoom + offset.y);
        setRotationStartAngle(Math.atan2(dy, dx) - (clickedProduct.rotation * Math.PI) / 180);
        canvas.style.cursor = 'grabbing';
        return;
      }
    }

    if (currentTool === 'wall-edit') {
      const clickPoint = { x: canvasX, y: canvasY };
      const closestWall = findClosestWallSegment(clickPoint, roomPoints);

      if (closestWall && closestWall.distance < 10) {
        setSelectedWallIndex(closestWall.index);
        setWallEditStartPoint(clickPoint);

        const wallStart = roomPoints[closestWall.index];
        const wallEnd = roomPoints[(closestWall.index + 1) % roomPoints.length];
        const originalLength = Math.sqrt(Math.pow(wallEnd.x - wallStart.x, 2) + Math.pow(wallEnd.y - wallStart.y, 2));
        setWallEditOriginalLength(originalLength);
        canvas.style.cursor = 'grab';
        return;
      }
    }

    if (currentTool === 'wall') {
      const snapped = snapToGrid({ x: canvasX, y: canvasY });
      setRoomPoints((prev: Point[]) => [...prev, snapped]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    setIsPanning(false);
    setIsDragging(false);
    setRotatingProduct(null);
    setSelectedWallIndex(null);
    canvas.style.cursor = 'default';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Use precise mouse positioning
    const rawX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const rawY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Snap to grid for precise positioning
    const snapped = snapToGrid({ x: rawX, y: rawY });
    setMousePosition(snapped);

    // Enhanced panning with reduced sensitivity
    if (isPanning && e.buttons === 2) {
      const deltaX = (e.clientX - lastPanPosition.current.x) * 0.3; // Reduced sensitivity
      const deltaY = (e.clientY - lastPanPosition.current.y) * 0.3; // Reduced sensitivity
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const canvasX = (rawX - offset.x) / zoom;
    const canvasY = (rawY - offset.y) / zoom;

    if (isDragging) {
      if (selectedProduct) {
        const newX = canvasX;
        const newY = canvasY;

        // Collision detection with room boundaries
        const tempProduct = { ...selectedProduct, position: { x: newX, y: newY } };
        if (isProductWithinRoom(tempProduct, roomPoints, scale)) {
          setPlacedProducts((prev: PlacedProduct[]) =>
            prev.map(p =>
              p.id === selectedProduct.id ? { ...p, position: { x: newX, y: newY } } : p
            )
          );
        } else {
          toast.error('Cannot move product outside the room');
        }
      }

      if (selectedText) {
        const newX = canvasX;
        const newY = canvasY;

        setTextAnnotations((prev: TextAnnotation[]) =>
          prev.map(text =>
            text.id === selectedText.id ? { ...text, position: { x: newX, y: newY } } : text
          )
        );
      }

      if (rotatingProduct) {
        const dx = rawX - (rotatingProduct.position.x * zoom + offset.x);
        const dy = rawY - (rotatingProduct.position.y * zoom + offset.y);
        let angle = Math.atan2(dy, dx) - rotationStartAngle;
        angle = angle * 180 / Math.PI;

        // Snap to 45-degree increments
        const snappedAngle = Math.round(angle / 45) * 45;

        setPlacedProducts((prev: PlacedProduct[]) =>
          prev.map(p =>
            p.id === rotatingProduct.id ? { ...p, rotation: snappedAngle } : p
          )
        );
      }
    }

    if (selectedWallIndex !== null && currentTool === 'wall-edit') {
      if (wallEditStartPoint) {
        const wallStart = roomPoints[selectedWallIndex];
        const currentPoint = { x: canvasX, y: canvasY };

        const originalAngle = Math.atan2(
          roomPoints[(selectedWallIndex + 1) % roomPoints.length].y - wallStart.y,
          roomPoints[(selectedWallIndex + 1) % roomPoints.length].x - wallStart.x
        );

        const newLength = Math.sqrt(Math.pow(currentPoint.x - wallStart.x, 2) + Math.pow(currentPoint.y - wallStart.y, 2));

        const newX = wallStart.x + Math.cos(originalAngle) * newLength;
        const newY = wallStart.y + Math.sin(originalAngle) * newLength;

        const updatedPoints = [...roomPoints];
        updatedPoints[(selectedWallIndex + 1) % roomPoints.length] = { x: newX, y: newY };
        setRoomPoints(updatedPoints);
      }
    }
  };

  const handleMouseLeave = () => {
    setMousePosition(null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    if (currentTool === 'wall') {
      setRoomPoints((prev: Point[]) => {
        if (prev.length > 2) {
          // Remove the last point (most recent click)
          return prev.slice(0, -1);
        }
        return prev;
      });
    }

    if (currentTool === 'text') {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      const canvasX = (x - offset.x) / zoom;
      const canvasY = (y - offset.y) / zoom;

      const newText = prompt('Enter text:');
      if (newText) {
        const snapped = snapToGrid({ x: canvasX, y: canvasY });
        setTextAnnotations((prev: TextAnnotation[]) => [...prev, { 
          id: Date.now().toString(), 
          text: newText, 
          position: snapped,
          fontSize: 16
        }]);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setRoomPoints([]);
    }

    if (e.key === 'Delete') {
      if (selectedProduct) {
        setPlacedProducts((prev: PlacedProduct[]) => prev.filter(p => p.id !== selectedProduct.id));
        setSelectedProduct(null);
      }

      if (selectedText) {
        setTextAnnotations((prev: TextAnnotation[]) => prev.filter(text => text.id !== selectedText.id));
        setSelectedText(null);
      }
    }

    if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (selectedProduct) {
        const newProduct = { ...selectedProduct, id: Date.now().toString() };
        setPlacedProducts((prev: PlacedProduct[]) => [...prev, newProduct]);
        setSelectedProduct(newProduct);
        toast.success('Product duplicated');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const productData = e.dataTransfer.getData('product');
    if (productData) {
      try {
        const product = JSON.parse(productData);
        const canvas = canvasRef?.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        const canvasX = (x - offset.x) / zoom;
        const canvasY = (y - offset.y) / zoom;

        const snapped = snapToGrid({ x: canvasX, y: canvasY });

        const newProduct: PlacedProduct = {
          ...product,
          id: Date.now().toString(),
          productId: product.id,
          position: snapped,
          rotation: 0,
          scale: 1
        };

        if (isProductWithinRoom(newProduct, roomPoints, scale)) {
          setPlacedProducts((prev: PlacedProduct[]) => [...prev, newProduct]);
          toast.success(`${product.name} placed`);
        } else {
          toast.error('Cannot place product outside the room');
        }
      } catch (error) {
        console.error('Error parsing product data:', error);
        toast.error('Failed to place product');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const canvasX = (x - offset.x) / zoom;
    const canvasY = (y - offset.y) / zoom;

    if (currentTool === 'eraser') {
      // Erase product
      const clickedProduct = placedProducts.find(product => {
        if (!product.dimensions) return false;
        const productScale = product.scale || 1;
        const width = product.dimensions.length * scale * productScale * zoom;
        const height = product.dimensions.width * scale * productScale * zoom;
        const corners = getRotatedRectangleCorners(
          { x: product.position.x * zoom + offset.x, y: product.position.y * zoom + offset.y },
          width,
          height,
          product.rotation
        );
        return isPointInPolygon({ x: e.clientX, y: e.clientY }, corners);
      });

      if (clickedProduct) {
        setPlacedProducts((prev: PlacedProduct[]) => prev.filter(p => p.id !== clickedProduct.id));
        toast.success('Product removed');
        return;
      }

      // Erase text
      const clickedText = textAnnotations.find(text => {
        const textWidth = text.text.length * 8;
        const textHeight = 16;
        return (
          canvasX >= text.position.x &&
          canvasX <= text.position.x + textWidth / zoom &&
          canvasY >= text.position.y &&
          canvasY <= text.position.y + textHeight / zoom
        );
      });

      if (clickedText) {
        setTextAnnotations((prev: TextAnnotation[]) => prev.filter(text => text.id !== clickedText.id));
        toast.success('Text removed');
        return;
      }

      // Erase wall point
      const clickPoint = { x: canvasX, y: canvasY };
      const closestWall = findClosestWallSegment(clickPoint, roomPoints);

      if (closestWall && closestWall.distance < 10) {
        const updatedPoints = [...roomPoints];
        updatedPoints.splice(closestWall.index, 1);
        setRoomPoints(updatedPoints);
        toast.success('Wall point removed');
        return;
      }
    }

    if (currentTool === 'door') {
      const clickPoint = { x: canvasX, y: canvasY };
      const closestWallResult = findClosestWallSegment(clickPoint, roomPoints);

      if (closestWallResult) {
        const { segment, index } = closestWallResult;
        const optimalPosition = findOptimalDoorPosition(clickPoint, segment);

        // Check for door conflicts
        const newDoor: Door = {
          id: Date.now().toString(),
          position: optimalPosition.position,
          rotation: optimalPosition.rotation,
          width: doorWidth,
          wallPosition: optimalPosition.wallPosition,
          wallSegmentIndex: index,
          swingDirection: 'inward',
          isEmbedded: true
        };

        if (!checkDoorConflict(newDoor, doors, doorWidth)) {
          setDoors((prev: Door[]) => [...prev, newDoor]);
          toast.success('Door placed');
        } else {
          toast.error('Door placement conflicts with existing door');
        }
      } else {
        toast.error('No wall found nearby');
      }
    }
  };

  const draw = () => {
    const canvas = canvasRef?.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas with pixel-perfect clearing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transform for panning/zooming
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw grid first (with proper alignment)
    drawGrid(ctx);

    // Draw room
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    if (roomPoints.length > 0) {
      ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
      for (let i = 1; i < roomPoints.length; i++) {
        ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
      }
      if (roomPoints.length > 2) {
        ctx.closePath();
      }
      ctx.stroke();
    }

    // Draw products
    placedProducts.forEach(product => {
      if (!product.dimensions) return;
      ctx.save();
      ctx.translate(product.position.x, product.position.y);
      ctx.rotate(product.rotation * Math.PI / 180);
      ctx.fillStyle = product.color || '#2563eb';
      const productScale = product.scale || 1;
      const length = product.dimensions.length * scale * productScale;
      const width = product.dimensions.width * scale * productScale;
      ctx.fillRect(-length / 2, -width / 2, length, width);
      ctx.restore();
    });

    // Draw doors
    doors.forEach(door => {
      ctx.save();
      ctx.translate(door.position.x, door.position.y);
      ctx.rotate(door.rotation * Math.PI / 180);

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, door.width / 2, 0, Math.PI / 2);
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, -5, door.width / 2, 10);
      ctx.restore();
    });

    // Draw text annotations
    textAnnotations.forEach(text => {
      ctx.fillStyle = '#000';
      ctx.font = `${text.fontSize || 16}px sans-serif`;
      ctx.fillText(text.text, text.position.x, text.position.y);
    });

    // Draw measurements
    if (showRuler && roomPoints.length > 1) {
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = '#f43f5e';
      ctx.lineWidth = 1;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';

      for (let i = 0; i < roomPoints.length; i++) {
        const startPoint = roomPoints[i];
        const endPoint = roomPoints[(i + 1) % roomPoints.length];

        const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        const meters = distance / scale;
        const text = `${meters.toFixed(2)}m`;

        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;

        const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);

        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }

    ctx.restore();

    // Draw crosshair last (in screen coordinates for accuracy)
    if (mousePosition && (currentTool === 'wall' || currentTool === 'door' || currentTool === 'text')) {
      drawCrosshair(ctx, mousePosition.x, mousePosition.y);
    }

    // Draw selection handles
    if (selectedProduct) {
      ctx.save();
      ctx.translate(selectedProduct.position.x * zoom + offset.x, selectedProduct.position.y * zoom + offset.y);
      ctx.fillStyle = 'rgba(0, 119, 255, 0.3)';
      const productScale = selectedProduct.scale || 1;
      const length = selectedProduct.dimensions.length * scale * productScale * zoom;
      const width = selectedProduct.dimensions.width * scale * productScale * zoom;
      ctx.fillRect(-length / 2, -width / 2, length, width);
      ctx.restore();
    }

    if (selectedText) {
      ctx.save();
      ctx.translate(selectedText.position.x * zoom + offset.x, selectedText.position.y * zoom + offset.y);
      ctx.fillStyle = 'rgba(0, 119, 255, 0.3)';
      const textWidth = selectedText.text.length * 8;
      const textHeight = 16;
      ctx.fillRect(0, 0, textWidth, textHeight);
      ctx.restore();
    }

    if (rotatingProduct) {
      ctx.save();
      ctx.translate(rotatingProduct.position.x * zoom + offset.x, rotatingProduct.position.y * zoom + offset.y);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  };

  // Create wrapper functions for native event handlers
  const handleNativeMouseDown = (e: MouseEvent) => {
    handleMouseDown(e as any);
  };

  const handleNativeMouseUp = (e: MouseEvent) => {
    handleMouseUp(e as any);
  };

  const handleNativeMouseMove = (e: MouseEvent) => {
    handleMouseMove(e as any);
  };

  const handleNativeMouseLeave = () => {
    handleMouseLeave();
  };

  const handleNativeDoubleClick = (e: MouseEvent) => {
    handleDoubleClick(e as any);
  };

  const handleNativeDragOver = (e: DragEvent) => {
    handleDragOver(e as any);
  };

  const handleNativeDrop = (e: DragEvent) => {
    handleDrop(e as any);
  };

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    canvas.width = 1600;
    canvas.height = 1200;

    draw();

    canvas.addEventListener('wheel', handleWheel as any);
    canvas.addEventListener('mousedown', handleNativeMouseDown);
    canvas.addEventListener('mouseup', handleNativeMouseUp);
    canvas.addEventListener('mousemove', handleNativeMouseMove);
    canvas.addEventListener('mouseleave', handleNativeMouseLeave);
    canvas.addEventListener('dblclick', handleNativeDoubleClick);
    canvas.addEventListener('dragover', handleNativeDragOver);
    canvas.addEventListener('drop', handleNativeDrop);
    canvas.addEventListener('click', handleClick as any);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('wheel', handleWheel as any);
      canvas.removeEventListener('mousedown', handleNativeMouseDown);
      canvas.removeEventListener('mouseup', handleNativeMouseUp);
      canvas.removeEventListener('mousemove', handleNativeMouseMove);
      canvas.removeEventListener('mouseleave', handleNativeMouseLeave);
      canvas.removeEventListener('dblclick', handleNativeDoubleClick);
      canvas.removeEventListener('dragover', handleNativeDragOver);
      canvas.removeEventListener('drop', handleNativeDrop);
      canvas.removeEventListener('click', handleClick as any);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    draw();
  }, [roomPoints, placedProducts, doors, textAnnotations, offset, zoom, mousePosition, showGrid, showRuler, selectedProduct, selectedText, rotatingProduct, selectedWallIndex]);

  return (
    <canvas
      ref={canvasRef}
      className="bg-white cursor-default"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

export default CanvasWorkspace;
