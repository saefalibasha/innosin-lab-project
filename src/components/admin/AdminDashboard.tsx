
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Package, 
  Settings,
  Activity,
  Gauge
} from 'lucide-react';
import { DynamicOverview } from './DynamicOverview';
import { EnhancedProductSeriesManager } from './EnhancedProductSeriesManager';
import { SystemSettings } from './SystemSettings';
import { PerformanceMonitoringDashboard } from './PerformanceMonitoringDashboard';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your INNOSIN Lab product catalog, system settings, and performance monitoring
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="w-4 h-4 mr-1" />
          System Online
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Product Series
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DynamicOverview />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMonitoringDashboard />
        </TabsContent>

        <TabsContent value="products">
          <EnhancedProductSeriesManager />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
