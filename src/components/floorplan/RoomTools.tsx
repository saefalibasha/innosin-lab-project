
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Square } from 'lucide-react';

interface RoomToolsProps {
  onRoomCreate: (room: any) => void;
  onStartRoomCreation: () => void;
}

const RoomTools: React.FC<RoomToolsProps> = ({ onRoomCreate, onStartRoomCreation }) => {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
          <Home className="h-4 w-4" />
          Room Creation
        </h3>
        <div className="space-y-2">
          <Button 
            onClick={onStartRoomCreation}
            className="w-full justify-start"
            variant="outline"
          >
            <Square className="h-4 w-4 mr-2" />
            Draw Custom Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomTools;
