
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ObjectLibrary from '@/components/ObjectLibrary';
import ObjectLegend from '@/components/ObjectLegend';
import UnitSelector from '@/components/UnitSelector';
import ProductDimensionEditor from '@/components/ProductDimensionEditor';
import HowToUseModal from '@/components/HowToUseModal';
import { 
  Mouse, 
  Square, 
  Minus, 
  DoorOpen, 
  RotateCcw, 
  Eraser, 
  Trash2, 
  Grid3X3, 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  HelpCircle
} from 'lucide-react';
import { PlacedProduct } from '@/types/floorPlanTypes';

type Units = 'mm' | 'cm' | 'm' | 'ft' | 'in';
type DrawingTool = 'wall' | 'line' | 'freehand' | 'pan' | 'eraser' | 'select' | 'interior-wall' | 'door' | 'rotate';

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
  units: Units;
  onUnitsChange: (units: Units) => void;
  onProductDrag: (product: any) => void;
  placedProducts?: PlacedProduct[];
  onObjectSelect?: (objectId: string) => void;
  selectedObjects?: string[];
  onUpdateProduct?: (product: PlacedProduct) => void;
  onDeleteProduct?: () => void;
  onDuplicateProduct?: () => void;
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
  placedProducts = [],
  onObjectSelect = () => {},
  selectedObjects = [],
  onUpdateProduct = () => {},
  onDeleteProduct = () => {},
  onDuplicateProduct = () => {}
}) => {
  // Get the selected product
  const selectedProduct = selectedObjects.length === 1 
    ? placedProducts.find(p => p.id === selectedObjects[0]) || null 
    : null;
  const tools = [
    { id: 'select', label: 'Select', icon: Mouse, shortcut: 'S' },
    { id: 'wall', label: 'Wall', icon: Minus, shortcut: 'W' },
    { id: 'interior-wall', label: 'Interior Wall', icon: Square, shortcut: 'I' },
    { id: 'door', label: 'Door', icon: DoorOpen, shortcut: 'D' },
    { id: 'rotate', label: 'Rotate', icon: RotateCcw, shortcut: 'R' },
    { id: 'eraser', label: 'Eraser', icon: Eraser, shortcut: 'E' }
  ];

  return (
    <div className="space-y-4">
      {/* Drawing Tools */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Drawing Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {tools.map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentTool === tool.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onToolChange(tool.id)}
                    className="h-8 text-xs"
                  >
                    <tool.icon className="w-3 h-3 mr-1" />
                    {tool.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tool.label} ({tool.shortcut})</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">View Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant={showGrid ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleGrid}
              className="h-7"
            >
              <Grid3X3 className="w-3 h-3 mr-1" />
              Grid
            </Button>
            <Badge variant="outline" className="text-xs">
              {Math.round(currentZoom * 100)}%
            </Badge>
          </div>
          
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onZoomOut} className="h-7 flex-1">
                  <ZoomOut className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Zoom Out (-)</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onFitToView} className="h-7 flex-1">
                  <Maximize className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Fit to View (F)</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onZoomIn} className="h-7 flex-1">
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Zoom In (+)</p></TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {/* Units */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Units</CardTitle>
        </CardHeader>
        <CardContent>
          <UnitSelector units={units} onUnitsChange={onUnitsChange} />
        </CardContent>
      </Card>

      {/* Object Library */}
      <ObjectLibrary
        onProductDrag={onProductDrag}
        currentTool={currentTool as DrawingTool}
      />

      {/* Product Dimension Editor */}
      <ProductDimensionEditor
        selectedProduct={selectedProduct}
        onUpdateProduct={onUpdateProduct}
        onDeleteProduct={onDeleteProduct}
        onDuplicateProduct={onDuplicateProduct}
        units={units}
      />

      {/* Object Legend */}
      <ObjectLegend
        placedProducts={placedProducts}
        onObjectSelect={onObjectSelect}
        selectedObjects={selectedObjects}
      />

      {/* Actions */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <HowToUseModal>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              How to Use
            </Button>
          </HowToUseModal>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onClear}
            className="w-full"
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
