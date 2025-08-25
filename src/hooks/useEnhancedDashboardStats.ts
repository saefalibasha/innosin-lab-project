
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateAssetAccessibility } from '@/utils/assetValidator';

interface EnhancedDashboardStats {
  totalProducts: number;
  activeSeries: number;
  totalVariants: number;
  assetsUploaded: number;
  recentActivity: number;
  completionRate: number;
  lastUpdated: Date;
}

export const useEnhancedDashboardStats = () => {
  const [stats, setStats] = useState<EnhancedDashboardStats>({
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
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic stats first for fast dashboard loading
      const [
        { count: totalProducts, error: productsError },
        { count: activeSeries, error: seriesError },
        { count: totalVariants, error: variantsError },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true })
          .eq('is_series_parent', true).eq('is_active', true),
        supabase.from('products').select('*', { count: 'exact', head: true })
          .eq('is_series_parent', false).eq('is_active', true)
      ]);

      if (productsError || seriesError || variantsError) {
        throw productsError || seriesError || variantsError;
      }

      // Get recent activity
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { count: recentActivity } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', yesterday.toISOString());

      // Use simple completion rate based on database data (not real asset validation)
      const { data: productsWithAssets } = await supabase
        .from('products')
        .select('thumbnail_path, model_path, series_thumbnail_path, series_model_path')
        .eq('is_active', true);

      // Count products that have both image and model paths in database
      const assetsUploaded = productsWithAssets?.filter(product => {
        const hasImage = product.thumbnail_path || product.series_thumbnail_path;
        const hasModel = product.model_path || product.series_model_path;
        return hasImage && hasModel;
      }).length || 0;

      // Calculate simple completion rate
      const totalActiveProducts = productsWithAssets?.length || 1;
      const completionRate = Math.round((assetsUploaded / totalActiveProducts) * 100);

      setStats({
        totalProducts: totalProducts || 0,
        activeSeries: activeSeries || 0,
        totalVariants: totalVariants || 0,
        assetsUploaded,
        recentActivity: recentActivity || 0,
        completionRate,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to fetch dashboard statistics');
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 5 minutes instead of 30 seconds
    const interval = setInterval(fetchStats, 300000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
