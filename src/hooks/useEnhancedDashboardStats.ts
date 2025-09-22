
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isPlaceholderAsset } from '@/utils/assetValidator';

interface EnhancedDashboardStats {
  totalProducts: number;
  activeSeries: number;
  totalVariants: number;
  assetsUploaded: number;
  recentActivity: number;
  completionRate: number;
  chatEngagement: number;
  hubspotHealth: 'healthy' | 'warning' | 'error';
  databaseHealth: 'healthy' | 'warning' | 'error';
  contentCoverage: number;
  assetQualityScore: number;
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
    chatEngagement: 0,
    hubspotHealth: 'healthy',
    databaseHealth: 'healthy',
    contentCoverage: 0,
    assetQualityScore: 0,
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

      // Fetch products with assets and validate them
      const { data: productsWithAssets, error: assetsError } = await supabase
        .from('products')
        .select('thumbnail_path, model_path, series_thumbnail_path, series_model_path, is_series_parent')
        .eq('is_active', true);

      if (assetsError) throw assetsError;

      // Count only real (non-placeholder) assets
      const assetsUploaded = productsWithAssets?.filter(p => {
        const hasRealImage = (p.thumbnail_path && !isPlaceholderAsset(p.thumbnail_path)) || 
                            (p.series_thumbnail_path && !isPlaceholderAsset(p.series_thumbnail_path));
        const hasRealModel = (p.model_path && !isPlaceholderAsset(p.model_path)) || 
                            (p.series_model_path && !isPlaceholderAsset(p.series_model_path));
        return hasRealImage || hasRealModel;
      }).length || 0;

      // Calculate completion rate based on assets and variants
      const { data: seriesData, error: seriesCompletionError } = await supabase
        .from('products')
        .select('target_variant_count, id')
        .eq('is_series_parent', true)
        .eq('is_active', true);

      if (seriesCompletionError) throw seriesCompletionError;

      // Calculate asset completion rate: products with both real image and model assets
      const productsWithBothAssets = productsWithAssets?.filter(p => {
        const hasRealImage = (p.thumbnail_path && !isPlaceholderAsset(p.thumbnail_path)) || 
                            (p.series_thumbnail_path && !isPlaceholderAsset(p.series_thumbnail_path));
        const hasRealModel = (p.model_path && !isPlaceholderAsset(p.model_path)) || 
                            (p.series_model_path && !isPlaceholderAsset(p.series_model_path));
        return hasRealImage && hasRealModel;
      }).length || 0;

      const totalActiveProducts = productsWithAssets?.length || 1;
      const assetCompletionRate = Math.round((productsWithBothAssets / totalActiveProducts) * 100);
      
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

      // Get chat engagement (sessions in last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { count: chatEngagement, error: chatError } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastWeek.toISOString());

      // Get content coverage (products with complete descriptions)
      const { data: contentData, error: contentError } = await supabase
        .from('products')
        .select('description, full_description')
        .eq('is_active', true);

      const productsWithContent = contentData?.filter(p => 
        p.description && p.description.trim().length > 20 &&
        p.full_description && p.full_description.trim().length > 50
      ).length || 0;

      const contentCoverage = totalActiveProducts > 0 ? 
        Math.round((productsWithContent / totalActiveProducts) * 100) : 0;

      // Calculate asset quality score (more detailed than completion rate)
      const { data: assetData, error: assetDataError } = await supabase
        .from('products')
        .select('thumbnail_path, model_path, additional_images, series_thumbnail_path, series_model_path')
        .eq('is_active', true);

      const assetQualityScores = assetData?.map(p => {
        let score = 0;
        // Has real thumbnail (25 points)
        if ((p.thumbnail_path && !isPlaceholderAsset(p.thumbnail_path)) || 
            (p.series_thumbnail_path && !isPlaceholderAsset(p.series_thumbnail_path))) {
          score += 25;
        }
        // Has real 3D model (40 points)
        if ((p.model_path && !isPlaceholderAsset(p.model_path)) || 
            (p.series_model_path && !isPlaceholderAsset(p.series_model_path))) {
          score += 40;
        }
        // Has additional images (35 points)
        if (p.additional_images && p.additional_images.length > 0) {
          const realImages = p.additional_images.filter(img => !isPlaceholderAsset(img)).length;
          score += Math.min(realImages * 12, 35);
        }
        return Math.min(score, 100);
      }) || [];

      const assetQualityScore = assetQualityScores.length > 0 ? 
        Math.round(assetQualityScores.reduce((sum, score) => sum + score, 0) / assetQualityScores.length) : 0;

      // Database health check
      let databaseHealth: 'healthy' | 'warning' | 'error' = 'healthy';
      try {
        const healthCheck = await supabase.from('products').select('id').limit(1);
        if (healthCheck.error) databaseHealth = 'error';
      } catch {
        databaseHealth = 'error';
      }

      // HubSpot health check (simplified - check if we have recent logs)
      let hubspotHealth: 'healthy' | 'warning' | 'error' = 'healthy';
      try {
        const { data: hubspotLogs } = await supabase
          .from('hubspot_integration_logs')
          .select('success, created_at')
          .gte('created_at', yesterday.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (hubspotLogs && hubspotLogs.length > 0) {
          const failureRate = hubspotLogs.filter(log => !log.success).length / hubspotLogs.length;
          if (failureRate > 0.5) hubspotHealth = 'error';
          else if (failureRate > 0.2) hubspotHealth = 'warning';
        }
      } catch {
        hubspotHealth = 'warning';
      }

      setStats({
        totalProducts: totalProducts || 0,
        activeSeries: activeSeries || 0,
        totalVariants: totalVariants || 0,
        assetsUploaded,
        recentActivity: recentActivity || 0,
        completionRate: Math.round(completionRate),
        chatEngagement: chatEngagement || 0,
        hubspotHealth,
        databaseHealth,
        contentCoverage,
        assetQualityScore,
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
    
    // Set up real-time subscriptions with unique channel names to avoid conflicts
    const productsChannel = supabase
      .channel('dashboard-stats-products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Dashboard Stats: Product change detected, refreshing stats:', payload);
          // Refresh stats when products are created, updated, or deleted
          fetchStats();
        }
      )
      .subscribe();

    const chatSessionsChannel = supabase
      .channel('dashboard-stats-chat-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_sessions'
        },
        (payload) => {
          console.log('Dashboard Stats: New chat session detected, updating engagement:', payload);
          // Update chat engagement stats when new sessions are created
          setStats(prev => ({
            ...prev,
            chatEngagement: prev.chatEngagement + 1,
            lastUpdated: new Date()
          }));
        }
      )
      .subscribe();

    const hubspotLogsChannel = supabase
      .channel('dashboard-stats-hubspot-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hubspot_integration_logs'
        },
        (payload) => {
          console.log('Dashboard Stats: HubSpot activity detected, refreshing health:', payload);
          // Refresh stats when new HubSpot integration logs are added
          fetchStats();
        }
      )
      .subscribe();

    // Auto-refresh every 5 minutes (reduced from 30 seconds since we have real-time now)
    const interval = setInterval(fetchStats, 300000);
    
    return () => {
      console.log('Dashboard Stats: Cleaning up realtime subscriptions and interval');
      clearInterval(interval);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(chatSessionsChannel);
      supabase.removeChannel(hubspotLogsChannel);
    };
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
