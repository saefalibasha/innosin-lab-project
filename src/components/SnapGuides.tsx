
import React from 'react';
import { Point } from '@/types/floorPlanTypes';
import { SnapGuide } from '@/utils/objectSnapping';

interface SnapGuidesProps {
  guides: SnapGuide[];
  canvas: HTMLCanvasElement | null;
  zoom: number;
  pan: Point;
}

const SnapGuides: React.FC<SnapGuidesProps> = ({ guides, canvas, zoom, pan }) => {
  if (!canvas || guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {guides.map((guide, index) => (
        <div
          key={index}
          className="absolute border-dashed border-blue-400"
          style={{
            left: guide.position.x * zoom + pan.x,
            top: guide.position.y * zoom + pan.y,
            width: guide.direction === 'horizontal' ? '100%' : '1px',
            height: guide.direction === 'vertical' ? '100%' : '1px',
            borderWidth: '1px',
            borderColor: guide.color
          }}
        />
      ))}
    </div>
  );
};

export default SnapGuides;
