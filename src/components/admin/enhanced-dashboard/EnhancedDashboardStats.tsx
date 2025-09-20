
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Package, Layers, Upload, Activity, Target, MessageSquare, Database, ExternalLink, FileText, Award } from 'lucide-react';
import { useEnhancedDashboardStats } from '@/hooks/useEnhancedDashboardStats';

export const EnhancedDashboardStats = () => {
  const { stats, loading, error, refetch } = useEnhancedDashboardStats();

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Error loading dashboard statistics</p>
            <Button onClick={refetch} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const coreMetrics = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All active products'
    },
    {
      title: 'Active Series',
      value: stats.activeSeries,
      icon: Layers,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Product series'
    },
    {
      title: 'Asset Quality',
      value: `${stats.assetQualityScore}%`,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Complete assets'
    },
    {
      title: 'Chat Engagement',
      value: stats.chatEngagement,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Last 7 days'
    }
  ];

  const systemMetrics = [
    {
      title: 'Database Health',
      value: stats.databaseHealth,
      icon: Database,
      color: stats.databaseHealth === 'healthy' ? 'text-green-600' : 
             stats.databaseHealth === 'warning' ? 'text-yellow-600' : 'text-red-600',
      bgColor: stats.databaseHealth === 'healthy' ? 'bg-green-50' : 
               stats.databaseHealth === 'warning' ? 'bg-yellow-50' : 'bg-red-50',
      description: 'System status'
    },
    {
      title: 'Content Coverage',
      value: `${stats.contentCoverage}%`,
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Complete descriptions'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {stats.lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Core Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coreMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    metric.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    typeof metric.value === 'string' ? 
                      metric.value.charAt(0).toUpperCase() + metric.value.slice(1) : 
                      metric.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
