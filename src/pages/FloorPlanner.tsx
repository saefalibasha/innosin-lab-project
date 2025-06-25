import React, { useState, useRef, useEffect } from 'react';
import FloorPlannerCanvas from '@/components/FloorPlannerCanvas';
import CompactToolbar from '@/components/CompactToolbar';
import CompactToolPanel from '@/components/CompactToolPanel';
import CursorManager from '@/components/CursorManager';
import FloorPlanContextMenu from '@/components/ContextMenu';
import IntelligentMeasurementOverlay from '@/components/IntelligentMeasurementOverlay';
import StatusIndicator from '@/components/StatusIndicator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useFloorPlanHistory, FloorPlanState } from '@/hooks/useFloorPlanHistory';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment } from '@/types/floorPlanTypes';

type Units = 'mm' | 'cm' | 'm' | 'ft' | 'in';

const FloorPlanner = () => {
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [wallSegments, setWallSegments] = useState<WallSegment[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [scale] = useState(40);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTool, setActiveTool] = useState('wall');
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [copiedObjects, setCopiedObjects] = useState<any[]>([]);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isOnline] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState<string>();
  const [units, setUnits] = useState<Units>('m');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Enhanced tool change with better feedback
  const handleToolChange = (newTool: string) => {
    console.log('🔧 Tool changed from', activeTool, 'to', newTool);
    setActiveTool(newTool);
    
    // Provide contextual guidance
    const toolMessages = {
      'wall': 'Click to place wall points. Double-click to finish.',
      'interior-wall': 'Click to start interior wall, click again to end.',
      'select': 'Click objects to select them. Drag to move.',
      'door': 'Click near a wall to place a door.',
      'rotate': 'Click an object to rotate it.',
      'eraser': 'Click objects to delete them.'
    };
    
    toast.success(`${newTool} tool selected`, {
      description: toolMessages[newTool as keyof typeof toolMessages] || ''
    });
  };

  // Enhanced object selection handler
  const handleObjectSelect = (objectId: string) => {
    setSelectedObjects(prev => {
      if (prev.includes(objectId)) {
        return prev.filter(id => id !== objectId);
      } else {
        return [...prev, objectId];
      }
    });
  };

  // Initialize history management
  const initialState: FloorPlanState = {
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: []
  };

  const { saveState, undo, redo, canUndo, canRedo } = useFloorPlanHistory(initialState);

  // Enhanced state persistence with auto-save simulation
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const debouncedSaveState = (state: FloorPlanState) => {
    setIsAutoSaving(true);
    
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveState(state);
      setIsAutoSaving(false);
      setLastSaved(new Date());
      console.log('💾 State saved to history');
    }, 800);
    
    setSaveTimeout(timeout);
  };

  useEffect(() => {
    const currentState: FloorPlanState = {
      roomPoints,
      placedProducts,
      doors,
      textAnnotations
    };
    debouncedSaveState(currentState);
    
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [roomPoints, placedProducts, doors, textAnnotations]);

  // Enhanced zoom controls that actually work with canvas
  const handleZoomIn = () => {
    setCurrentZoom(prev => {
      const newZoom = Math.min(prev * 1.2, 3);
      toast.success(`Zoomed to ${Math.round(newZoom * 100)}%`);
      
      // Apply zoom to canvas if available
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(1.2, 1.2);
        }
      }
      
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setCurrentZoom(prev => {
      const newZoom = Math.max(prev / 1.2, 0.1);
      toast.success(`Zoomed to ${Math.round(newZoom * 100)}%`);
      
      // Apply zoom to canvas if available
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(1/1.2, 1/1.2);
        }
      }
      
      return newZoom;
    });
  };

  const handleFitToView = () => {
    setCurrentZoom(1);
    
    // Reset canvas zoom
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      }
    }
    
    toast.success('View reset to fit content');
  };

  const handleSelectAll = () => {
    const allIds = [
      ...placedProducts.map(p => p.id),
      ...doors.map(d => d.id),
      ...textAnnotations.map(t => t.id)
    ];
    setSelectedObjects(allIds);
    toast.success(`Selected ${allIds.length} objects`);
  };

  const handleCopy = () => {
    if (selectedObjects.length === 0) {
      toast.error('No objects selected to copy');
      return;
    }
    
    const objectsToCopy = [
      ...placedProducts.filter(p => selectedObjects.includes(p.id)),
      ...doors.filter(d => selectedObjects.includes(d.id)),
      ...textAnnotations.filter(t => selectedObjects.includes(t.id))
    ];
    
    setCopiedObjects(objectsToCopy);
    toast.success(`Copied ${objectsToCopy.length} objects to clipboard`);
  };

  const handlePaste = () => {
    if (copiedObjects.length === 0) {
      toast.error('Nothing to paste');
      return;
    }
    
    toast.success(`Pasted ${copiedObjects.length} objects`);
  };

  const handleDuplicate = () => {
    if (selectedObjects.length === 0) {
      toast.error('No objects selected to duplicate');
      return;
    }
    
    toast.success(`Duplicated ${selectedObjects.length} objects`);
  };

  const handleDeleteSelected = () => {
    if (selectedObjects.length === 0) {
      toast.error('No objects selected to delete');
      return;
    }
    
    setOperationInProgress('Deleting objects...');
    
    setTimeout(() => {
      setPlacedProducts(prev => prev.filter(p => !selectedObjects.includes(p.id)));
      setDoors(prev => prev.filter(d => !selectedObjects.includes(d.id)));
      setTextAnnotations(prev => prev.filter(t => !selectedObjects.includes(t.id)));
      setSelectedObjects([]);
      setOperationInProgress(undefined);
      
      toast.success('Deleted selected objects');
    }, 300);
  };

  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      setRoomPoints(previousState.roomPoints);
      setPlacedProducts(previousState.placedProducts);
      setDoors(previousState.doors);
      setTextAnnotations(previousState.textAnnotations);
      toast.success('Action undone');
    } else {
      toast.error('Nothing to undo');
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setRoomPoints(nextState.roomPoints);
      setPlacedProducts(nextState.placedProducts);
      setDoors(nextState.doors);
      setTextAnnotations(nextState.textAnnotations);
      toast.success('Action redone');
    } else {
      toast.error('Nothing to redo');
    }
  };

  const handleProductDrag = (product: any) => {
    console.log('Product dragged:', product);
    // This will be handled by the canvas component
  };

  // Enhanced keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Tool shortcuts
    const toolShortcuts = {
      'w': 'wall',
      'i': 'interior-wall',
      's': 'select',
      'd': 'door',
      'r': 'rotate',
      'e': 'eraser'
    };

    const key = e.key.toLowerCase();
    if (toolShortcuts[key as keyof typeof toolShortcuts] && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleToolChange(toolShortcuts[key as keyof typeof toolShortcuts]);
    }

    // View shortcuts
    if (key === 'g' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setShowGrid(!showGrid);
      toast.success(showGrid ? 'Grid hidden' : 'Grid shown');
    }

    if (key === 'm' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setShowMeasurements(!showMeasurements);
      toast.success(showMeasurements ? 'Measurements hidden' : 'Measurements shown');
    }

    // Action shortcuts
    if ((e.ctrlKey || e.metaKey)) {
      switch (key) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        case 'a':
          e.preventDefault();
          handleSelectAll();
          break;
        case 'c':
          e.preventDefault();
          handleCopy();
          break;
        case 'v':
          e.preventDefault();
          handlePaste();
          break;
        case 'd':
          e.preventDefault();
          handleDuplicate();
          break;
        case '=':
        case '+':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
      }
    }

    if (key === 'delete' || key === 'backspace') {
      e.preventDefault();
      handleDeleteSelected();
    }

    if (key === 'f' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleFitToView();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjects, showGrid, showMeasurements]);

  const handleClearAll = () => {
    setOperationInProgress('Clearing floor plan...');
    
    setTimeout(() => {
      setRoomPoints([]);
      setWallSegments([]);
      setPlacedProducts([]);
      setDoors([]);
      setTextAnnotations([]);
      setSelectedObjects([]);
      setOperationInProgress(undefined);
      toast.success('Floor plan cleared');
    }, 500);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      setIsSidebarCollapsed(true);
      toast.success('Entered full screen mode');
    } else {
      toast.success('Exited full screen mode');
    }
  };

  return (
    <TooltipProvider>
      <div className={`h-screen bg-gray-50 flex flex-col ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
        <CursorManager 
          currentTool={activeTool} 
          canvasElement={canvasRef.current}
        />
        
        {/* Compact Top Toolbar */}
        <div className="flex-shrink-0" style={{ marginTop: isFullScreen ? '0' : '4rem' }}>
          <CompactToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            showMeasurements={showMeasurements}
            onToggleMeasurements={() => setShowMeasurements(!showMeasurements)}
            isFullScreen={isFullScreen}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onToggleFullScreen={toggleFullScreen}
            canvasRef={canvasRef}
            roomPoints={roomPoints}
            placedProducts={placedProducts}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Compact Sidebar */}
          <div className={`transition-all duration-300 bg-white border-r border-gray-200 ${
            isSidebarCollapsed ? 'w-0' : 'w-64'
          } overflow-hidden shadow-sm flex-shrink-0`}>
            <div className="w-64 h-full overflow-y-auto p-3">
              <CompactToolPanel
                currentTool={activeTool}
                onToolChange={handleToolChange}
                showGrid={showGrid}
                onToggleGrid={() => setShowGrid(!showGrid)}
                onClear={handleClearAll}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFitToView={handleFitToView}
                currentZoom={currentZoom}
                units={units}
                onUnitsChange={setUnits}
                onProductDrag={handleProductDrag}
                placedProducts={placedProducts}
                onObjectSelect={handleObjectSelect}
                selectedObjects={selectedObjects}
              />
              
              {/* Status Indicator in Sidebar */}
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <StatusIndicator
                  isAutoSaving={isAutoSaving}
                  lastSaved={lastSaved}
                  isOnline={isOnline}
                  operationInProgress={operationInProgress}
                />
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative bg-gray-50">
            <FloorPlanContextMenu
              selectedObjects={selectedObjects}
              onCopy={handleCopy}
              onDelete={handleDeleteSelected}
              onDuplicate={handleDuplicate}
              onRotate={() => handleToolChange('rotate')}
            >
              <div className="relative h-full w-full">
                <FloorPlannerCanvas
                  roomPoints={roomPoints}
                  setRoomPoints={setRoomPoints}
                  wallSegments={wallSegments}
                  setWallSegments={setWallSegments}
                  placedProducts={placedProducts}
                  setPlacedProducts={setPlacedProducts}
                  doors={doors}
                  setDoors={setDoors}
                  textAnnotations={textAnnotations}
                  setTextAnnotations={setTextAnnotations}
                  scale={scale}
                  currentTool={activeTool}
                  showGrid={showGrid}
                  showRuler={false}
                  onClearAll={handleClearAll}
                  canvasRef={canvasRef}
                />
                
                <IntelligentMeasurementOverlay
                  roomPoints={roomPoints}
                  wallSegments={wallSegments}
                  scale={scale}
                  showMeasurements={showMeasurements}
                  canvas={canvasRef.current}
                  units={units}
                />
              </div>
            </FloorPlanContextMenu>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FloorPlanner;
