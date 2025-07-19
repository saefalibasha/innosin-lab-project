
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  database: 'good' | 'warning' | 'error';
  storage: 'good' | 'warning' | 'error';
  overall: 'good' | 'warning' | 'error';
}

export const SystemHealthCard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>({
    database: 'good',
    storage: 'good',
    overall: 'good',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        // Test database connection
        const { error: dbError } = await supabase
          .from('products')
          .select('id')
          .limit(1);

        // Test storage connection
        const { error: storageError } = await supabase.storage
          .from('documents')
          .list('', { limit: 1 });

        const dbStatus: SystemHealth['database'] = dbError ? 'error' : 'good';
        const storageStatus: SystemHealth['storage'] = storageError ? 'warning' : 'good';
        
        let overallStatus: SystemHealth['overall'] = 'good';
        if (dbStatus === 'error' || storageStatus === 'error') {
          overallStatus = 'error';
        } else if (dbStatus === 'warning' || storageStatus === 'warning') {
          overallStatus = 'warning';
        }

        setHealth({
          database: dbStatus,
          storage: storageStatus,
          overall: overallStatus,
        });
      } catch (error) {
        console.error('Error checking system health:', error);
        setHealth({
          database: 'error',
          storage: 'error',
          overall: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Health</CardTitle>
        {getStatusIcon(health.overall)}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {getStatusBadge(health.overall)}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Database</span>
            <div className="flex items-center space-x-1">
              {getStatusIcon(health.database)}
              <span className={health.database === 'good' ? 'text-green-600' : 
                              health.database === 'warning' ? 'text-yellow-600' : 'text-red-600'}>
                {health.database === 'good' ? 'Connected' : 
                 health.database === 'warning' ? 'Warning' : 'Error'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Storage</span>
            <div className="flex items-center space-x-1">
              {getStatusIcon(health.storage)}
              <span className={health.storage === 'good' ? 'text-green-600' : 
                              health.storage === 'warning' ? 'text-yellow-600' : 'text-red-600'}>
                {health.storage === 'good' ? 'Connected' : 
                 health.storage === 'warning' ? 'Warning' : 'Error'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
