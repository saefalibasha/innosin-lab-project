import React, { useState, useRef, useEffect } from 'react';
import FloorPlannerCanvas from '@/components/FloorPlannerCanvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ruler, Move, ChevronLeft, ChevronRight, Maximize, Grid, Eye, Download, Send, Settings, Eraser, Trash2, HelpCircle, RotateCcw, Copy, MousePointer, DoorOpen, Undo, Redo, Home, Minus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import ExportModal from '@/components/ExportModal';
import SendPlanModal from '@/components/SendPlanModal';
import { useFloorPlanHistory, FloorPlanState } from '@/hooks/useFloorPlanHistory';
import { Point, PlacedProduct, Door, TextAnnotation, WallSegment, WallType } from '@/types/floorPlanTypes';

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
  const [openPanel, setOpenPanel] = useState<string>('tools');
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Initialize history management
  const initialState: FloorPlanState = {
    roomPoints: [],
    placedProducts: [],
    doors: [],
    textAnnotations: []
  };

  const {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useFloorPlanHistory(initialState);

  // Save state whenever any data changes
  useEffect(() => {
    const currentState: FloorPlanState = {
      roomPoints,
      placedProducts,
      doors,
      textAnnotations
    };
    saveState(currentState);
  }, [roomPoints, placedProducts, doors, textAnnotations, saveState]);

  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      setRoomPoints(previousState.roomPoints);
      setPlacedProducts(previousState.placedProducts);
      setDoors(previousState.doors);
      setTextAnnotations(previousState.textAnnotations);
      toast.success('Action undone');
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
    }
  };

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

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      setIsSidebarCollapsed(true);
    }
  };

  const handleClearAll = () => {
    setRoomPoints([]);
    setWallSegments([]);
    setPlacedProducts([]);
    setDoors([]);
    setTextAnnotations([]);
    toast.success('Floor plan cleared');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle undo/redo shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-gray-50 flex ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Enhanced Top Toolbar */}
        <div className={`fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 ${isFullScreen ? 'top-0' : ''}`}>
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
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showGrid ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className="h-8 px-3"
              >
                <Grid className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={showRuler ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowRuler(!showRuler)}
                className="h-8 px-3"
              >
                <Ruler className="w-4 h-4 mr-1" />
                Ruler
              </Button>
              
              <div className="border-l border-gray-200 pl-2 ml-2 flex items-center space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 px-3"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                
                {/* Export Modal */}
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

                {/* Send Plan Modal */}
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

        {/* Enhanced Collapsible Sidebar */}
        <div className={`transition-all duration-300 bg-white border-r border-gray-200 ${
          isSidebarCollapsed ? 'w-0' : 'w-80'
        } ${isFullScreen ? 'mt-12' : 'mt-24'} overflow-hidden shadow-sm`}>
          <div className="w-80 h-full overflow-y-auto p-4 space-y-4">
            
            {/* Enhanced Tool Instructions */}
            <Collapsible open={openPanel === 'instructions'} onOpenChange={() => setOpenPanel(openPanel === 'instructions' ? '' : 'instructions')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start font-medium">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Complete Tool Guide
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-2">
                {/* Exterior Wall Tool */}
                <div className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Home className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">Exterior Wall Tool</span>
                    <Badge variant="outline" className="text-xs">Primary</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Draw the main room perimeter and boundaries</p>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-700">• <strong>Click:</strong> Place wall points</div>
                    <div className="text-xs text-gray-700">• <strong>Double-click:</strong> Complete room</div>
                    <div className="text-xs text-gray-700">• <strong>ESC:</strong> Finish drawing</div>
                    <div className="text-xs text-gray-700">• <strong>Enter:</strong> Custom length input</div>
                    <div className="text-xs text-gray-700">• Auto-displays length parallel to line</div>
                  </div>
                </div>

                {/* Interior Wall Tool */}
                <div className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Minus className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-sm">Interior Wall Tool</span>
                    <Badge variant="outline" className="text-xs">New</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Add interior walls and room divisions</p>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-700">• <strong>Click:</strong> Start interior wall</div>
                    <div className="text-xs text-gray-700">• <strong>Click again:</strong> End wall segment</div>
                    <div className="text-xs text-gray-700">• <strong>Snap:</strong> Auto-aligns to existing walls</div>
                    <div className="text-xs text-gray-700">• <strong>Independent:</strong> Doesn't need to close</div>
                    <div className="text-xs text-gray-700">• Perfect for office divisions</div>
                  </div>
                </div>

                {/* Select Tool */}
                <div className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Move className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm">Select & Move Tool</span>
                    <Badge variant="outline" className="text-xs">Separated</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Select and move objects with boundary detection</p>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-700">• <strong>Click:</strong> Select objects</div>
                    <div className="text-xs text-gray-700">• <strong>Drag center:</strong> Move with collision detection</div>
                    <div className="text-xs text-gray-700">• <strong>D key:</strong> Duplicate selected</div>
                    <div className="text-xs text-gray-700">• <strong>Delete:</strong> Remove selected</div>
                    <div className="text-xs text-red-600">• Objects cannot be moved outside room walls</div>
                  </div>
                </div>

                {/* Rotate Tool */}
                <div className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <RotateCcw className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm">Rotate Tool</span>
                    <Badge variant="outline" className="text-xs">New</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Rotate objects with 45° angle snapping</p>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-700">• <strong>Click:</strong> Select object to rotate</div>
                    <div className="text-xs text-gray-700">• <strong>Drag handle:</strong> Rotate with angle display</div>
                    <div className="text-xs text-gray-700">• <strong>Auto-snap:</strong> 45° increments</div>
                    <div className="text-xs text-gray-700">• <strong>Visual feedback:</strong> Shows rotation angle</div>
                    <div className="text-xs text-red-600">• Rotation respects room boundaries</div>
                  </div>
                </div>

                {/* Door Tool */}
                <div className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <DoorOpen className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-sm">Door Tool</span>
                    <Badge variant="outline" className="text-xs">Enhanced</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Place doors along walls with swing direction</p>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-700">• <strong>Click near wall:</strong> Place door</div>
                    <div className="text-xs text-gray-700">• <strong>Auto-snap:</strong> Aligns to closest wall</div>
                    <div className="text-xs text-gray-700">• <strong>Standard size:</strong> 900mm width</div>
                    <div className="text-xs text-gray-700">• <strong>Swing indicator:</strong> Shows door movement</div>
                    <div className="text-xs text-gray-700">• <strong>Delete:</strong> Select and press Delete</div>
                  </div>
                </div>

                {/* Eraser Tool */}
                <div className="p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eraser className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-sm">Eraser Tool</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Remove objects, text, and wall points precisely</p>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-700">• <strong>Click:</strong> Erase any item</div>
                    <div className="text-xs text-gray-700">• Works on products, text, and walls</div>
                    <div className="text-xs text-gray-700">• Point-by-point wall deletion</div>
                    <div className="text-xs text-gray-700">• Segment-by-segment removal</div>
                  </div>
                </div>
                
                {/* Export & Send Tools */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Download className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-sm text-green-800">Export & Send</span>
                    <Badge variant="outline" className="text-xs bg-green-100">Enhanced</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-green-700">• <strong>Export:</strong> Save as PNG or PDF</div>
                    <div className="text-xs text-green-700">• <strong>Send:</strong> Email plan to team</div>
                    <div className="text-xs text-green-700">• Includes dimensions and furniture</div>
                    <div className="text-xs text-green-700">• HubSpot integration for leads</div>
                  </div>
                </div>
                
                {/* Basic Controls */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <MousePointer className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm text-blue-800">Universal Controls</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-blue-700">• <strong>Left click:</strong> Draw/Select</div>
                    <div className="text-xs text-blue-700">• <strong>Right click:</strong> Pan canvas</div>
                    <div className="text-xs text-blue-700">• <strong>Mouse wheel:</strong> Zoom in/out</div>
                    <div className="text-xs text-blue-700">• <strong>Drag from library:</strong> Place items</div>
                    <div className="text-xs text-blue-700">• <strong>Grid/Ruler:</strong> Toggle in toolbar</div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Enhanced Drawing Tools with Interior Walls */}
            <Collapsible open={openPanel === 'tools'} onOpenChange={() => setOpenPanel(openPanel === 'tools' ? '' : 'tools')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start font-semibold text-gray-900 hover:bg-gray-50">
                  <Ruler className="w-4 h-4 mr-2" />
                  Drawing Tools
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === 'wall' ? 'default' : 'outline'}
                      className="w-full justify-start h-10"
                      onClick={() => setActiveTool('wall')}
                    >
                      <Home className="w-4 h-4 mr-3" />
                      Exterior Walls
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Draw main room perimeter</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === 'interior-wall' ? 'default' : 'outline'}
                      className="w-full justify-start h-10"
                      onClick={() => setActiveTool('interior-wall')}
                    >
                      <Minus className="w-4 h-4 mr-3" />
                      Interior Walls
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add interior walls and divisions</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === 'select' ? 'default' : 'outline'}
                      className="w-full justify-start h-10"
                      onClick={() => setActiveTool('select')}
                    >
                      <Move className="w-4 h-4 mr-3" />
                      Select & Move
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select and move objects</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === 'rotate' ? 'default' : 'outline'}
                      className="w-full justify-start h-10"
                      onClick={() => setActiveTool('rotate')}
                    >
                      <RotateCcw className="w-4 h-4 mr-3" />
                      Rotate Tool
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rotate objects with 45° snapping</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === 'door' ? 'default' : 'outline'}
                      className="w-full justify-start h-10"
                      onClick={() => setActiveTool('door')}
                    >
                      <DoorOpen className="w-4 h-4 mr-3" />
                      Door Tool
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Place doors along walls</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === 'eraser' ? 'default' : 'outline'}
                      className="w-full justify-start h-10"
                      onClick={() => setActiveTool('eraser')}
                    >
                      <Eraser className="w-4 h-4 mr-3" />
                      Eraser
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove objects, text, and wall points</p>
                  </TooltipContent>
                </Tooltip>
              </CollapsibleContent>
            </Collapsible>

            {/* Enhanced Product Library */}
            <Collapsible open={openPanel === 'library'} onOpenChange={() => setOpenPanel(openPanel === 'library' ? '' : 'library')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start font-semibold text-gray-900 hover:bg-gray-50">
                  <Move className="w-4 h-4 mr-2" />
                  Product Library
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-2 max-h-96 overflow-y-auto">
                {productLibrary.map(product => (
                  <Tooltip key={product.id}>
                    <TooltipTrigger asChild>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, product)}
                        className="p-3 border border-gray-200 rounded-lg transition-all cursor-move hover:bg-gray-50 hover:shadow-sm hover:border-gray-300"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: product.color }}
                          />
                          <span className="font-medium text-sm text-gray-900">{product.name}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height}m
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Drag to canvas to place {product.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className={`flex-1 ${isFullScreen ? 'mt-12' : 'mt-24'} relative bg-gray-50`}>
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
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FloorPlanner;
