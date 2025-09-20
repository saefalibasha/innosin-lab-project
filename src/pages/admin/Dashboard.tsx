import React, { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminAuthStatus from '@/components/admin/AdminAuthStatus';
import { ProductSeriesManager } from '@/components/admin/product-series/ProductSeriesManager';

import { EnhancedDashboardStats } from '@/components/admin/enhanced-dashboard/EnhancedDashboardStats';
import ContentManagement from '@/components/admin/ContentManagement';
import ChatHistory from '@/components/ChatHistory';
import HubSpotIntegrationTest from '@/components/HubSpotIntegrationTest';
import HubSpotMonitor from '@/pages/admin/HubSpotMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  FileText, 
  BarChart3, 
  MessageSquare,
  RefreshCw,
  MonitorSpeaker,
  TestTube
} from 'lucide-react';
import { useEnhancedDashboardStats } from '@/hooks/useEnhancedDashboardStats';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { stats, loading, error, refetch } = useEnhancedDashboardStats();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [location.search]);
  const handleRefresh = () => {
    refetch();
  };

  return (
    <AdminAuthGuard>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your product catalog and system settings
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <AdminAuthStatus />
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product Management
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content Management
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat History
            </TabsTrigger>
            <TabsTrigger value="hubspot-test" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              HubSpot Tests
            </TabsTrigger>
            <TabsTrigger value="hubspot-monitor" className="flex items-center gap-2">
              <MonitorSpeaker className="w-4 h-4" />
              HubSpot Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EnhancedDashboardStats />
          </TabsContent>

          <TabsContent value="products">
            <ProductSeriesManager />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="chat">
            <ChatHistory />
          </TabsContent>

          <TabsContent value="hubspot-test">
            <HubSpotIntegrationTest />
          </TabsContent>

          <TabsContent value="hubspot-monitor">
            <HubSpotMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthGuard>
  );
};

export default Dashboard;
