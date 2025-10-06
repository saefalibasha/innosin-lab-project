import React, { useState, useEffect } from 'react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Ruler, Check, X } from 'lucide-react';
import { 
  calculateWorktopLength, 
  findCabinetsUnderWorktop,
  isValidWorktopPlacement 
} from '@/utils/worktopUtils';

interface WorktopConfiguratorProps {
  worktop: PlacedProduct;
  allProducts: PlacedProduct[];
  onUpdate: (updates: Partial<PlacedProduct>) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const WorktopConfigurator: React.FC<WorktopConfiguratorProps> = ({
  worktop,
  allProducts,
  onUpdate,
  onCancel,
  onConfirm,
}) => {
  const [length, setLength] = useState(worktop.dimensions?.width || 600);
  const [cabinetsUnder, setCabinetsUnder] = useState<PlacedProduct[]>([]);

  useEffect(() => {
    const cabinets = findCabinetsUnderWorktop(
      worktop.position,
      { length: worktop.dimensions?.length || 600, width: length },
      allProducts
    );
    setCabinetsUnder(cabinets);
  }, [worktop.position, length, allProducts, worktop.dimensions]);

  const handleLengthChange = (value: number[]) => {
    const newLength = value[0];
    setLength(newLength);
    onUpdate({
      dimensions: {
        ...worktop.dimensions,
        width: newLength,
      }
    });
  };

  const handleAutoFit = () => {
    const cabinets = findCabinetsUnderWorktop(
      worktop.position,
      { length: worktop.dimensions?.length || 600, width: length },
      allProducts
    );
    
    if (cabinets.length > 0) {
      const optimal = calculateWorktopLength(cabinets, worktop.dimensions?.length || 600);
      setLength(optimal.length);
      onUpdate({
        dimensions: {
          ...worktop.dimensions,
          width: optimal.length,
        }
      });
    }
  };

  const validation = isValidWorktopPlacement(
    worktop.position,
    { length: worktop.dimensions?.length || 600, width: length },
    allProducts
  );

  return (
    <div className="absolute top-4 right-4 bg-background border rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Configure Worktop</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Length Adjustment */}
        <div className="space-y-2">
          <Label>Length (mm)</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[length]}
              onValueChange={handleLengthChange}
              min={600}
              max={3000}
              step={50}
              className="flex-1"
            />
            <Input
              type="number"
              value={length}
              onChange={(e) => handleLengthChange([parseInt(e.target.value) || 600])}
              className="w-20"
              min={600}
              max={3000}
            />
          </div>
        </div>

        {/* Auto-fit Button */}
        <Button 
          variant="outline" 
          onClick={handleAutoFit}
          className="w-full"
          disabled={cabinetsUnder.length === 0}
        >
          Auto-fit to Cabinets
        </Button>

        {/* Validation Status */}
        <div className={`p-3 rounded-md ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            {validation.valid ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Valid placement</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">{validation.reason}</span>
              </>
            )}
          </div>
        </div>

        {/* Cabinet Info */}
        <div className="text-sm text-muted-foreground">
          <p>Covering {cabinetsUnder.length} cabinet{cabinetsUnder.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            className="flex-1"
            disabled={!validation.valid}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
