
import React from 'react';
import { Point, WallSegment } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm } from '@/utils/measurements';

interface IntelligentMeasurementOverlayProps {
  roomPoints: Point[];
  wallSegments: WallSegment[];
  scale: number;
  showMeasurements: boolean;
  canvas: HTMLCanvasElement | null;
  units: string;
}

const IntelligentMeasurementOverlay: React.FC<IntelligentMeasurementOverlayProps> = ({
  roomPoints,
  wallSegments,
  scale,
  showMeasurements,
  canvas,
  units
}) => {
  if (!showMeasurements || !canvas) return null;

  const measurements = [];

  // Add room measurements
  for (let i = 0; i < roomPoints.length; i++) {
    const current = roomPoints[i];
    const next = roomPoints[(i + 1) % roomPoints.length];
    
    if (current && next) {
      const distance = Math.sqrt(
        Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)
      );
      
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      const measurement = formatMeasurement(canvasToMm(distance, scale), {
        unit: units,
        precision: 0,
        showUnit: true
      });
      
      measurements.push({
        key: `room-${i}`,
        x: midX,
        y: midY,
        text: measurement
      });
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {measurements.map((measurement) => (
        <div
          key={measurement.key}
          className="absolute text-xs bg-white px-1 py-0.5 rounded border shadow-sm"
          style={{
            left: measurement.x,
            top: measurement.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {measurement.text}
        </div>
      ))}
    </div>
  );
};

export default IntelligentMeasurementOverlay;
