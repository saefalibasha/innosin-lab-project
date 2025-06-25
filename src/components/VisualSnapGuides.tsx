
import React from 'react';
import { SnapGuide } from '@/utils/enhancedObjectSnapping';

interface VisualSnapGuidesProps {
  guides: SnapGuide[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const VisualSnapGuides: React.FC<VisualSnapGuidesProps> = ({ guides, canvasRef }) => {
  if (!canvasRef.current || guides.length === 0) return null;

  const canvasRect = canvasRef.current.getBoundingClientRect();

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        style={{ zIndex: 1000 }}
      >
        {guides.map((guide, index) => (
          <line
            key={index}
            x1={guide.start.x}
            y1={guide.start.y}
            x2={guide.end.x}
            y2={guide.end.y}
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.8"
          />
        ))}
      </svg>
    </div>
  );
};

export default VisualSnapGuides;
