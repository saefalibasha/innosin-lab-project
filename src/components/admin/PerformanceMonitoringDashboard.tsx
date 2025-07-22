
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  Gauge, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Zap,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { UserSessionData, PerformanceMetrics } from '@/hooks/usePerformanceMonitoring';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const PerformanceMonitoringDashboard = () => {
  const [performanceData, setPerformanceData] = useState<UserSessionData[]>([]);
  const [componentPerformance, setComponentPerformance] = useState<Record<string, any[]>>({});
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);

  useEffect(() => {
    const loadPerformanceData = () => {
      const data = JSON.parse(localStorage.getItem('performanceData') || '[]');
      const componentData = JSON.parse(localStorage.getItem('componentPerformance') || '{}');
      setPerformanceData(data);
      setComponentPerformance(componentData);
    };

    loadPerformanceData();
    
    if (isRealTimeMode) {
      const interval = setInterval(loadPerformanceData, 5000);
      return () => clearInterval(interval);
    }
  }, [isRealTimeMode]);

  // Calculate performance metrics
  const calculateAverageMetrics = (): PerformanceMetrics => {
    if (performanceData.length === 0) {
      return {
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
        bundleSize: 0,
        componentRenderTimes: {}
      };
    }

    const totals = performanceData.reduce((acc, session) => {
      acc.loadTime += session.metrics.loadTime;
      acc.firstContentfulPaint += session.metrics.firstContentfulPaint;
      acc.largestContentfulPaint += session.metrics.largestContentfulPaint;
      acc.firstInputDelay += session.metrics.firstInputDelay;
      acc.cumulativeLayoutShift += session.metrics.cumulativeLayoutShift;
      acc.timeToInteractive += session.metrics.timeToInteractive;
      return acc;
    }, {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0
    });

    const count = performanceData.length;
    return {
      loadTime: totals.loadTime / count,
      firstContentfulPaint: totals.firstContentfulPaint / count,
      largestContentfulPaint: totals.largestContentfulPaint / count,
      firstInputDelay: totals.firstInputDelay / count,
      cumulativeLayoutShift: totals.cumulativeLayoutShift / count,
      timeToInteractive: totals.timeToInteractive / count,
      bundleSize: 0,
      componentRenderTimes: {}
    };
  };

  const averageMetrics = calculateAverageMetrics();

  // Get Core Web Vitals scores
  const getWebVitalScore = (metric: 'lcp' | 'fid' | 'cls', value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };
    
    const threshold = thresholds[metric];
    if (value <= threshold.good) return { score: 'Good', color: 'bg-green-500' };
    if (value <= threshold.poor) return { score: 'Needs Improvement', color: 'bg-yellow-500' };
    return { score: 'Poor', color: 'bg-red-500' };
  };

  // Device breakdown
  const deviceBreakdown = performanceData.reduce((acc, session) => {
    acc[session.device] = (acc[session.device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Performance over time data
  const performanceOverTime = performanceData
    .slice(-20)
    .map((session, index) => ({
      session: index + 1,
      loadTime: Math.round(session.metrics.loadTime),
      lcp: Math.round(session.metrics.largestContentfulPaint),
      fcp: Math.round(session.metrics.firstContentfulPaint)
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time website performance analytics and optimization insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isRealTimeMode ? "default" : "outline"}
            onClick={() => setIsRealTimeMode(!isRealTimeMode)}
          >
            <Activity className="w-4 h-4 mr-2" />
            {isRealTimeMode ? 'Live Monitoring' : 'Start Live Mode'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="core-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="components">Component Performance</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(averageMetrics.loadTime / 1000).toFixed(2)}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt;3s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions Tracked</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Last 100 sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {averageMetrics.loadTime < 3000 ? '85' : averageMetrics.loadTime < 5000 ? '65' : '45'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lighthouse equivalent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues Detected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {averageMetrics.loadTime > 5000 ? '3' : averageMetrics.loadTime > 3000 ? '1' : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Performance issues
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="session" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="loadTime" stroke="#8884d8" name="Load Time (ms)" />
                    <Line type="monotone" dataKey="lcp" stroke="#82ca9d" name="LCP (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(deviceBreakdown).map(([device, count]) => {
                    const Icon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor;
                    const percentage = ((count / performanceData.length) * 100).toFixed(1);
                    
                    return (
                      <div key={device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="capitalize">{device}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{count} sessions</span>
                          <Badge variant="outline">{percentage}%</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="core-vitals">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Largest Contentful Paint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {(averageMetrics.largestContentfulPaint / 1000).toFixed(2)}s
                </div>
                <Badge className={getWebVitalScore('lcp', averageMetrics.largestContentfulPaint).color}>
                  {getWebVitalScore('lcp', averageMetrics.largestContentfulPaint).score}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Measures loading performance. Good: &lt;2.5s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  First Input Delay
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {averageMetrics.firstInputDelay.toFixed(0)}ms
                </div>
                <Badge className={getWebVitalScore('fid', averageMetrics.firstInputDelay).color}>
                  {getWebVitalScore('fid', averageMetrics.firstInputDelay).score}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Measures interactivity. Good: &lt;100ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Cumulative Layout Shift
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {averageMetrics.cumulativeLayoutShift.toFixed(3)}
                </div>
                <Badge className={getWebVitalScore('cls', averageMetrics.cumulativeLayoutShift).color}>
                  {getWebVitalScore('cls', averageMetrics.cumulativeLayoutShift).score}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Measures visual stability. Good: &lt;0.1
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>Component Render Times</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(componentPerformance).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(componentPerformance).map(([component, renders]) => {
                    const avgRenderTime = renders.reduce((sum: number, render: any) => sum + render.renderTime, 0) / renders.length;
                    
                    return (
                      <div key={component} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{component}</p>
                          <p className="text-sm text-muted-foreground">{renders.length} renders tracked</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{avgRenderTime.toFixed(2)}ms</p>
                          <p className="text-sm text-muted-foreground">avg render time</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No component performance data available yet. Performance logging will start automatically.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {averageMetrics.loadTime > 5000 && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800">Critical: Slow Load Times</h4>
                        <p className="text-sm text-red-700">
                          Average load time is {(averageMetrics.loadTime / 1000).toFixed(2)}s. Consider optimizing images, enabling compression, and implementing lazy loading.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {averageMetrics.largestContentfulPaint > 2500 && (
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Improve LCP</h4>
                        <p className="text-sm text-yellow-700">
                          Largest Contentful Paint is slow. Optimize hero images and ensure critical resources load quickly.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {averageMetrics.cumulativeLayoutShift > 0.1 && (
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800">Layout Stability Issues</h4>
                        <p className="text-sm text-orange-700">
                          High Cumulative Layout Shift detected. Ensure images have defined dimensions and avoid dynamic content insertion.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {averageMetrics.loadTime <= 3000 && (
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <Zap className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800">Great Performance!</h4>
                        <p className="text-sm text-green-700">
                          Your website is performing well. Keep monitoring to maintain these good metrics.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
