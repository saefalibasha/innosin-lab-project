
import React from 'react';
import { Point, WallSegment } from '@/types/floorPlanTypes';
import { formatMeasurement, canvasToMm } from '@/utils/measurements';

interface IntelligentMeasurementOverlayProps {
  roomPoints: Point[];
  wallSegments: WallSegment[];
  scale: number;
  showMeasurements: boolean;
  canvas?: HTMLCanvasElement | null;
  units: 'mm' | 'cm' | 'm' | 'ft' | 'in';
}

interface MeasurementLabel {
  id: string;
  x: number;
  y: number;
  distance: number; // in mm
  type: 'room' | 'wall';
  angle: number;
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

  const formatMeasurementValue = (distanceMm: number): string => {
    return formatMeasurement(distanceMm, units, units === 'mm' ? 0 : units === 'cm' ? 1 : 2);
  };

  const calculateDistance = (p1: Point, p2: Point): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const canvasDistance = Math.sqrt(dx * dx + dy * dy);
    return canvasToMm(canvasDistance, scale);
  };

  const calculateAngle = (p1: Point, p2: Point): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  };

  const getMidpoint = (p1: Point, p2: Point): Point => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  });

  const getOptimalLabelPosition = (midpoint: Point, angle: number, distanceMm: number, isRoom: boolean): Point => {
    const baseOffset = 30;
    const dynamicOffset = Math.min(distanceMm * 0.01, 20); // Scale offset based on distance
    const totalOffset = baseOffset + dynamicOffset;
    
    const perpAngle = (angle + 90) * Math.PI / 180;
    const offsetX = Math.cos(perpAngle) * totalOffset;
    const offsetY = Math.sin(perpAngle) * totalOffset;
    
    return {
      x: midpoint.x + (isRoom ? offsetX : -offsetX),
      y: midpoint.y + (isRoom ? offsetY : -offsetY)
    };
  };

  const detectCollisions = (labels: MeasurementLabel[]): MeasurementLabel[] => {
    const COLLISION_THRESHOLD = 80; // Increased for better visibility
    const adjustedLabels = [...labels];
    
    for (let i = 0; i < adjustedLabels.length; i++) {
      for (let j = i + 1; j < adjustedLabels.length; j++) {
        const label1 = adjustedLabels[i];
        const label2 = adjustedLabels[j];
        
        const dx = label1.x - label2.x;
        const dy = label1.y - label2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < COLLISION_THRESHOLD) {
          const moveDistance = (COLLISION_THRESHOLD - distance) / 2;
          const moveAngle = Math.atan2(dy, dx);
          
          adjustedLabels[i].x += Math.cos(moveAngle) * moveDistance;
          adjustedLabels[i].y += Math.sin(moveAngle) * moveDistance;
          adjustedLabels[j].x -= Math.cos(moveAngle) * moveDistance;
          adjustedLabels[j].y -= Math.sin(moveAngle) * moveDistance;
        }
      }
    }
    
    return adjustedLabels;
  };

  const generateMeasurements = (): MeasurementLabel[] => {
    const labels: MeasurementLabel[] = [];

    // Room perimeter measurements
    for (let i = 0; i < roomPoints.length; i++) {
      const current = roomPoints[i];
      const next = roomPoints[(i + 1) % roomPoints.length];
      const distance = calculateDistance(current, next);
      
      // Only show measurements for significant distances (> 100mm)
      if (distance < 100) continue;
      
      const angle = calculateAngle(current, next);
      const midpoint = getMidpoint(current, next);
      const position = getOptimalLabelPosition(midpoint, angle, distance, true);
      
      labels.push({
        id: `room-${i}`,
        x: position.x,
        y: position.y,
        distance,
        type: 'room',
        angle
      });
    }

    // Interior wall measurements
    wallSegments.forEach((wall, index) => {
      const distance = calculateDistance(wall.start, wall.end);
      
      // Only show measurements for significant distances (> 100mm)
      if (distance < 100) return;
      
      const angle = calculateAngle(wall.start, wall.end);
      const midpoint = getMidpoint(wall.start, wall.end);
      const position = getOptimalLabelPosition(midpoint, angle, distance, false);
      
      labels.push({
        id: `wall-${index}`,
        x: position.x,
        y: position.y,
        distance,
        type: 'wall',
        angle
      });
    });

    return detectCollisions(labels);
  };

  const measurements = generateMeasurements();

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {measurements.map((measurement) => (
        <div key={measurement.id} className="absolute">
          <div
            className={`text-white text-xs px-2 py-1 rounded-md shadow-lg font-medium border ${
              measurement.type === 'room' 
                ? 'bg-blue-600 border-blue-700' 
                : 'bg-orange-600 border-orange-700'
            }`}
            style={{
              left: measurement.x - 35,
              top: measurement.y - 12,
              minWidth: '70px',
              textAlign: 'center',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              zIndex: 50
            }}
          >
            {formatMeasurementValue(measurement.distance)}
            <div
              className={`absolute w-px h-4 ${
                measurement.type === 'room' ? 'bg-blue-400' : 'bg-orange-400'
              }`}
              style={{
                left: '50%',
                top: measurement.type === 'room' ? '100%' : '-16px',
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntelligentMeasurementOverlay;
