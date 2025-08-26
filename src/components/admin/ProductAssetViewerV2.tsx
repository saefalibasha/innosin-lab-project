
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Eye } from 'lucide-react';
import Enhanced3DViewerV2 from '@/components/3d/Enhanced3DViewerV2';

interface ProductAssetViewerV2Props {
  productId?: string;
  modelPath?: string;
  thumbnailPath?: string;
  overviewImagePath?: string;
  onUploadAsset?: (file: File, assetType: string) => void;
}

const ProductAssetViewerV2: React.FC<ProductAssetViewerV2Props> = ({
  productId,
  modelPath,
  thumbnailPath,
  overviewImagePath,
  onUploadAsset
}) => {
  const [activeView, setActiveView] = useState<'model' | 'images'>('model');

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={activeView === 'model' ? 'default' : 'outline'}
          onClick={() => setActiveView('model')}
        >
          <Eye className="w-4 h-4 mr-2" />
          3D Model
        </Button>
        <Button
          variant={activeView === 'images' ? 'default' : 'outline'}
          onClick={() => setActiveView('images')}
        >
          <Eye className="w-4 h-4 mr-2" />
          Images
        </Button>
      </div>

      {activeView === 'model' && (
        <Card>
          <CardHeader>
            <CardTitle>3D Model Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              {modelPath ? (
                <Enhanced3DViewerV2
                  modelPath={modelPath}
                  productId={productId}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted rounded">
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No 3D model available</p>
                    {onUploadAsset && (
                      <Button
                        className="mt-2"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.glb,.gltf';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) onUploadAsset(file, 'model');
                          };
                          input.click();
                        }}
                      >
                        Upload Model
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeView === 'images' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              {thumbnailPath ? (
                <img src={thumbnailPath} alt="Product thumbnail" className="w-full h-48 object-cover rounded" />
              ) : (
                <div className="flex items-center justify-center h-48 bg-muted rounded">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No thumbnail</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overview Image</CardTitle>
            </CardHeader>
            <CardContent>
              {overviewImagePath ? (
                <img src={overviewImagePath} alt="Product overview" className="w-full h-48 object-cover rounded" />
              ) : (
                <div className="flex items-center justify-center h-48 bg-muted rounded">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No overview image</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductAssetViewerV2;
