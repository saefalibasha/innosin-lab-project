
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Square, Plus } from 'lucide-react';

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
            onClick={() => {/* Handle preset room creation */}}
            className="w-full justify-start"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Preset Room
          </Button>
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

      <div>
        <h3 className="font-medium text-sm mb-3">Quick Templates</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {/* Handle lab room template */}}
          >
            Lab Room
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {/* Handle office template */}}
          >
            Office
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {/* Handle storage template */}}
          >
            Storage
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {/* Handle corridor template */}}
          >
            Corridor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomTools;
