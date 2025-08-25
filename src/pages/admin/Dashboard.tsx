
import React, { useState } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { ProductSeriesManager } from '@/components/admin/product-series/ProductSeriesManager';
import { DataSeeder } from '@/components/admin/DataSeeder';
import { EnhancedDashboardStats } from '@/components/admin/enhanced-dashboard/EnhancedDashboardStats';
import ContentManagement from '@/components/admin/ContentManagement';
import ChatHistory from '@/components/ChatHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  FileText, 
  BarChart3, 
  MessageSquare,
  Users,
  Settings,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useEnhancedDashboardStats } from '@/hooks/useEnhancedDashboardStats';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { stats, loading, error, refetch } = useEnhancedDashboardStats();

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
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Stats Overview */}
            <EnhancedDashboardStats />

            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">Healthy</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Asset Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? '...' : `${stats.completionRate}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">Assets completion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stats.recentActivity}
                  </div>
                  <p className="text-xs text-muted-foreground">Updates in last 24h</p>
                </CardContent>
              </Card>
            </div>

            {/* Data Seeder */}
            <DataSeeder />
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
        </Tabs>
      </div>
    </AdminAuthGuard>
  );
};

export default Dashboard;
