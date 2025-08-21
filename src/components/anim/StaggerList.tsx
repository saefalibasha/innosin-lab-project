import { ReactNode } from 'react';
import { Reveal } from './Reveal';

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
        <Reveal key={index} delay={index * staggerDelay}>
          {renderItem(item, index)}
        </Reveal>
      ))}
    </div>
  );
};