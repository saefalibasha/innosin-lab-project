import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WallSegment } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm, mmToCanvas } from '@/utils/measurements';
import { Check, X } from 'lucide-react';

interface WallLengthEditorProps {
  wall: WallSegment | null;
  onWallUpdate: (wall: WallSegment) => void;
  onClose: () => void;
  measurementUnit: 'mm' | 'm';
  scale: number;
}

const WallLengthEditor: React.FC<WallLengthEditorProps> = ({
  wall,
  onWallUpdate,
  onClose,
  measurementUnit,
  scale
}) => {
  const [length, setLength] = useState('');

  useEffect(() => {
    if (wall) {
      const currentLength = Math.sqrt(
        Math.pow(wall.end.x - wall.start.x, 2) + 
        Math.pow(wall.end.y - wall.start.y, 2)
      );
      const lengthMm = canvasToMm(currentLength, scale);
      setLength(formatMeasurement(lengthMm, measurementUnit).replace(/[^\d.]/g, ''));
    }
  }, [wall, scale, measurementUnit]);

  if (!wall) return null;

  const handleSave = () => {
    const newLength = parseFloat(length);
    if (isNaN(newLength) || newLength <= 0) return;

    // Convert to mm if needed
    const lengthMm = measurementUnit === 'm' ? newLength * 1000 : newLength;
    const lengthPx = mmToCanvas(lengthMm, scale);

    // Calculate wall direction
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const currentLength = Math.sqrt(dx * dx + dy * dy);
    
    if (currentLength === 0) return;

    // Normalize direction
    const dirX = dx / currentLength;
    const dirY = dy / currentLength;

    // Update wall end point to match new length
    const updatedWall: WallSegment = {
      ...wall,
      end: {
        x: wall.start.x + dirX * lengthPx,
        y: wall.start.y + dirY * lengthPx
      }
    };

    onWallUpdate(updatedWall);
    onClose();
  };

  return (
    <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-medium">Edit Wall Length</h3>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="Length"
          className="w-20 text-sm"
          step={measurementUnit === 'm' ? '0.1' : '10'}
        />
        <span className="text-xs text-muted-foreground">{measurementUnit}</span>
        <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0">
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WallLengthEditor;