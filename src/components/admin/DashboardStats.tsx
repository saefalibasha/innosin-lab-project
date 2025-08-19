import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Database, Users, BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProductRealtime } from '@/hooks/useProductRealtime';

interface DashboardStatistics {
  totalProducts: number;
  activeSeries: number;
  categories: number;
  adminUsers: number;
}

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics>({
    totalProducts: 0,
    activeSeries: 0,
    categories: 0,
    adminUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch total active products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      // Fetch unique active series count
      const { data: seriesData } = await supabase
        .from('products')
        .select('product_series')
        .eq('is_active', true)
        .eq('is_series_parent', true);

      // Fetch unique categories
      const { data: categoryData } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);

      // Fetch admin users count
      const { count: adminUsers } = await supabase
        .from('admin_roles')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      const uniqueCategories = new Set(categoryData?.map(item => item.category).filter(Boolean));
      const uniqueSeries = new Set(seriesData?.map(item => item.product_series).filter(Boolean));

      setStats({
        totalProducts: totalProducts || 0,
        activeSeries: uniqueSeries.size,
        categories: uniqueCategories.size,
        adminUsers: adminUsers || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Set up real-time updates
  useProductRealtime({
    onProductChange: fetchStatistics,
    onSeriesChange: fetchStatistics,
    enabled: true
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Fetching data...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            Active product variants
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Series</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSeries}</div>
          <p className="text-xs text-muted-foreground">
            Product series available
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.categories}</div>
          <p className="text-xs text-muted-foreground">
            Product categories
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.adminUsers}</div>
          <p className="text-xs text-muted-foreground">
            Active admin accounts
          </p>
        </CardContent>
      </Card>
    </div>
  );
};