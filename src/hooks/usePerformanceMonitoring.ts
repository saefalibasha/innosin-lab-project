import { useEffect, useState } from 'react';

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  bundleSize: number;
  componentRenderTimes: Record<string, number>;
}

export interface UserSessionData {
  sessionId: string;
  userAgent: string;
  connectionType: string;
  device: 'mobile' | 'desktop' | 'tablet';
  location: string;
  timestamp: number;
  metrics: PerformanceMetrics;
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // Get LCP using PerformanceObserver
      let lcp = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        lcp = lastEntry?.startTime || 0;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Get FID using PerformanceObserver
      let fid = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          fid = (entry as any).processingStart - entry.startTime;
        }
      }).observe({ entryTypes: ['first-input'] });

      // Get CLS using PerformanceObserver
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      const performanceMetrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        firstInputDelay: fid,
        cumulativeLayoutShift: cls,
        timeToInteractive: navigation.domInteractive - navigation.fetchStart,
        bundleSize: 0, // This would need to be calculated separately
        componentRenderTimes: {}
      };

      setMetrics(performanceMetrics);
      
      // Store metrics in localStorage for admin dashboard
      const sessionData: UserSessionData = {
        sessionId: crypto.randomUUID(),
        userAgent: navigator.userAgent,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        location: 'unknown', // Would need geolocation API
        timestamp: Date.now(),
        metrics: performanceMetrics
      };

      const existingData = JSON.parse(localStorage.getItem('performanceData') || '[]');
      existingData.push(sessionData);
      // Keep only last 100 sessions
      const recentData = existingData.slice(-100);
      localStorage.setItem('performanceData', JSON.stringify(recentData));
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectMetrics, 1000);
      });
    }
  }, [isMonitoring]);

  return {
    metrics,
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring: () => setIsMonitoring(false),
    isMonitoring
  };
};

export const logComponentPerformance = (componentName: string, renderTime: number) => {
  const performanceLog = JSON.parse(localStorage.getItem('componentPerformance') || '{}');
  performanceLog[componentName] = performanceLog[componentName] || [];
  performanceLog[componentName].push({
    renderTime,
    timestamp: Date.now()
  });
  
  // Keep only last 50 renders per component
  performanceLog[componentName] = performanceLog[componentName].slice(-50);
  localStorage.setItem('componentPerformance', JSON.stringify(performanceLog));
};
