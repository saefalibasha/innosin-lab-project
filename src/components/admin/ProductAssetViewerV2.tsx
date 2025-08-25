
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Enhanced3DViewerV2 } from '@/components/3d/Enhanced3DViewerV2';
import { useProductAssets } from '@/hooks/useProductAssets';
import { VariantAssetUpload } from './VariantAssetUpload';
import { 
  Upload, 
  Image as ImageIcon, 
  Box, 
  Trash2, 
  ExternalLink,
  RefreshCw,
  AlertCircle 
} from 'lucide-react';

interface ProductAssetViewerV2Props {
  productId: string;
  variantCode: string;
  className?: string;
}

export const ProductAssetViewerV2: React.FC<ProductAssetViewerV2Props> = ({
  productId,
  variantCode,
  className = ""
}) => {
  const { assets, loading, error, refetch, deleteAsset } = useProductAssets(productId);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  const images = assets.filter(asset => asset.file_type.startsWith('image/'));
  const models = assets.filter(asset => 
    asset.file_type.includes('gltf') || 
    asset.file_path.endsWith('.glb')
  );

  const handleDeleteAsset = async (assetId: string, filePath: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      await deleteAsset(assetId, filePath);
    }
  };

  const handleUploadComplete = () => {
    refetch();
    setUploadDialogOpen(false);
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading assets for {variantCode}...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error loading assets: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Assets for {variantCode}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {assets.length} asset{assets.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Assets
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="images">Images ({images.length})</TabsTrigger>
              <TabsTrigger value="models">3D Models ({models.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary Image */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Primary Image</h4>
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={images[0].public_url}
                        alt={`${variantCode} product image`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* 3D Model Viewer */}
                {models.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">3D Model</h4>
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <Enhanced3DViewerV2 
                        modelUrl={models[0].public_url}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {assets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Box className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assets uploaded for {variantCode}</p>
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    Upload First Asset
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="group relative">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={image.public_url}
                          alt="Product image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(image.public_url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAsset(image.id, image.file_path)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {(image.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No images uploaded yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="models" className="space-y-4">
              {models.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {models.map((model) => (
                    <div key={model.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">3D Model</h4>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(model.public_url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAsset(model.id, model.file_path)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <Enhanced3DViewerV2 
                          modelUrl={model.public_url}
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(model.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Box className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No 3D models uploaded yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <VariantAssetUpload
        isOpen={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        variantCode={variantCode}
        productId={productId}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};
