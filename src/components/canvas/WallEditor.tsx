
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { WallSegment, WallType } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas } from '@/utils/measurements';

interface WallEditorProps {
  selectedWalls: string[];
  walls: WallSegment[];
  onWallUpdate: (wallId: string, updates: Partial<WallSegment>) => void;
  onWallDelete: (wallId: string) => void;
  scale: number;
}

const WallEditor: React.FC<WallEditorProps> = ({
  selectedWalls,
  walls,
  onWallUpdate,
  onWallDelete,
  scale
}) => {
  const [thickness, setThickness] = useState(100); // Default 100mm

  const selectedWallObjects = walls.filter(wall => selectedWalls.includes(wall.id));

  const handleThicknessChange = useCallback((value: number[]) => {
    const newThickness = value[0];
    setThickness(newThickness);
    
    selectedWalls.forEach(wallId => {
      onWallUpdate(wallId, { thickness: newThickness });
    });
  }, [selectedWalls, onWallUpdate]);

  const handleWallTypeChange = useCallback((wallType: WallType) => {
    selectedWalls.forEach(wallId => {
      onWallUpdate(wallId, { type: wallType });
    });
  }, [selectedWalls, onWallUpdate]);

  const handlePositionChange = useCallback((wallId: string, field: 'startX' | 'startY' | 'endX' | 'endY', value: string) => {
    const wall = walls.find(w => w.id === wallId);
    if (!wall) return;

    const numValue = parseFloat(value) || 0;
    const pixelValue = mmToCanvas(numValue, scale);

    let updates: Partial<WallSegment> = {};
    
    switch (field) {
      case 'startX':
        updates = { start: { ...wall.start, x: pixelValue } };
        break;
      case 'startY':
        updates = { start: { ...wall.start, y: pixelValue } };
        break;
      case 'endX':
        updates = { end: { ...wall.end, x: pixelValue } };
        break;
      case 'endY':
        updates = { end: { ...wall.end, y: pixelValue } };
        break;
    }

    onWallUpdate(wallId, updates);
  }, [walls, scale, onWallUpdate]);

  const handleDeleteSelected = useCallback(() => {
    selectedWalls.forEach(wallId => {
      onWallDelete(wallId);
    });
  }, [selectedWalls, onWallDelete]);

  const calculateWallLength = useCallback((wall: WallSegment): number => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const calculateWallAngle = useCallback((wall: WallSegment): number => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }, []);

  if (selectedWalls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wall Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Select walls to edit their properties</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Wall Editor ({selectedWalls.length} selected)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wall Thickness */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Wall Thickness</Label>
          <div className="space-y-2">
            <Slider
              value={[thickness]}
              onValueChange={handleThicknessChange}
              min={50}
              max={300}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>50mm</span>
              <span>{thickness}mm</span>
              <span>300mm</span>
            </div>
          </div>
        </div>

        {/* Wall Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Wall Type</Label>
          <Select onValueChange={handleWallTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select wall type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={WallType.INTERIOR}>Interior Wall</SelectItem>
              <SelectItem value={WallType.EXTERIOR}>Exterior Wall</SelectItem>
              <SelectItem value={WallType.LOAD_BEARING}>Load Bearing</SelectItem>
              <SelectItem value={WallType.PARTITION}>Partition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Individual Wall Properties */}
        {selectedWallObjects.map((wall, index) => (
          <div key={wall.id} className="border rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Wall {index + 1}</h4>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onWallDelete(wall.id)}
              >
                Delete
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Length:</span> {formatMeasurement(canvasToMm(calculateWallLength(wall), scale), { unit: 'mm', precision: 0, showUnit: true })}
              </div>
              <div>
                <span className="font-medium">Angle:</span> {calculateWallAngle(wall).toFixed(1)}°
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Start Point (mm)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={canvasToMm(wall.start.x, scale).toFixed(0)}
                  onChange={(e) => handlePositionChange(wall.id, 'startX', e.target.value)}
                  placeholder="X"
                  className="text-xs"
                />
                <Input
                  type="number"
                  value={canvasToMm(wall.start.y, scale).toFixed(0)}
                  onChange={(e) => handlePositionChange(wall.id, 'startY', e.target.value)}
                  placeholder="Y"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">End Point (mm)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={canvasToMm(wall.end.x, scale).toFixed(0)}
                  onChange={(e) => handlePositionChange(wall.id, 'endX', e.target.value)}
                  placeholder="X"
                  className="text-xs"
                />
                <Input
                  type="number"
                  value={canvasToMm(wall.end.y, scale).toFixed(0)}
                  onChange={(e) => handlePositionChange(wall.id, 'endY', e.target.value)}
                  placeholder="Y"
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Bulk Actions */}
        <div className="pt-2 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            className="w-full"
          >
            Delete Selected Walls
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WallEditor;
