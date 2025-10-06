import React from 'react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface WorktopPlacementIndicatorProps {
  isValid: boolean;
  message?: string;
  cabinetsCount: number;
}

export const WorktopPlacementIndicator: React.FC<WorktopPlacementIndicatorProps> = ({
  isValid,
  message,
  cabinetsCount,
}) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className={`
        flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
        ${isValid ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}
      `}>
        {isValid ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Ready to place on {cabinetsCount} cabinet{cabinetsCount !== 1 ? 's' : ''}
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {message || 'Invalid placement - requires base cabinet'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
