
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Upload, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MissingAsset {
  id: string;
  name: string;
  product_code: string;
  series: string;
  missing_image: boolean;
  missing_model: boolean;
  category: string;
}

interface MissingModelsTrackerProps {
  onUploadRequest?: (productId: string, assetType: 'image' | 'model') => void;
}

export const MissingModelsTracker: React.FC<MissingModelsTrackerProps> = ({
  onUploadRequest
}) => {
  const [missingAssets, setMissingAssets] = useState<MissingAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    productsWithImages: 0,
    productsWithModels: 0,
    completeProducts: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMissingAssets();
  }, []);

  const fetchMissingAssets = async () => {
    try {
      setLoading(true);
      
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, product_code, product_series, category, thumbnail_path, model_path, is_active')
        .eq('is_active', true);

      if (error) throw error;

      const missing: MissingAsset[] = [];
      let totalProducts = 0;
      let productsWithImages = 0;
      let productsWithModels = 0;
      let completeProducts = 0;

      products?.forEach(product => {
        totalProducts++;
        const hasImage = Boolean(product.thumbnail_path);
        const hasModel = Boolean(product.model_path);
        
        if (hasImage) productsWithImages++;
        if (hasModel) productsWithModels++;
        if (hasImage && hasModel) completeProducts++;

        if (!hasImage || !hasModel) {
          missing.push({
            id: product.id,
            name: product.name,
            product_code: product.product_code || 'N/A',
            series: product.product_series || 'Uncategorized',
            missing_image: !hasImage,
            missing_model: !hasModel,
            category: product.category
          });
        }
      });

      setMissingAssets(missing);
      setStats({
        totalProducts,
        productsWithImages,
        productsWithModels,
        completeProducts
      });
    } catch (error) {
      console.error('Error fetching missing assets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch missing assets data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadRequest = (productId: string, assetType: 'image' | 'model') => {
    onUploadRequest?.(productId, assetType);
    toast({
      title: "Upload Request",
      description: `${assetType === 'image' ? 'Image' : '3D Model'} upload requested for product`,
    });
  };

  const imageCompletionRate = stats.totalProducts > 0 ? (stats.productsWithImages / stats.totalProducts) * 100 : 0;
  const modelCompletionRate = stats.totalProducts > 0 ? (stats.productsWithModels / stats.totalProducts) * 100 : 0;
  const overallCompletionRate = stats.totalProducts > 0 ? (stats.completeProducts / stats.totalProducts) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading asset tracking data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.productsWithImages}</div>
            <div className="text-sm text-muted-foreground">With Images</div>
            <Progress value={imageCompletionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.productsWithModels}</div>
            <div className="text-sm text-muted-foreground">With 3D Models</div>
            <Progress value={modelCompletionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completeProducts}</div>
            <div className="text-sm text-muted-foreground">Complete</div>
            <Progress value={overallCompletionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Missing Assets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Missing Assets ({missingAssets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {missingAssets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>All products have complete assets!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {missingAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.product_code} • {asset.series} • {asset.category}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {asset.missing_image && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          No Image
                        </Badge>
                      )}
                      {asset.missing_model && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          No 3D Model
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {asset.missing_image && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUploadRequest(asset.id, 'image')}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload Image
                        </Button>
                      )}
                      {asset.missing_model && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUploadRequest(asset.id, 'model')}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload Model
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
