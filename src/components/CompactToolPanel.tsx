
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Ruler, 
  MousePointer, 
  Eraser, 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  Fit, 
  Trash2, 
  RotateCcw,
  Home,
  Minus,
  SquareDashedMousePointer
} from 'lucide-react';
import EnhancedProductLibrary from '@/components/floorplan/EnhancedProductLibrary';
import { PlacedProduct } from '@/types/floorPlanTypes';

type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select' | 'interior-wall' | 'door' | 'rotate';
type Units = 'mm' | 'cm' | 'm' | 'ft' | 'in';

interface CompactToolPanelProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  currentZoom: number;
  units: Units;
  onUnitsChange: (units: Units) => void;
  onProductDrag: (product: any) => void;
  placedProducts: PlacedProduct[];
  onObjectSelect: (objectId: string) => void;
  selectedObjects: string[];
  onUpdateProduct: (product: PlacedProduct) => void;
  onDeleteProduct: () => void;
  onDuplicateProduct: () => void;
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
  currentZoom,
  units,
  onUnitsChange,
  onProductDrag,
  placedProducts,
  onObjectSelect,
  selectedObjects,
  onUpdateProduct,
  onDeleteProduct,
  onDuplicateProduct
}) => {
  const tools = [
    { 
      id: 'wall' as DrawingTool, 
      name: 'Wall', 
      icon: Home, 
      description: 'Draw exterior walls',
      shortcut: 'W'
    },
    { 
      id: 'interior-wall' as DrawingTool, 
      name: 'Interior', 
      icon: Minus, 
      description: 'Draw interior walls',
      shortcut: 'I'
    },
    { 
      id: 'door' as DrawingTool, 
      name: 'Door', 
      icon: SquareDashedMousePointer, 
      description: 'Place doors',
      shortcut: 'D'
    },
    { 
      id: 'select' as DrawingTool, 
      name: 'Select', 
      icon: MousePointer, 
      description: 'Select and move objects',
      shortcut: 'S'
    },
    { 
      id: 'rotate' as DrawingTool, 
      name: 'Rotate', 
      icon: RotateCcw, 
      description: 'Rotate objects',
      shortcut: 'R'
    },
    { 
      id: 'eraser' as DrawingTool, 
      name: 'Eraser', 
      icon: Eraser, 
      description: 'Delete objects',
      shortcut: 'E'
    }
  ];

  const unitsOptions: Units[] = ['mm', 'cm', 'm', 'ft', 'in'];

  return (
    <div className="space-y-4">
      {/* Drawing Tools */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Drawing Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {tools.map(tool => {
            const IconComponent = tool.icon;
            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentTool === tool.id ? 'default' : 'outline'}
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => onToolChange(tool.id)}
                  >
                    <IconComponent className="w-3 h-3 mr-2" />
                    {tool.name}
                    <Badge variant="secondary" className="ml-auto text-xs h-4">
                      {tool.shortcut}
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tool.description}</p>
                  <p className="text-xs opacity-75">Press {tool.shortcut}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </CardContent>
      </Card>

      {/* View Controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">View Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomIn}
              className="h-8"
            >
              <ZoomIn className="w-3 h-3 mr-1" />
              Zoom In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomOut}
              className="h-8"
            >
              <ZoomOut className="w-3 h-3 mr-1" />
              Zoom Out
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onFitToView}
            className="w-full h-8"
          >
            <Fit className="w-3 h-3 mr-1" />
            Fit to View
          </Button>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Zoom:</span>
            <Badge variant="outline" className="text-xs">
              {Math.round(currentZoom * 100)}%
            </Badge>
          </div>
          
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleGrid}
            className="w-full h-8"
          >
            <Grid className="w-3 h-3 mr-1" />
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </Button>
        </CardContent>
      </Card>

      {/* Units Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Units</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-1">
            {unitsOptions.map(unit => (
              <Button
                key={unit}
                variant={units === unit ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUnitsChange(unit)}
                className="h-6 text-xs"
              >
                {unit}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Product Library */}
      <EnhancedProductLibrary
        onProductDrag={onProductDrag}
        currentTool={currentTool}
        onProductUsed={(productId) => {
          console.log('Product used:', productId);
        }}
      />

      {/* Selected Objects Info */}
      {selectedObjects.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selected Objects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {selectedObjects.length} object(s) selected
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDuplicateProduct}
                className="h-8"
              >
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteProduct}
                className="h-8"
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClear}
            className="w-full h-8"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactToolPanel;
