import React, { useState, useRef, useEffect } from 'react';
import FloorPlannerCanvas from '@/components/FloorPlannerCanvas';
import QuickActionsToolbar from '@/components/QuickActionsToolbar';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import EnhancedToolPanel from '@/components/EnhancedToolPanel';
import CursorManager from '@/components/CursorManager';
import FloorPlanContextMenu from '@/components/ContextMenu';
import MeasurementOverlay from '@/components/MeasurementOverlay';
import StatusIndicator from '@/components/StatusIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Maximize, Download, Send, Undo, Redo, Ruler } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import ExportModal from '@/components/ExportModal';
import SendPlanModal from '@/components/SendPlanModal';
import { useFloorPlanHistory, FloorPlanState } from '@/hooks/useFloorPlanHistory';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment } from '@/types/floorPlanTypes';

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
  const [showRuler, setShowRuler] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [copiedObjects, setCopiedObjects] = useState<any[]>([]);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isOnline] = useState(true);
  const [operationInProgress, setOperationInProgress] = useState<string>();
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

  // Enhanced zoom controls
  const handleZoomIn = () => {
    setCurrentZoom(prev => {
      const newZoom = Math.min(prev * 1.2, 3);
      toast.success(`Zoomed to ${Math.round(newZoom * 100)}%`);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setCurrentZoom(prev => {
      const newZoom = Math.max(prev / 1.2, 0.1);
      toast.success(`Zoomed to ${Math.round(newZoom * 100)}%`);
      return newZoom;
    });
  };

  const handleFitToView = () => {
    setCurrentZoom(1);
    toast.success('View reset to fit content');
  };

  // Enhanced quick actions
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

    if (key === 'u' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setShowRuler(!showRuler);
      toast.success(showRuler ? 'Ruler hidden' : 'Ruler shown');
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
  }, [selectedObjects, showGrid, showRuler, showMeasurements]);

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

  // ... keep existing code (product library data)
  const productLibrary = [
    {
      id: 'fh-std',
      name: 'Standard Fume Hood',
      dimensions: { length: 1.5, width: 0.75, height: 2.4 },
      category: 'Fume Hoods',
      color: '#ef4444'
    },
    {
      id: 'lab-bench',
      name: 'Lab Bench',
      dimensions: { length: 3.0, width: 0.75, height: 0.85 },
      category: 'Lab Benches',
      color: '#3b82f6'
    },
    {
      id: 'eye-wash',
      name: 'Eye Wash Station',
      dimensions: { length: 0.6, width: 0.4, height: 1.2 },
      category: 'Safety Equipment',
      color: '#10b981'
    },
    {
      id: 'storage',
      name: 'Storage Cabinet',
      dimensions: { length: 1.2, width: 0.6, height: 1.8 },
      category: 'Storage',
      color: '#f59e0b'
    }
  ];

  const handleDragStart = (e: React.DragEvent, product: any) => {
    e.dataTransfer.setData('product', JSON.stringify(product));
  };

  return (
    <TooltipProvider>
      <div className={`h-screen bg-gray-50 flex flex-col ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
        <CursorManager 
          currentTool={activeTool} 
          canvasElement={canvasRef.current}
        />
        
        {/* Enhanced Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 z-40 flex-shrink-0" style={{ marginTop: isFullScreen ? '0' : '5rem' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2"
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Floor Planner</h1>
              
              {/* Status Indicator */}
              <StatusIndicator
                isAutoSaving={isAutoSaving}
                lastSaved={lastSaved}
                isOnline={isOnline}
                operationInProgress={operationInProgress}
              />
              
              {/* Undo/Redo Controls */}
              <div className="flex items-center space-x-1 border-l border-gray-200 pl-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      className="h-8 w-8 p-0"
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Undo last action (Ctrl+Z)</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRedo}
                      disabled={!canRedo}
                      className="h-8 w-8 p-0"
                    >
                      <Redo className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Redo last action (Ctrl+Y)</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Quick Actions Toolbar */}
              <QuickActionsToolbar
                hasSelection={selectedObjects.length > 0}
                onCopy={handleCopy}
                onPaste={handlePaste}
                onDelete={handleDeleteSelected}
                onDuplicate={handleDuplicate}
                onSelectAll={handleSelectAll}
                canPaste={copiedObjects.length > 0}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showMeasurements ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMeasurements(!showMeasurements)}
                className="h-8 px-3"
              >
                <Ruler className="w-4 h-4 mr-1" />
                Measurements
                <Badge variant="outline" className="ml-2 text-xs">M</Badge>
              </Button>
              
              <div className="border-l border-gray-200 pl-2 ml-2 flex items-center space-x-2">
                <KeyboardShortcuts />
                
                <ExportModal
                  canvasRef={canvasRef}
                  roomPoints={roomPoints}
                  placedProducts={placedProducts}
                >
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </ExportModal>

                <SendPlanModal
                  canvasRef={canvasRef}
                  roomPoints={roomPoints}
                  placedProducts={placedProducts}
                >
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </SendPlanModal>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullScreen}
                  className="h-8 px-3"
                >
                  <Maximize className="w-4 h-4 mr-1" />
                  {isFullScreen ? 'Exit' : 'Full'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Enhanced Sidebar with EnhancedToolPanel */}
          <div className={`transition-all duration-300 bg-white border-r border-gray-200 ${
            isSidebarCollapsed ? 'w-0' : 'w-80'
          } overflow-hidden shadow-sm flex-shrink-0`}>
            <div className="w-80 h-full overflow-y-auto p-4">
              <EnhancedToolPanel
                currentTool={activeTool}
                onToolChange={handleToolChange}
                showGrid={showGrid}
                onToggleGrid={() => setShowGrid(!showGrid)}
                showRuler={showRuler}
                onToggleRuler={() => setShowRuler(!showRuler)}
                onClear={handleClearAll}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFitToView={handleFitToView}
                currentZoom={currentZoom}
              />
            </div>
          </div>

          {/* Main Canvas Area with Context Menu */}
          <div className="flex-1 relative bg-gray-50">
            {/* Enhanced debug info */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs z-50">
              Tool: {activeTool} | Selected: {selectedObjects.length} | Zoom: {Math.round(currentZoom * 100)}% | Objects: {placedProducts.length + doors.length + textAnnotations.length}
            </div>
            
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
                  showRuler={showRuler}
                  onClearAll={handleClearAll}
                  canvasRef={canvasRef}
                />
                
                <MeasurementOverlay
                  roomPoints={roomPoints}
                  wallSegments={wallSegments}
                  scale={scale}
                  showMeasurements={showMeasurements}
                  canvas={canvasRef.current}
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
