
import React from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { ProductSeriesManager } from '@/components/admin/product-series/ProductSeriesManager';
import { DataSeeder } from '@/components/admin/DataSeeder';
import { DashboardStats } from '@/components/admin/DashboardStats';

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

        {/* Product Series Manager */}
        <ProductSeriesManager />
      </div>
    </AdminAuthGuard>
  );
};

export default Dashboard;
