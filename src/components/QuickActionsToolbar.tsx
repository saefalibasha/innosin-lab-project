
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Clipboard, Trash2, RotateCcw, Move, MousePointer } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickActionsToolbarProps {
  hasSelection: boolean;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSelectAll: () => void;
  canPaste: boolean;
}

const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  hasSelection,
  onCopy,
  onPaste,
  onDelete,
  onDuplicate,
  onSelectAll,
  canPaste
}) => {
  return (
    <div className="flex items-center space-x-1 border-l border-gray-200 pl-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="h-8 px-3"
          >
            <MousePointer className="w-4 h-4 mr-1" />
            All
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Select All (Ctrl+A)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            disabled={!hasSelection}
            className="h-8 px-3"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy (Ctrl+C)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onPaste}
            disabled={!canPaste}
            className="h-8 px-3"
          >
            <Clipboard className="w-4 h-4 mr-1" />
            Paste
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Paste (Ctrl+V)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onDuplicate}
            disabled={!hasSelection}
            className="h-8 px-3"
          >
            <Move className="w-4 h-4 mr-1" />
            Duplicate
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Duplicate (Ctrl+D)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={!hasSelection}
            className="h-8 px-3"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete (Del)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default QuickActionsToolbar;
