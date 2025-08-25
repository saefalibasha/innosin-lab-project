
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

      // Fetch total products
      const { count: totalProducts, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) throw productsError;

      // Fetch active series (series parents)
      const { count: activeSeries, error: seriesError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_series_parent', true)
        .eq('is_active', true);

      if (seriesError) throw seriesError;

      // Fetch total variants (non-series parents)
      const { count: totalVariants, error: variantsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_series_parent', false)
        .eq('is_active', true);

      if (variantsError) throw variantsError;

      // Fetch products with assets and validate them with real accessibility checks
      const { data: productsWithAssets, error: assetsError } = await supabase
        .from('products')
        .select('id, thumbnail_path, model_path, series_thumbnail_path, series_model_path, is_series_parent')
        .eq('is_active', true);

      if (assetsError) throw assetsError;

      // Validate actual asset accessibility (not just database paths)
      let workingAssetsCount = 0;
      let totalAssetsWithBoth = 0;

      if (productsWithAssets) {
        for (const product of productsWithAssets) {
          const imagePath = product.thumbnail_path || product.series_thumbnail_path;
          const modelPath = product.model_path || product.series_model_path;
          
          if (imagePath || modelPath) {
            const { imageValid, modelValid } = await validateAssetAccessibility(imagePath, modelPath);
            
            if (imageValid || modelValid) {
              workingAssetsCount++;
            }
            
            if (imageValid && modelValid) {
              totalAssetsWithBoth++;
            }
          }
        }
      }

      const assetsUploaded = workingAssetsCount;

      // Calculate completion rate based on assets and variants
      const { data: seriesData, error: seriesCompletionError } = await supabase
        .from('products')
        .select('target_variant_count, id')
        .eq('is_series_parent', true)
        .eq('is_active', true);

      if (seriesCompletionError) throw seriesCompletionError;

      // Calculate asset completion rate based on actual working assets
      const totalActiveProducts = productsWithAssets?.length || 1;
      const assetCompletionRate = Math.round((totalAssetsWithBoth / totalActiveProducts) * 100);
      
      // Variant completion rate vs target
      const totalTargetVariants = seriesData?.reduce((sum, series) => 
        sum + (series.target_variant_count || 4), 0) || 0;
      
      const variantCompletionRate = totalTargetVariants > 0 ? 
        Math.min((totalVariants || 0) / totalTargetVariants * 100, 100) : 0;

      // Combined completion rate (weighted average)
      const completionRate = Math.round((assetCompletionRate * 0.6) + (variantCompletionRate * 0.4));

      // Get recent activity (products updated in last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: recentActivity, error: activityError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', yesterday.toISOString());

      if (activityError) throw activityError;

      setStats({
        totalProducts: totalProducts || 0,
        activeSeries: activeSeries || 0,
        totalVariants: totalVariants || 0,
        assetsUploaded,
        recentActivity: recentActivity || 0,
        completionRate: Math.round(completionRate),
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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
