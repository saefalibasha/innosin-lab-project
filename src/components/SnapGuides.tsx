
import React from 'react';
import { SnapGuide } from '@/utils/objectSnapping';

interface SnapGuidesProps {
  guides: SnapGuide[];
  canvasRect?: DOMRect;
}

const SnapGuides: React.FC<SnapGuidesProps> = ({ guides, canvasRect }) => {
  if (!guides.length || !canvasRect) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {guides.map((guide, index) => (
        <div
          key={index}
          className="absolute border-dashed border-blue-400"
          style={{
            ...(guide.type === 'vertical' ? {
              left: guide.position + canvasRect.left,
              top: 0,
              width: '1px',
              height: '100%',
              borderLeftWidth: '1px',
            } : {
              left: 0,
              top: guide.position + canvasRect.top,
              width: '100%',
              height: '1px',
              borderTopWidth: '1px',
            })
          }}
        />
      ))}
    </div>
  );
};

export default SnapGuides;
