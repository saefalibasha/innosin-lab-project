
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler, Move, Square, Eraser, Grid, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';

type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select';

interface ToolPanelProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showRuler: boolean;
  onToggleRuler: () => void;
  onClear: () => void;
  isDrawingActive: boolean;
  onFinishShape: () => void;
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  currentTool,
  onToolChange,
  showGrid,
  onToggleGrid,
  showRuler,
  onToggleRuler,
  onClear,
  isDrawingActive,
  onFinishShape
}) => {
  const tools = [
    { id: 'wall' as DrawingTool, name: 'Wall Tool', icon: Ruler, description: 'Draw walls and room outlines' },
    { id: 'line' as DrawingTool, name: 'Line Tool', icon: Ruler, description: 'Draw straight lines' },
    { id: 'freehand' as DrawingTool, name: 'Freehand', icon: Ruler, description: 'Draw freehand lines' },
    { id: 'select' as DrawingTool, name: 'Select', icon: Move, description: 'Select and move objects' },
    { id: 'pan' as DrawingTool, name: 'Pan', icon: Move, description: 'Pan around the canvas' },
    { id: 'eraser' as DrawingTool, name: 'Eraser', icon: Eraser, description: 'Delete objects and points' }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Drawing Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tools.map(tool => {
              const IconComponent = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={currentTool === tool.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => onToolChange(tool.id)}
                  title={tool.description}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tool.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">View Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant={showGrid ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={onToggleGrid}
            >
              <Grid className="w-4 h-4 mr-2" />
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
            <Button
              variant={showRuler ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={onToggleRuler}
            >
              <Ruler className="w-4 h-4 mr-2" />
              {showRuler ? 'Hide Ruler' : 'Show Ruler'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isDrawingActive && (
              <Button
                className="w-full justify-start bg-green-600 hover:bg-green-700"
                onClick={onFinishShape}
              >
                <Square className="w-4 h-4 mr-2" />
                Finish Shape
              </Button>
            )}
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={onClear}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolPanel;
