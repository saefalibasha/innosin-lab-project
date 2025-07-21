
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProducts: number;
  activeSeries: number;
  totalVariants: number;
  assetsUploaded: number;
  recentActivity: number;
  completionRate: number;
  lastUpdated: Date;
}

export const useEnhancedDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeSeries: 0,
    totalVariants: 0,
    assetsUploaded: 0,
    recentActivity: 0,
    completionRate: 0,
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch active series
      const { count: activeSeries } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_series_parent', true)
        .eq('is_active', true);

      // Fetch total variants
      const { count: totalVariants } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_series_parent', false)
        .eq('is_active', true);

      // Fetch assets uploaded count
      const { count: assetsUploaded } = await supabase
        .from('asset_uploads')
        .select('*', { count: 'exact', head: true })
        .eq('upload_status', 'completed');

      // Fetch recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentActivity } = await supabase
        .from('product_activity_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Calculate completion rate (products with both thumbnail and model)
      const { data: productsWithAssets } = await supabase
        .from('products')
        .select('thumbnail_path, model_path')
        .eq('is_active', true)
        .eq('is_series_parent', false);

      const completedProducts = productsWithAssets?.filter(p => 
        p.thumbnail_path && p.model_path
      ).length || 0;

      const completionRate = totalVariants ? (completedProducts / totalVariants) * 100 : 0;

      setStats({
        totalProducts: totalProducts || 0,
        activeSeries: activeSeries || 0,
        totalVariants: totalVariants || 0,
        assetsUploaded: assetsUploaded || 0,
        recentActivity: recentActivity || 0,
        completionRate: Math.round(completionRate),
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
