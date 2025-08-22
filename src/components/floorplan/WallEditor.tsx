import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { WallSegment, WallType } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas, MeasurementUnit } from '@/utils/measurements';
import { Edit, Save, X, Trash2 } from 'lucide-react';

interface WallEditorProps {
  selectedWall: WallSegment | null;
  onWallUpdate: (wall: WallSegment) => void;
  onWallDelete: (wallId: string) => void;
  onClose: () => void;
  scale: number;
  measurementUnit: MeasurementUnit;
}

export const WallEditor: React.FC<WallEditorProps> = ({
  selectedWall,
  onWallUpdate,
  onWallDelete,
  onClose,
  scale,
  measurementUnit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWall, setEditedWall] = useState<WallSegment | null>(selectedWall);

  if (!selectedWall || !editedWall) return null;

  const calculateWallLength = (wall: WallSegment): number => {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const wallLengthInMm = canvasToMm(calculateWallLength(editedWall), scale);
  const wallThicknessInMm = canvasToMm(editedWall.thickness, scale);

  const handleLengthChange = (newLengthMm: number) => {
    const currentLength = calculateWallLength(editedWall);
    const scaleFactor = mmToCanvas(newLengthMm, scale) / currentLength;
    
    const dx = editedWall.end.x - editedWall.start.x;
    const dy = editedWall.end.y - editedWall.start.y;
    
    setEditedWall({
      ...editedWall,
      end: {
        x: editedWall.start.x + dx * scaleFactor,
        y: editedWall.start.y + dy * scaleFactor
      }
    });
  };

  const handleThicknessChange = (newThicknessMm: number) => {
    setEditedWall({
      ...editedWall,
      thickness: mmToCanvas(newThicknessMm, scale)
    });
  };

  const handleSave = () => {
    onWallUpdate(editedWall);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onWallDelete(editedWall.id);
    onClose();
  };

  return (
    <Card className="w-80 fixed top-4 right-4 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Wall Properties</CardTitle>
          <div className="flex items-center space-x-1">
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="h-6 w-6 p-0 text-green-600"
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditedWall(selectedWall);
                    setIsEditing(false);
                  }}
                  className="h-6 w-6 p-0 text-gray-500"
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Badge variant="outline">ID: {editedWall.id.slice(-6)}</Badge>
          <Badge variant="outline">{editedWall.type}</Badge>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Length</Label>
            {isEditing ? (
              <Input
                type="number"
                value={Math.round(wallLengthInMm)}
                onChange={(e) => handleLengthChange(Number(e.target.value))}
                className="h-8 text-xs"
                min="1"
                step="1"
              />
            ) : (
              <div className="h-8 px-3 py-1 bg-gray-50 rounded text-xs flex items-center">
                {formatMeasurement(wallLengthInMm, measurementUnit, measurementUnit === 'mm' ? 0 : 2)}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">Thickness</Label>
            {isEditing ? (
              <Input
                type="number"
                value={Math.round(wallThicknessInMm)}
                onChange={(e) => handleThicknessChange(Number(e.target.value))}
                className="h-8 text-xs"
                min="1"
                step="1"
              />
            ) : (
              <div className="h-8 px-3 py-1 bg-gray-50 rounded text-xs flex items-center">
                {formatMeasurement(wallThicknessInMm, measurementUnit, measurementUnit === 'mm' ? 0 : 2)}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">Wall Type</Label>
            {isEditing ? (
              <Select
                value={editedWall.type}
                onValueChange={(value) => setEditedWall({ ...editedWall, type: value as WallType })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WallType.INTERIOR}>Interior</SelectItem>
                  <SelectItem value={WallType.EXTERIOR}>Exterior</SelectItem>
                  <SelectItem value={WallType.PARTITION}>Partition</SelectItem>
                  <SelectItem value={WallType.LOAD_BEARING}>Load Bearing</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="h-8 px-3 py-1 bg-gray-50 rounded text-xs flex items-center capitalize">
                {editedWall.type.replace('_', ' ').toLowerCase()}
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs">Color</Label>
            {isEditing ? (
              <Input
                type="color"
                value={editedWall.color}
                onChange={(e) => setEditedWall({ ...editedWall, color: e.target.value })}
                className="h-8 w-full"
              />
            ) : (
              <div className="h-8 px-3 py-1 bg-gray-50 rounded text-xs flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2 border"
                  style={{ backgroundColor: editedWall.color }}
                />
                {editedWall.color}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="w-full h-7 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete Wall
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WallEditor;