
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  mountTime: number;
  renderCount: number;
  lastRenderTime: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): void {
    performance.mark(`${name}-start`);
  }

  endTimer(name: string): number {
    const endMark = `${name}-end`;
    performance.mark(endMark);
    
    try {
      performance.measure(name, `${name}-start`, endMark);
      const measure = performance.getEntriesByName(name)[0] as PerformanceEntry;
      const duration = measure.duration;
      
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
      return 0;
    }
  }

  recordMetric(componentName: string): void {
    const now = performance.now();
    const existing = this.metrics.get(componentName);
    
    if (existing) {
      existing.renderCount++;
      existing.lastRenderTime = now;
    } else {
      this.metrics.set(componentName, {
        componentName,
        mountTime: now,
        renderCount: 1,
        lastRenderTime: now
      });
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  logMetrics(): void {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return;

    console.group('📊 Performance Metrics');
    metrics.forEach(metric => {
      console.log(`${metric.componentName}:`, {
        'Mount Time': `${metric.mountTime.toFixed(2)}ms`,
        'Render Count': metric.renderCount,
        'Last Render': `${metric.lastRenderTime.toFixed(2)}ms ago`
      });
    });
    console.groupEnd();
  }

  clearMetrics(): void {
    this.metrics.clear();
    console.log('🧹 Performance metrics cleared');
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    performanceMonitor.recordMetric(componentName);
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const lifetime = endTime - mountTime.current;
      console.log(`🔄 ${componentName} unmounted after ${lifetime.toFixed(2)}ms`);
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    startTimer: (name: string) => performanceMonitor.startTimer(`${componentName}-${name}`),
    endTimer: (name: string) => performanceMonitor.endTimer(`${componentName}-${name}`),
  };
};

export default usePerformanceMonitor;
