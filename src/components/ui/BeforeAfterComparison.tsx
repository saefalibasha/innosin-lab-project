
import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';

interface BeforeAfterComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  className = ""
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <Card className={`relative overflow-hidden cursor-col-resize ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      >
        {/* Before Image */}
        <div className="absolute inset-0">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
            {beforeLabel}
          </div>
        </div>

        {/* After Image */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
            {afterLabel}
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-10"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-gray-400 rounded"></div>
              <div className="w-1 h-4 bg-gray-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BeforeAfterComparison;
