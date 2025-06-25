
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Home, 
  Minus, 
  Move, 
  DoorOpen, 
  Eraser, 
  RotateCcw, 
  Grid, 
  Ruler, 
  ZoomIn,
  ZoomOut,
  Maximize2,
  MousePointer,
  Trash2
} from 'lucide-react';

interface EnhancedToolPanelProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showRuler: boolean;
  onToggleRuler: () => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  currentZoom: number;
}

const EnhancedToolPanel: React.FC<EnhancedToolPanelProps> = ({
  currentTool,
  onToolChange,
  showGrid,
  onToggleGrid,
  showRuler,
  onToggleRuler,
  onClear,
  onZoomIn,
  onZoomOut,
  onFitToView,
  currentZoom
}) => {
  const drawingTools = [
    { 
      id: 'wall', 
      name: 'Exterior Walls', 
      icon: Home, 
      shortcut: 'W',
      description: 'Draw main room perimeter and boundaries',
      category: 'primary'
    },
    { 
      id: 'interior-wall', 
      name: 'Interior Walls', 
      icon: Minus, 
      shortcut: 'I',
      description: 'Add interior walls and room divisions',
      category: 'primary'
    },
    { 
      id: 'door', 
      name: 'Door Tool', 
      icon: DoorOpen, 
      shortcut: 'D',
      description: 'Place doors along walls',
      category: 'primary'
    }
  ];

  const manipulationTools = [
    { 
      id: 'select', 
      name: 'Select & Move', 
      icon: Move, 
      shortcut: 'S',
      description: 'Select and move objects',
      category: 'manipulation'
    },
    { 
      id: 'rotate', 
      name: 'Rotate', 
      icon: RotateCcw, 
      shortcut: 'R',
      description: 'Rotate objects with angle snapping',
      category: 'manipulation'
    },
    { 
      id: 'eraser', 
      name: 'Eraser', 
      icon: Eraser, 
      shortcut: 'E',
      description: 'Remove objects and wall points',
      category: 'manipulation'
    }
  ];

  const viewControls = [
    {
      id: 'grid',
      name: showGrid ? 'Hide Grid' : 'Show Grid',
      icon: Grid,
      shortcut: 'G',
      active: showGrid,
      action: onToggleGrid
    },
    {
      id: 'ruler',
      name: showRuler ? 'Hide Ruler' : 'Show Ruler',
      icon: Ruler,
      shortcut: 'U',
      active: showRuler,
      action: onToggleRuler
    }
  ];

  const renderToolButton = (tool: any, isActive: boolean) => (
    <Tooltip key={tool.id}>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'default' : 'outline'}
          className="w-full justify-start h-12 px-3"
          onClick={() => onToolChange(tool.id)}
        >
          <tool.icon className="w-5 h-5 mr-3" />
          <div className="flex-1 text-left">
            <div className="font-medium">{tool.name}</div>
            <div className="text-xs text-gray-500">{tool.description}</div>
          </div>
          <Badge variant="outline" className="ml-2 text-xs">
            {tool.shortcut}
          </Badge>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{tool.description} ({tool.shortcut})</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="space-y-4">
      {/* Drawing Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <MousePointer className="w-4 h-4 mr-2" />
            Drawing Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {drawingTools.map(tool => 
            renderToolButton(tool, currentTool === tool.id)
          )}
        </CardContent>
      </Card>

      {/* Manipulation Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Move className="w-4 h-4 mr-2" />
            Object Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {manipulationTools.map(tool => 
            renderToolButton(tool, currentTool === tool.id)
          )}
        </CardContent>
      </Card>

      {/* View Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Grid className="w-4 h-4 mr-2" />
            View Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {viewControls.map(control => (
            <Tooltip key={control.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={control.active ? 'default' : 'outline'}
                  className="w-full justify-start h-10"
                  onClick={control.action}
                >
                  <control.icon className="w-4 h-4 mr-3" />
                  {control.name}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {control.shortcut}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{control.name} ({control.shortcut})</p>
              </TooltipContent>
            </Tooltip>
          ))}

          <Separator className="my-3" />

          {/* Zoom Controls */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Zoom Controls</div>
            
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onZoomOut}
                    className="flex-1"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out (Ctrl + -)</p>
                </TooltipContent>
              </Tooltip>

              <div className="text-xs text-center text-gray-600 px-2 py-1 bg-gray-100 rounded min-w-[50px]">
                {Math.round(currentZoom * 100)}%
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onZoomIn}
                    className="flex-1"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In (Ctrl + +)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFitToView}
                  className="w-full"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Fit to View
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fit to View (F)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Trash2 className="w-4 h-4 mr-2" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={onClear}
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Clear All
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Clear entire floor plan</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedToolPanel;
