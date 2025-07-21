
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Package, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OverviewStats {
  totalSeries: number;
  totalVariants: number;
  completedAssets: number;
  totalProducts: number;
  recentUpdates: number;
}

interface SeriesData {
  id: string;
  name: string;
  variant_count: number;
  completion_rate: number;
  fill: string;
  updated_at: string;
}

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const words = payload.value.split(' ');
  const lineHeight = 14;
  const maxWidth = 100;
  
  // Group words into lines that fit within maxWidth
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach((word: string) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * 7 <= maxWidth) { // Rough estimate: 7px per character
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  
  return (
    <g>
      {lines.map((line, index) => (
        <text
          key={index}
          x={x}
          y={y + 10 + (index * lineHeight)}
          textAnchor="middle"
          fontSize={12}
          fill="#666"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

export const DynamicOverview = () => {
  const [stats, setStats] = useState<OverviewStats>({
    totalSeries: 0,
    totalVariants: 0,
    completedAssets: 0,
    totalProducts: 0,
    recentUpdates: 0
  });
  const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
    
    // Set up real-time subscription for product updates
    const channel = supabase
      .channel('products-overview-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          console.log('Product updated, refreshing overview...');
          fetchOverviewData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      
      // Get all products
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const seriesParents = allProducts?.filter(p => p.is_series_parent) || [];
      const variants = allProducts?.filter(p => !p.is_series_parent) || [];

      // Calculate stats
      const completedAssets = variants.filter(v => v.thumbnail_path && v.model_path).length;
      
      // Recent updates (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentUpdates = allProducts?.filter(p => 
        new Date(p.updated_at) > weekAgo
      ).length || 0;

      setStats({
        totalSeries: seriesParents.length,
        totalVariants: variants.length,
        completedAssets,
        totalProducts: allProducts?.length || 0,
        recentUpdates
      });

      // Prepare chart data
      const chartData = await Promise.all(
        seriesParents.map(async (series) => {
          const { count: variantCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('parent_series_id', series.id)
            .eq('is_active', true);

          // Calculate completion rate based on current variants vs target variants
          const targetVariants = series.target_variant_count || 4;
          const currentVariants = variantCount || 0;
          const completionRate = targetVariants > 0 ? 
            Math.min(Math.round((currentVariants / targetVariants) * 100), 100) : 0;

          // Get color based on completion rate
          const getColor = (rate: number) => {
            if (rate >= 80) return '#22c55e'; // green
            if (rate >= 50) return '#f59e0b'; // yellow
            return '#ef4444'; // red
          };

          return {
            id: series.id,
            name: series.name,
            variant_count: currentVariants,
            completion_rate: completionRate,
            fill: getColor(completionRate),
            updated_at: series.updated_at
          };
        })
      );

      setSeriesData(chartData);
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Series</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSeries}</div>
            <p className="text-xs text-muted-foreground">Active product series</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVariants}</div>
            <p className="text-xs text-muted-foreground">Product variants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Assets</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssets}</div>
            <p className="text-xs text-muted-foreground">With images & models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              All products including series and variants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Series Completion Chart with Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Variants Completion Status
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Variants completion rates by product series
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Updates in last 7 days</span>
              <Badge variant="outline">{stats.recentUpdates} updates</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div style={{ minWidth: Math.max(600, seriesData.length * 120) + 'px' }}>
              <ResponsiveContainer width="100%" height={600}>
                <BarChart 
                  data={seriesData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    interval={0}
                    textAnchor="middle"
                    height={120}
                    tick={<CustomXAxisTick />}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label) => `Series: ${label}`}
                  />
                  <Bar 
                    dataKey="completion_rate" 
                    radius={[4, 4, 0, 0]}
                    fill="hsl(var(--primary))"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
