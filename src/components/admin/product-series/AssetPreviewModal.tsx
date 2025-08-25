import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Box, ExternalLink, Download } from 'lucide-react';
import { isValidImageUrl, isValidModelUrl } from '@/utils/assetValidator';

interface AssetPreviewModalProps {
  open: boolean;
  onClose: () => void;
  productCode: string;
  productName: string;
  thumbnailPath?: string;
  modelPath?: string;
  additionalImages?: string[];
}

export const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({
  open,
  onClose,
  productCode,
  productName,
  thumbnailPath,
  modelPath,
  additionalImages = []
}) => {
  const imagePath = thumbnailPath || `/products/${productCode.toLowerCase()}/thumbnail.jpg`;
  const model3DPath = modelPath || `/products/${productCode.toLowerCase()}/${productCode}.glb`;

  const handleOpenAsset = (path: string) => {
    window.open(path, '_blank');
  };

  const handleDownloadAsset = (path: string, filename: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="w-5 h-5" />
            Asset Preview: {productName}
            <Badge variant="outline">{productCode}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-5 h-5" />
                <h3 className="font-medium">Product Image</h3>
                <Badge variant={isValidImageUrl(imagePath) ? "default" : "destructive"}>
                  {isValidImageUrl(imagePath) ? "Available" : "Missing"}
                </Badge>
              </div>
              
              {isValidImageUrl(imagePath) ? (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                    <img 
                      src={imagePath} 
                      alt={productName}
                      className="max-w-full max-h-[300px] object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenAsset(imagePath)}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Full Size
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadAsset(imagePath, `${productCode}_image.jpg`)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted rounded-lg p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                  <Image className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No image available</p>
                  <p className="text-sm text-muted-foreground mt-1">Expected: {imagePath}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3D Model Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Box className="w-5 h-5" />
                <h3 className="font-medium">3D Model</h3>
                <Badge variant={isValidModelUrl(model3DPath) ? "default" : "destructive"}>
                  {isValidModelUrl(model3DPath) ? "Available" : "Missing"}
                </Badge>
              </div>
              
              {isValidModelUrl(model3DPath) ? (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                    <Box className="w-16 h-16 text-primary mb-2" />
                    <p className="font-medium">3D Model Ready</p>
                    <p className="text-sm text-muted-foreground">{model3DPath}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenAsset(model3DPath)}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Model
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadAsset(model3DPath, `${productCode}_model.glb`)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted rounded-lg p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
                  <Box className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No 3D model available</p>
                  <p className="text-sm text-muted-foreground mt-1">Expected: {model3DPath}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Images */}
        {additionalImages.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Additional Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {additionalImages.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div className="bg-muted rounded-lg p-2 min-h-[100px] flex items-center justify-center">
                      <img 
                        src={image} 
                        alt={`${productName} ${index + 1}`}
                        className="max-w-full max-h-[80px] object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenAsset(image)}
                      className="w-full gap-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};