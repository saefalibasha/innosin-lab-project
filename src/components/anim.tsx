import React, { ReactNode } from 'react';

interface MotionProviderProps {
  children: ReactNode;
}

export const MotionProvider = ({ children }: MotionProviderProps) => {
  return <>{children}</>;
};

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const Reveal = ({ children, delay = 0, className = '' }: RevealProps) => {
  return (
    <div 
      className={`animate-fade-in ${className}`}
      style={{ 
        animationDelay: `${delay}s`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
};

interface ParallaxSectionProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export const ParallaxSection = ({ children, offset = 50, className = '' }: ParallaxSectionProps) => {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
};

interface StaggerListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerList = <T,>({ 
  items, 
  renderItem, 
  staggerDelay = 0.1,
  className = ''
}: StaggerListProps<T>) => {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{ 
            animationDelay: `${index * staggerDelay}s`,
            animationFillMode: 'both'
          }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};