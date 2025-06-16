
import React, { useState } from 'react';
import FloorPlannerCanvas from '@/components/FloorPlannerCanvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ruler, Move, ChevronLeft, ChevronRight, Maximize, Grid, Eye, Download, Send, Settings } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [isDrawingMode, setIsDrawingMode] = useState(true);
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
      setIsDrawingMode(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
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
          {/* Mode Selection */}
          <Collapsible open={openPanel === 'mode'} onOpenChange={() => setOpenPanel(openPanel === 'mode' ? '' : 'mode')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start font-medium">
                <Settings className="w-4 h-4 mr-2" />
                Drawing Mode
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <Button
                variant={isDrawingMode ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setIsDrawingMode(true)}
              >
                <Ruler className="w-4 h-4 mr-2" />
                Draw Room
              </Button>
              <Button
                variant={!isDrawingMode ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setIsDrawingMode(false)}
              >
                <Move className="w-4 h-4 mr-2" />
                Place Products
              </Button>
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
              <Button
                variant={activeTool === 'wall' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveTool('wall')}
              >
                Wall Tool
              </Button>
              <Button
                variant={activeTool === 'line' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveTool('line')}
              >
                Line Tool
              </Button>
              <Button
                variant={activeTool === 'eraser' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveTool('eraser')}
              >
                Eraser
              </Button>
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
                <div
                  key={product.id}
                  draggable={!isDrawingMode}
                  onDragStart={(e) => handleDragStart(e, product)}
                  className={`p-3 border rounded-lg transition-colors ${
                    isDrawingMode ? 'opacity-50 cursor-not-allowed' : 'cursor-move hover:bg-white hover:shadow-sm'
                  }`}
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
          isDrawingMode={isDrawingMode}
          scale={scale}
        />
      </div>
    </div>
  );
};

export default FloorPlanner;
