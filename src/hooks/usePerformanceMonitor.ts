
import { useEffect, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const metricsRef = useRef<PerformanceMetric[]>([]);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    startTimeRef.current = performance.now();
    console.log(`🚀 ${componentName} - Started loading`);

    return () => {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        console.log(`✅ ${componentName} - Finished loading in ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  const trackMetric = (name: string) => {
    const startTime = performance.now();
    metricsRef.current.push({ name, startTime });
    
    return () => {
      const metric = metricsRef.current.find(m => m.name === name && !m.endTime);
      if (metric) {
        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;
        console.log(`📊 ${componentName} - ${name}: ${metric.duration.toFixed(2)}ms`);
      }
    };
  };

  return { trackMetric };
};
