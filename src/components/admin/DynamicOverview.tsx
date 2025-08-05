
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Package, TrendingUp, Image, Box, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SeriesOverviewData {
  product_series: string;
  total_variants: number;
  active_variants: number;
  variants_with_assets: number;
  completion_rate: number;
  category: string;
}

export const DynamicOverview = () => {
  const [overviewData, setOverviewData] = useState<SeriesOverviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching overview data grouped by product_series...');
      
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      // Group products by product_series
      const seriesMap = new Map<string, any[]>();
      
      products?.forEach(product => {
        const seriesName = product.product_series;
        if (!seriesName) return;
        
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, []);
        }
        seriesMap.get(seriesName)!.push(product);
      });

      // Calculate stats for each series
      const overviewStats: SeriesOverviewData[] = Array.from(seriesMap.entries()).map(([seriesName, variants]) => {
        const activeVariants = variants.filter(v => v.is_active).length;
        const variantsWithAssets = variants.filter(v => v.thumbnail_path && v.model_path).length;
        const completionRate = variants.length > 0 ? Math.round((variantsWithAssets / variants.length) * 100) : 0;

        return {
          product_series: seriesName,
          total_variants: variants.length,
          active_variants: activeVariants,
          variants_with_assets: variantsWithAssets,
          completion_rate: completionRate,
          category: variants[0]?.category || 'Unknown'
        };
      });

      // Sort by completion rate descending
      overviewStats.sort((a, b) => b.completion_rate - a.completion_rate);

      setOverviewData(overviewStats);
      console.log(`✅ Successfully loaded overview for ${overviewStats.length} series`);
      
    } catch (error) {
      console.error('Error fetching overview data:', error);
      setError('Failed to fetch overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800">Error Loading Overview</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary statistics
  const totalSeries = overviewData.length;
  const totalVariants = overviewData.reduce((sum, series) => sum + series.total_variants, 0);
  const totalActiveVariants = overviewData.reduce((sum, series) => sum + series.active_variants, 0);
  const totalWithAssets = overviewData.reduce((sum, series) => sum + series.variants_with_assets, 0);
  const avgCompletionRate = totalVariants > 0 ? Math.round((totalWithAssets / totalVariants) * 100) : 0;

  // Prepare chart data (top 10 series by completion rate)
  const chartData = overviewData.slice(0, 10).map(series => ({
    name: series.product_series.length > 20 ? 
          series.product_series.substring(0, 20) + '...' : 
          series.product_series,
    completion: series.completion_rate,
    variants: series.total_variants,
    fullName: series.product_series
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalSeries}</div>
            <div className="text-sm text-muted-foreground">Product Series</div>
            <div className="text-xs text-muted-foreground mt-1">
              Grouped by product_series field
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalActiveVariants}</div>
            <div className="text-sm text-muted-foreground">Active Variants</div>
            <div className="text-xs text-muted-foreground mt-1">
              of {totalVariants} total variants
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalWithAssets}</div>
            <div className="text-sm text-muted-foreground">With Assets</div>
            <div className="text-xs text-muted-foreground mt-1">
              thumbnail + 3D model
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{avgCompletionRate}%</div>
            <div className="text-sm text-muted-foreground">Avg Completion</div>
            <div className="text-xs text-muted-foreground mt-1">
              across all series
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Series Completion Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`, 
                    name === 'completion' ? 'Completion Rate' : 'Variants'
                  ]}
                  labelFormatter={(label) => {
                    const item = chartData.find(d => d.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Bar 
                  dataKey="completion" 
                  fill="#3b82f6" 
                  name="completion"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Series Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Series Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overviewData.map((series, index) => (
              <div key={series.product_series} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{series.product_series}</h4>
                    <Badge variant="outline" className="text-xs">
                      {series.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{series.total_variants} variants</span>
                    <span>{series.active_variants} active</span>
                    <span>{series.variants_with_assets} with assets</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium mb-1">
                    {series.completion_rate}% Complete
                  </div>
                  <Progress value={series.completion_rate} className="w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
