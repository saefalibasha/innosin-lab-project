
import React from 'react';
import { Point, WallSegment } from '@/types/floorPlanTypes';

interface MeasurementOverlayProps {
  roomPoints: Point[];
  wallSegments: WallSegment[];
  scale: number;
  showMeasurements: boolean;
  canvas?: HTMLCanvasElement | null;
}

const MeasurementOverlay: React.FC<MeasurementOverlayProps> = ({
  roomPoints,
  wallSegments,
  scale,
  showMeasurements,
  canvas
}) => {
  if (!showMeasurements || !canvas) return null;

  const calculateDistance = (p1: Point, p2: Point) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy) / scale;
  };

  const getMidpoint = (p1: Point, p2: Point) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  });

  const renderMeasurements = () => {
    const measurements = [];

    // Room perimeter measurements
    for (let i = 0; i < roomPoints.length; i++) {
      const current = roomPoints[i];
      const next = roomPoints[(i + 1) % roomPoints.length];
      const distance = calculateDistance(current, next);
      const midpoint = getMidpoint(current, next);
      
      measurements.push(
        <div
          key={`room-${i}`}
          className="absolute bg-blue-600 text-white text-xs px-2 py-1 rounded pointer-events-none z-50"
          style={{
            left: midpoint.x - 20,
            top: midpoint.y - 12,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {distance.toFixed(2)}m
        </div>
      );
    }

    // Interior wall measurements
    wallSegments.forEach((wall, index) => {
      const distance = calculateDistance(wall.start, wall.end);
      const midpoint = getMidpoint(wall.start, wall.end);
      
      measurements.push(
        <div
          key={`wall-${index}`}
          className="absolute bg-orange-600 text-white text-xs px-2 py-1 rounded pointer-events-none z-50"
          style={{
            left: midpoint.x - 20,
            top: midpoint.y - 12,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {distance.toFixed(2)}m
        </div>
      );
    });

    return measurements;
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {renderMeasurements()}
    </div>
  );
};

export default MeasurementOverlay;
