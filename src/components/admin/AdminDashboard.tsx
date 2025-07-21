
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Package, 
  Users, 
  MessageSquare, 
  BookOpen, 
  Settings,
  TrendingUp,
  Activity,
  Database,
  Shield
} from 'lucide-react';
import { ProductSeriesManager } from './product-series/ProductSeriesManager';
import { ProductSeriesManager as ProductEditor } from './ProductSeriesManager';
import { SystemSettings } from './SystemSettings';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Total Products',
      value: '24',
      change: '+2 this month',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Product Series',
      value: '9',
      change: 'Standardized',
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: '12',
      change: '+3 this week',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Chat Sessions',
      value: '156',
      change: '+23 today',
      icon: MessageSquare,
      color: 'text-orange-600'
    }
  ];

  const recentActivity = [
    { action: 'Product series standardized', time: '2 hours ago', type: 'system' },
    { action: 'New product variant added', time: '4 hours ago', type: 'product' },
    { action: 'User permissions updated', time: '1 day ago', type: 'user' },
    { action: 'Database cleanup completed', time: '1 day ago', type: 'system' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your INNOSIN product catalog and system settings
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
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Product Series
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Product Editor
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="default">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Product Series</span>
                  <Badge variant="default">9 Standardized</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Asset Storage</span>
                  <Badge variant="default">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Authentication</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{activity.action}</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('products')}
                  className="flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Manage Products
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('editor')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Product Editor
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <ProductSeriesManager />
        </TabsContent>

        <TabsContent value="editor">
          <ProductEditor />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
