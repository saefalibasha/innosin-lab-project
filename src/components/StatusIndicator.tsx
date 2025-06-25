
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, Wifi, WifiOff } from 'lucide-react';

interface StatusIndicatorProps {
  isAutoSaving: boolean;
  lastSaved?: Date;
  isOnline: boolean;
  operationInProgress?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isAutoSaving,
  lastSaved,
  isOnline,
  operationInProgress
}) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Auto-save indicator */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isAutoSaving ? 'default' : 'outline'} 
            className="text-xs"
          >
            <Save className="w-3 h-3 mr-1" />
            {isAutoSaving ? 'Saving...' : 'Saved'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isAutoSaving 
              ? 'Auto-saving changes...' 
              : lastSaved 
                ? `Last saved: ${lastSaved.toLocaleTimeString()}` 
                : 'All changes saved'
            }
          </p>
        </TooltipContent>
      </Tooltip>

      {/* Online status */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isOnline ? 'default' : 'destructive'} 
            className="text-xs"
          >
            {isOnline ? (
              <Wifi className="w-3 h-3 mr-1" />
            ) : (
              <WifiOff className="w-3 h-3 mr-1" />
            )}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isOnline ? 'Connected to server' : 'Working offline'}</p>
        </TooltipContent>
      </Tooltip>

      {/* Operation in progress */}
      {operationInProgress && (
        <Badge variant="secondary" className="text-xs animate-pulse">
          {operationInProgress}
        </Badge>
      )}
    </div>
  );
};

export default StatusIndicator;
