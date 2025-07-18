
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Package, Settings, Layers } from 'lucide-react';

interface Product {
  id: string;
  product_code: string;
  name: string;
  product_series: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  dimensions: string;
}

interface AssetStatisticsProps {
  products: Product[];
}

export const AssetStatistics: React.FC<AssetStatisticsProps> = ({ products }) => {
  // Calculate statistics
  const totalProducts = products.length;
  
  // Series breakdown
  const seriesStats = products.reduce((acc, product) => {
    const series = product.product_series || 'Other';
    if (!acc[series]) acc[series] = 0;
    acc[series]++;
    return acc;
  }, {} as Record<string, number>);

  // Finish type breakdown
  const finishStats = products.reduce((acc, product) => {
    const finish = product.finish_type || 'Unknown';
    if (!acc[finish]) acc[finish] = 0;
    acc[finish]++;
    return acc;
  }, {} as Record<string, number>);

  // Orientation breakdown
  const orientationStats = products.reduce((acc, product) => {
    const orientation = product.orientation || 'None';
    if (!acc[orientation]) acc[orientation] = 0;
    acc[orientation]++;
    return acc;
  }, {} as Record<string, number>);

  // Door type breakdown
  const doorTypeStats = products.reduce((acc, product) => {
    const doorType = product.door_type || 'None';
    if (!acc[doorType]) acc[doorType] = 0;
    acc[doorType]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            Complete Innosin Lab catalog
          </p>
        </CardContent>
      </Card>

      {/* Product Series */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Product Series</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Object.keys(seriesStats).length}</div>
          <div className="space-y-2 mt-2">
            {Object.entries(seriesStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([series, count]) => (
                <div key={series} className="flex items-center justify-between text-xs">
                  <span className="truncate">{series}</span>
                  <Badge variant="outline" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Finish Types */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Finish Types</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(finishStats).map(([finish, count]) => (
              <div key={finish} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{finish}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <Progress 
                  value={(count / totalProducts) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Types */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Configurations</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Door Types:</div>
            {Object.entries(doorTypeStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 4)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-xs">
                  <span className="truncate">{type}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            
            <div className="text-xs text-muted-foreground mt-3">Orientations:</div>
            {Object.entries(orientationStats).map(([orientation, count]) => (
              <div key={orientation} className="flex items-center justify-between text-xs">
                <span>{orientation === 'None' ? 'Standard' : orientation}</span>
                <Badge variant="outline" className="text-xs">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
