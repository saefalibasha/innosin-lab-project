
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Database, Zap, Globe } from 'lucide-react';

type HealthStatus = 'good' | 'warning' | 'error';

interface HealthMetric {
  name: string;
  status: HealthStatus;
  value: string;
  icon: React.ComponentType<any>;
}

export const SystemHealthCard: React.FC = () => {
  const healthMetrics: HealthMetric[] = [
    {
      name: 'Database',
      status: 'good',
      value: 'Connected',
      icon: Database
    },
    {
      name: 'HubSpot API',
      status: 'warning',
      value: 'Rate Limited',
      icon: Globe
    },
    {
      name: 'System Load',
      status: 'good',
      value: '12%',
      icon: Zap
    }
  ];

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const overallStatus: HealthStatus = healthMetrics.some(m => m.status === 'error') 
    ? 'error' 
    : healthMetrics.some(m => m.status === 'warning') 
    ? 'warning' 
    : 'good';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">System Health</CardTitle>
          {getStatusBadge(overallStatus)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthMetrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div key={metric.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{metric.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{metric.value}</span>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
