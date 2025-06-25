
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Undo, 
  Redo, 
  Ruler, 
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize
} from 'lucide-react';

interface CompactToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  showMeasurements: boolean;
  onToggleMeasurements: () => void;
  onExport: () => void;
  onToggleFullScreen: () => void;
  isFullScreen: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const CompactToolbar: React.FC<CompactToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showMeasurements,
  onToggleMeasurements,
  onExport,
  onToggleFullScreen,
  isFullScreen,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  return (
    <div className="h-12 bg-white border-b border-gray-200 px-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="h-8 w-8 p-0"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isSidebarCollapsed ? 'Show' : 'Hide'} Tools</p>
          </TooltipContent>
        </Tooltip>
        
        <h1 className="text-lg font-semibold text-gray-900">Floor Planner</h1>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-8 w-8 p-0"
              >
                <Undo className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-8 w-8 p-0"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showMeasurements ? 'default' : 'ghost'}
              size="sm"
              onClick={onToggleMeasurements}
              className="h-8"
            >
              <Ruler className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Measure</span>
              <Badge variant="outline" className="ml-1 text-xs hidden md:inline">M</Badge>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Measurements (M)</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="h-8"
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export Floor Plan</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullScreen}
              className="h-8"
            >
              <Maximize className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{isFullScreen ? 'Exit' : 'Full'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFullScreen ? 'Exit' : 'Enter'} Full Screen</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default CompactToolbar;
