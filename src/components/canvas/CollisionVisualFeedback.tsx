
import React from 'react';
import { Point, PlacedProduct } from '@/types/floorPlanTypes';

interface CollisionVisualFeedbackProps {
  draggedProduct?: PlacedProduct | null;
  dragPosition?: Point;
  hasCollision: boolean;
  collisionType?: 'wall' | 'furniture' | 'boundary' | null;
  snapResult?: {
    snapped: boolean;
    position: Point;
    snapType: 'edge-to-edge' | 'alignment' | 'corner' | null;
    target?: PlacedProduct;
    gap: number;
  };
  scale: number;
}

export const CollisionVisualFeedback: React.FC<CollisionVisualFeedbackProps> = ({
  draggedProduct,
  dragPosition,
  hasCollision,
  collisionType,
  snapResult,
  scale
}) => {
  if (!draggedProduct || !dragPosition) return null;

  const width = draggedProduct.dimensions.length * scale;
  const height = draggedProduct.dimensions.width * scale;

  // Determine visual style based on state
  const getStyle = () => {
    if (hasCollision) {
      switch (collisionType) {
        case 'wall':
          return {
            border: '2px solid #ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '4px'
          };
        case 'furniture':
          return {
            border: '2px solid #f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.2)',
            borderRadius: '4px'
          };
        case 'boundary':
          return {
            border: '2px solid #dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            borderRadius: '4px'
          };
        default:
          return {
            border: '2px solid #ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderRadius: '4px'
          };
      }
    }

    if (snapResult?.snapped) {
      return {
        border: '2px solid #22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderRadius: '4px'
      };
    }

    return {
      border: '2px solid #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '4px'
    };
  };

  const style = getStyle();
  const position = snapResult?.snapped ? snapResult.position : dragPosition;

  return (
    <>
      {/* Product outline */}
      <div
        style={{
          position: 'absolute',
          left: position.x - width / 2,
          top: position.y - height / 2,
          width,
          height,
          ...style,
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />

      {/* Snap indicators */}
      {snapResult?.snapped && snapResult.target && (
        <>
          {/* Snap line between products */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 999
            }}
          >
            {snapResult.snapType === 'edge-to-edge' && (
              <line
                x1={position.x}
                y1={position.y}
                x2={snapResult.target.position.x}
                y2={snapResult.target.position.y}
                stroke="#22c55e"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
              />
            )}
            
            {snapResult.snapType === 'alignment' && (
              <line
                x1={Math.abs(position.x - snapResult.target.position.x) < 5 ? position.x : 0}
                y1={Math.abs(position.x - snapResult.target.position.x) < 5 ? 0 : position.y}
                x2={Math.abs(position.x - snapResult.target.position.x) < 5 ? position.x : window.innerWidth}
                y2={Math.abs(position.x - snapResult.target.position.x) < 5 ? window.innerHeight : position.y}
                stroke="#22c55e"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.5"
              />
            )}
          </svg>

          {/* Gap measurement display */}
          {snapResult.gap > 0 && (
            <div
              style={{
                position: 'absolute',
                left: (position.x + snapResult.target.position.x) / 2,
                top: (position.y + snapResult.target.position.y) / 2,
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#22c55e',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 1001
              }}
            >
              {Math.round(snapResult.gap / scale)}mm
            </div>
          )}

          {/* Seamless connection indicator */}
          {snapResult.gap === 0 && (
            <div
              style={{
                position: 'absolute',
                left: (position.x + snapResult.target.position.x) / 2,
                top: (position.y + snapResult.target.position.y) / 2,
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#22c55e',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 1001
              }}
            >
              ✓ Seamless
            </div>
          )}
        </>
      )}

      {/* Collision warning text */}
      {hasCollision && (
        <div
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y - height / 2 - 25,
            transform: 'translateX(-50%)',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 1001
          }}
        >
          {collisionType === 'wall' && '⚠ Too close to wall'}
          {collisionType === 'furniture' && '⚠ Overlapping furniture'}
          {collisionType === 'boundary' && '⚠ Outside canvas'}
        </div>
      )}
    </>
  );
};

export default CollisionVisualFeedback;
