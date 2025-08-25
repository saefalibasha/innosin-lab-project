
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StreamlinedFileUpload } from './StreamlinedFileUpload';
import { Upload, RefreshCw, Info } from 'lucide-react';

interface VariantAssetUploadProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  variantCode: string;
  productId: string;
  onUploadComplete: () => void;
}

export const VariantAssetUpload: React.FC<VariantAssetUploadProps> = ({
  isOpen,
  onOpenChange,
  variantCode,
  productId,
  onUploadComplete
}) => {
  const handleUploadSuccess = () => {
    // Refresh the parent component to show updated assets
    onUploadComplete();
  };

  const handleRefresh = () => {
    onUploadComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Assets for {variantCode}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Information Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Upload Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Images (.jpg, .png):</strong> Automatically set as product thumbnails and preview images</li>
                  <li>• <strong>3D Models (.glb):</strong> Automatically linked as the product's 3D model for viewing</li>
                  <li>• <strong>Smart Processing:</strong> Files are automatically organized and linked to the product</li>
                  <li>• <strong>Instant Updates:</strong> Changes appear immediately in the product catalog</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Streamlined Upload Component */}
          <StreamlinedFileUpload
            productId={productId}
            variantCode={variantCode}
            onUploadSuccess={handleUploadSuccess}
          />
          
          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Product Data
            </Button>
            
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
