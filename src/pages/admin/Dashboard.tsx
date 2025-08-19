
import React from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { ProductSeriesManager } from '@/components/admin/product-series/ProductSeriesManager';
import { DataSeeder } from '@/components/admin/DataSeeder';
import { DashboardStats } from '@/components/admin/DashboardStats';
import ContentManagement from '@/components/admin/ContentManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, FileText } from 'lucide-react';

const Dashboard = () => {
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
        </div>

        {/* Stats Overview */}
        <DashboardStats />

        {/* Data Seeder */}
        <DataSeeder />

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product Management
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductSeriesManager />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthGuard>
  );
};

export default Dashboard;
