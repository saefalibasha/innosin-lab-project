
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2
} from 'lucide-react';

interface CompactToolPanelProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  currentZoom: number;
}

const CompactToolPanel: React.FC<CompactToolPanelProps> = ({
  currentTool,
  onToolChange,
  showGrid,
  onToggleGrid,
  onClear,
  onZoomIn,
  onZoomOut,
  onFitToView,
  currentZoom
}) => {
  const tools = [
    { 
      id: 'wall', 
      name: 'Wall', 
      icon: Home, 
      shortcut: 'W',
      description: 'Draw exterior walls'
    },
    { 
      id: 'interior-wall', 
      name: 'Interior', 
      icon: Minus, 
      shortcut: 'I',
      description: 'Add interior walls'
    },
    { 
      id: 'door', 
      name: 'Door', 
      icon: DoorOpen, 
      shortcut: 'D',
      description: 'Place doors'
    },
    { 
      id: 'select', 
      name: 'Select', 
      icon: Move, 
      shortcut: 'S',
      description: 'Select and move'
    },
    { 
      id: 'rotate', 
      name: 'Rotate', 
      icon: RotateCcw, 
      shortcut: 'R',
      description: 'Rotate objects'
    },
    { 
      id: 'eraser', 
      name: 'Erase', 
      icon: Eraser, 
      shortcut: 'E',
      description: 'Remove objects'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Drawing Tools */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {tools.map(tool => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === tool.id ? 'default' : 'ghost'}
                  className="w-full justify-start h-8 px-2 text-sm"
                  onClick={() => onToolChange(tool.id)}
                >
                  <tool.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{tool.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs h-4 px-1">
                    {tool.shortcut}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.description} ({tool.shortcut})</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </CardContent>
      </Card>

      {/* View Controls */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? 'default' : 'ghost'}
                className="w-full justify-start h-8 text-sm"
                onClick={onToggleGrid}
              >
                <Grid className="w-4 h-4 mr-2" />
                Grid
                <Badge variant="outline" className="ml-auto text-xs h-4 px-1">G</Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Toggle Grid (G)</p>
            </TooltipContent>
          </Tooltip>

          <Separator />

          <div className="flex items-center justify-between space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onZoomOut}
                  className="h-7 w-7 p-0"
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>

            <div className="text-xs text-center text-gray-600 px-1 bg-gray-50 rounded text-nowrap">
              {Math.round(currentZoom * 100)}%
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onZoomIn}
                  className="h-7 w-7 p-0"
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onFitToView}
                className="w-full h-7 text-xs"
              >
                <Maximize2 className="w-3 h-3 mr-1" />
                Fit View
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fit to View (F)</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="shadow-sm">
        <CardContent className="pt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                className="w-full h-8 text-sm"
                onClick={onClear}
              >
                <Trash2 className="w-4 h-4 mr-2" />
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

export default CompactToolPanel;
