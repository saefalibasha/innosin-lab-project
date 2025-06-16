
import React, { useState } from 'react';
import FloorPlannerCanvas from '@/components/FloorPlannerCanvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ruler, Move, ChevronLeft, ChevronRight, Maximize, Grid, Eye, Download, Send, Settings, Eraser, Trash2, HelpCircle, RotateCcw, Copy } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Point {
  x: number;
  y: number;
}

interface PlacedProduct {
  id: string;
  productId: string;
  name: string;
  position: Point;
  rotation: number;
  dimensions: { length: number; width: number; height: number };
  color: string;
}

const FloorPlanner = () => {
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [placedProducts, setPlacedProducts] = useState<PlacedProduct[]>([]);
  const [scale] = useState(40);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTool, setActiveTool] = useState('wall');
  const [openPanel, setOpenPanel] = useState<string>('tools');

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

  const toolInstructions = [
    {
      tool: 'wall',
      icon: Ruler,
      title: 'Wall Tool',
      description: 'Click to place wall points. Double-click or press ESC to finish.',
      shortcuts: ['ESC: Finish drawing', 'Double-click: Complete room', 'Enter: Input custom length']
    },
    {
      tool: 'eraser',
      icon: Eraser,
      title: 'Eraser Tool',
      description: 'Click on objects or wall points to remove them.',
      shortcuts: ['Click: Erase item']
    },
    {
      tool: 'select',
      icon: Move,
      title: 'Select Tool',
      description: 'Select and manipulate placed objects.',
      shortcuts: ['R: Rotate', 'D: Duplicate', 'Del: Delete']
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // ESC handling is now in CanvasWorkspace
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-white flex ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Top Toolbar */}
        <div className={`fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-2 ${isFullScreen ? 'top-0' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
              <h1 className="text-xl font-bold text-black">Floor Planner</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Grid className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Ruler
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullScreen}
              >
                <Maximize className="w-4 h-4 mr-1" />
                {isFullScreen ? 'Exit' : 'Full Screen'}
              </Button>
            </div>
          </div>
        </div>

        {/* Collapsible Sidebar */}
        <div className={`transition-all duration-300 bg-gray-50 border-r border-gray-200 ${
          isSidebarCollapsed ? 'w-0' : 'w-80'
        } ${isFullScreen ? 'mt-12' : 'mt-24'} overflow-hidden`}>
          <div className="w-80 h-full overflow-y-auto p-4 space-y-4">
            {/* Tool Instructions */}
            <Collapsible open={openPanel === 'instructions'} onOpenChange={() => setOpenPanel(openPanel === 'instructions' ? '' : 'instructions')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start font-medium">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Tool Instructions
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-2">
                {toolInstructions.map(instruction => {
                  const IconComponent = instruction.icon;
                  return (
                    <div key={instruction.tool} className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <IconComponent className="w-4 h-4" />
                        <span className="font-medium text-sm">{instruction.title}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{instruction.description}</p>
                      <div className="space-y-1">
                        {instruction.shortcuts.map((shortcut, index) => (
                          <div key={index} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            {shortcut}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* General Instructions */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-sm text-blue-800 mb-2">General Controls</div>
                  <div className="space-y-1">
                    <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">Mouse wheel: Zoom in/out</div>
                    <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">Middle mouse: Pan canvas</div>
                    <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">Drag items from library to place</div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Drawing Tools */}
            <Collapsible open={openPanel === 'tools'} onOpenChange={() => setOpenPanel(openPanel === 'tools' ? '' : 'tools')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start font-medium">
                  <Ruler className="w-4 h-4 mr-2" />
                  Drawing Tools
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === 'wall' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setActiveTool('wall')}
                    >
                      <Ruler className="w-4 h-4 mr-2" />
                      Wall Tool
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Draw walls and room outlines</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === 'eraser' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setActiveTool('eraser')}
                    >
                      <Eraser className="w-4 h-4 mr-2" />
                      Eraser
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove objects and wall points</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === 'select' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setActiveTool('select')}
                    >
                      <Move className="w-4 h-4 mr-2" />
                      Select
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select and manipulate objects</p>
                  </TooltipContent>
                </Tooltip>
              </CollapsibleContent>
            </Collapsible>

            {/* Product Library */}
            <Collapsible open={openPanel === 'library'} onOpenChange={() => setOpenPanel(openPanel === 'library' ? '' : 'library')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start font-medium">
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
                        className="p-3 border rounded-lg transition-colors cursor-move hover:bg-white hover:shadow-sm"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: product.color }}
                          />
                          <span className="font-medium text-sm">{product.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height}m
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
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
        <div className={`flex-1 ${isFullScreen ? 'mt-12' : 'mt-24'} relative`}>
          <FloorPlannerCanvas
            roomPoints={roomPoints}
            setRoomPoints={setRoomPoints}
            placedProducts={placedProducts}
            setPlacedProducts={setPlacedProducts}
            scale={scale}
            currentTool={activeTool}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FloorPlanner;
