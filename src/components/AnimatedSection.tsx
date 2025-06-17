import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: 'fade-in' | 'fade-in-left' | 'fade-in-right' | 'scale-in' | 'slide-up' | 'slide-in-bottom' | 'bounce-in' | 'rotate-in' | 'slide-in-left' | 'slide-in-right';
  delay?: number;
  duration?: string;
  className?: string;
  threshold?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = '0.8s',
  className,
  threshold = 0.1
}) => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold,
    delay,
    triggerOnce: true
  });

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all ease-out',
        isVisible ? `animate-${animation}` : 'opacity-0',
        className
      )}
      style={{
        animationDuration: duration,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
