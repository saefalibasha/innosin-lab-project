
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Point, Room } from '@/types/floorPlanTypes';
import { mmToCanvas } from '@/utils/measurements';

interface RoomCreatorProps {
  onRoomCreate: (room: Room) => void;
  onCancel: () => void;
  scale: number;
}

const RoomCreator: React.FC<RoomCreatorProps> = ({ onRoomCreate, onCancel, scale }) => {
  const [roomType, setRoomType] = useState<'rectangle' | 'custom'>('rectangle');
  const [dimensions, setDimensions] = useState({ width: 4000, height: 3000 }); // in mm
  const [roomName, setRoomName] = useState('Room 1');

  const createRectangularRoom = () => {
    const widthPx = mmToCanvas(dimensions.width, scale);
    const heightPx = mmToCanvas(dimensions.height, scale);
    
    const centerX = 600; // Center in 1200px canvas
    const centerY = 400; // Center in 800px canvas
    
    const points: Point[] = [
      { x: centerX - widthPx / 2, y: centerY - heightPx / 2 },
      { x: centerX + widthPx / 2, y: centerY - heightPx / 2 },
      { x: centerX + widthPx / 2, y: centerY + heightPx / 2 },
      { x: centerX - widthPx / 2, y: centerY + heightPx / 2 }
    ];

    const room: Room = {
      id: `room-${Date.now()}`,
      name: roomName,
      points,
      area: dimensions.width * dimensions.height,
      perimeter: 2 * (dimensions.width + dimensions.height)
    };

    onRoomCreate(room);
  };

  const roomPresets = [
    { name: 'Small Lab (3x3m)', width: 3000, height: 3000 },
    { name: 'Medium Lab (4x4m)', width: 4000, height: 4000 },
    { name: 'Large Lab (5x6m)', width: 5000, height: 6000 },
    { name: 'Classroom (8x6m)', width: 8000, height: 6000 }
  ];

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Create Room</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="room-name">Room Name</Label>
          <Input
            id="room-name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
          />
        </div>

        <div>
          <Label>Room Type</Label>
          <Select value={roomType} onValueChange={(value: 'rectangle' | 'custom') => setRoomType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rectangle">Rectangular</SelectItem>
              <SelectItem value="custom">Custom Shape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {roomType === 'rectangle' && (
          <>
            <div>
              <Label>Quick Presets</Label>
              <Select onValueChange={(value) => {
                const preset = roomPresets.find(p => p.name === value);
                if (preset) {
                  setDimensions({ width: preset.width, height: preset.height });
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  {roomPresets.map(preset => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="width">Width (mm)</Label>
                <Input
                  id="width"
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (mm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </>
        )}

        {roomType === 'custom' && (
          <div className="text-sm text-gray-600">
            After creating, click on canvas to add room corner points. Click near the first point to close the room.
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={createRectangularRoom} className="flex-1">
            Create Room
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCreator;
