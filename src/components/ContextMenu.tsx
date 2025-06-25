
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, Trash2, RotateCcw, Move } from 'lucide-react';

interface FloorPlanContextMenuProps {
  children: React.ReactNode;
  selectedObjects: string[];
  onCopy: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRotate?: () => void;
}

const FloorPlanContextMenu: React.FC<FloorPlanContextMenuProps> = ({
  children,
  selectedObjects,
  onCopy,
  onDelete,
  onDuplicate,
  onRotate
}) => {
  const hasSelection = selectedObjects.length > 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-white border border-gray-200 shadow-lg">
        <ContextMenuItem 
          onClick={onCopy} 
          disabled={!hasSelection}
          className="flex items-center space-x-2"
        >
          <Copy className="w-4 h-4" />
          <span>Copy</span>
          <span className="ml-auto text-xs text-gray-500">Ctrl+C</span>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onDuplicate} 
          disabled={!hasSelection}
          className="flex items-center space-x-2"
        >
          <Move className="w-4 h-4" />
          <span>Duplicate</span>
          <span className="ml-auto text-xs text-gray-500">Ctrl+D</span>
        </ContextMenuItem>

        {onRotate && (
          <ContextMenuItem 
            onClick={onRotate} 
            disabled={!hasSelection}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rotate</span>
            <span className="ml-auto text-xs text-gray-500">R</span>
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={onDelete} 
          disabled={!hasSelection}
          className="flex items-center space-x-2 text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
          <span className="ml-auto text-xs text-gray-500">Del</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FloorPlanContextMenu;
