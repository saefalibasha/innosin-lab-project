
import { useEffect } from 'react';

export const usePerformanceLogger = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    console.time(`${componentName} render`);
    
    return () => {
      const endTime = performance.now();
      console.timeEnd(`${componentName} render`);
      console.log(`${componentName} took ${endTime - startTime} milliseconds`);
    };
  }, [componentName]);
};

export const logPerformance = (label: string, fn: () => void) => {
  const start = performance.now();
  console.time(label);
  fn();
  const end = performance.now();
  console.timeEnd(label);
  console.log(`${label} execution time: ${end - start}ms`);
};
