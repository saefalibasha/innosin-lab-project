
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedDashboardStats } from './enhanced-dashboard/EnhancedDashboardStats';
import { ProductSeriesManager } from './product-series/ProductSeriesManager';
import { EnhancedAssetManager } from './enhanced-asset-manager/EnhancedAssetManager';
import { AdminProductEditor } from './AdminProductEditor';
import { BarChart3, Package, Database, Upload, Settings, TrendingUp } from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Dashboard statistics and insights"
    },
    {
      id: "series",
      label: "Product Series",
      icon: Package,
      description: "Manage product series and variants"
    },
    {
      id: "assets",
      label: "Asset Manager",
      icon: Upload,
      description: "Upload and manage product assets"
    },
    {
      id: "products",
      label: "Product Editor",
      icon: Database,
      description: "Advanced product management"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "System configuration"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive management system for products and assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Auto-refreshing every 30s</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EnhancedDashboardStats />
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveTab("series")}>
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Add Series</h3>
                      <p className="text-sm text-muted-foreground">Create new product series</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveTab("assets")}>
                  <div className="flex items-center gap-3">
                    <Upload className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Upload Assets</h3>
                      <p className="text-sm text-muted-foreground">Manage product assets</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveTab("products")}>
                  <div className="flex items-center gap-3">
                    <Database className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Edit Products</h3>
                      <p className="text-sm text-muted-foreground">Advanced product editing</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveTab("settings")}>
                  <div className="flex items-center gap-3">
                    <Settings className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-semibold">Settings</h3>
                      <p className="text-sm text-muted-foreground">System configuration</p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="series">
          <ProductSeriesManager />
        </TabsContent>

        <TabsContent value="assets">
          <EnhancedAssetManager />
        </TabsContent>

        <TabsContent value="products">
          <AdminProductEditor />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                System configuration options will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
