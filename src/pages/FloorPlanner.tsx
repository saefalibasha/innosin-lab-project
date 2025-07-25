
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Download, Upload, Undo, Redo } from 'lucide-react';
import CanvasDrawingEngine from '@/components/canvas/CanvasDrawingEngine';
import DrawingToolbar from '@/components/floorplan/DrawingToolbar';
import ObjectLibrary from '@/components/ObjectLibrary';

export type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select' | 'interior-wall' | 'door' | 'rotate';

interface FloorPlannerState {
  walls: any[];
  rooms: any[];
  products: any[];
  measurements: any[];
  history: any[];
  historyIndex: number;
}

const FloorPlanner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('select');
  const [floorPlanState, setFloorPlanState] = useState<FloorPlannerState>({
    walls: [],
    rooms: [],
    products: [],
    measurements: [],
    history: [],
    historyIndex: -1
  });

  const handleProductDrag = (product: any) => {
    console.log('Product dragged:', product);
  };

  const handleSave = () => {
    console.log('Saving floor plan...');
  };

  const handleLoad = () => {
    console.log('Loading floor plan...');
  };

  const handleExport = () => {
    console.log('Exporting floor plan...');
  };

  const handleUndo = () => {
    console.log('Undo');
  };

  const handleRedo = () => {
    console.log('Redo');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Floor Planner</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={handleUndo} variant="outline" size="sm">
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button onClick={handleRedo} variant="outline" size="sm">
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </Button>
          <Button onClick={handleSave} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleLoad} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Load
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r bg-muted/10 p-4 overflow-y-auto">
          <div className="space-y-4">
            <DrawingToolbar
              currentTool={currentTool}
              onToolChange={setCurrentTool}
            />
            <ObjectLibrary
              onProductDrag={handleProductDrag}
              currentTool={currentTool}
            />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-white">
          <CanvasDrawingEngine
            ref={canvasRef}
            currentTool={currentTool}
            onStateChange={setFloorPlanState}
            floorPlanState={floorPlanState}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-64 border-l bg-muted/10 p-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Properties</h3>
              <div className="space-y-2 text-sm">
                <div>Tool: {currentTool}</div>
                <div>Walls: {floorPlanState.walls.length}</div>
                <div>Products: {floorPlanState.products.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanner;
