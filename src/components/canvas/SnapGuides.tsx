
import React from 'react';
import { Point, PlacedProduct } from '@/types/floorPlanTypes';

interface SnapGuidesProps {
  snapResult?: {
    snapped: boolean;
    position: Point;
    snapType: 'edge-to-edge' | 'alignment' | 'corner' | null;
    target?: PlacedProduct;
    gap: number;
  };
  draggedProduct?: PlacedProduct | null;
  isColliding?: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

const SnapGuides: React.FC<SnapGuidesProps> = ({
  snapResult,
  draggedProduct,
  isColliding,
  canvasWidth,
  canvasHeight
}) => {
  if (!draggedProduct) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Snap guides */}
      {snapResult?.snapped && snapResult.target && (
        <>
          {snapResult.snapType === 'alignment' && (
            <>
              {/* Vertical alignment line */}
              <div
                className="absolute bg-blue-500 opacity-60"
                style={{
                  left: snapResult.position.x - 1,
                  top: 0,
                  width: 2,
                  height: canvasHeight
                }}
              />
              {/* Horizontal alignment line */}
              <div
                className="absolute bg-blue-500 opacity-60"
                style={{
                  left: 0,
                  top: snapResult.position.y - 1,
                  width: canvasWidth,
                  height: 2
                }}
              />
            </>
          )}
          
          {snapResult.snapType === 'edge-to-edge' && (
            <>
              {/* Snap connection line */}
              <div
                className="absolute bg-green-500 opacity-70"
                style={{
                  left: Math.min(snapResult.position.x, snapResult.target.position.x) - 1,
                  top: Math.min(snapResult.position.y, snapResult.target.position.y) - 1,
                  width: Math.abs(snapResult.position.x - snapResult.target.position.x) + 2,
                  height: Math.abs(snapResult.position.y - snapResult.target.position.y) + 2,
                  background: 'linear-gradient(45deg, transparent 45%, #10b981 50%, transparent 55%)',
                  backgroundSize: '8px 8px'
                }}
              />
              
              {/* Gap measurement */}
              {snapResult.gap < 5 && (
                <div
                  className="absolute bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg"
                  style={{
                    left: (snapResult.position.x + snapResult.target.position.x) / 2 - 20,
                    top: (snapResult.position.y + snapResult.target.position.y) / 2 - 15,
                    fontSize: '10px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Snapped
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Collision indicator */}
      {isColliding && (
        <div
          className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20 rounded"
          style={{
            left: draggedProduct.position.x - 50,
            top: draggedProduct.position.y - 25,
            width: 100,
            height: 50,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Snap zones preview */}
      {!snapResult?.snapped && draggedProduct && (
        <div className="snap-zones">
          {/* This could show potential snap zones as subtle highlights */}
        </div>
      )}
    </div>
  );
};

export default SnapGuides;
