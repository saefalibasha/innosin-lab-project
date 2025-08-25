
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadManager } from './FileUploadManager';
import { Upload, RefreshCw } from 'lucide-react';

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
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUploadSuccess = async (file: any) => {
    setIsUpdating(true);
    
    try {
      console.log('Linking asset to product:', { file, productId, variantCode });
      
      const updateData: any = {};
      
      // Determine what type of asset this is and update accordingly
      if (file.type.startsWith('image/')) {
        updateData.thumbnail_path = file.url;
        updateData.overview_image_path = file.url;
      } else if (file.type.includes('gltf') || file.type.includes('glb') || file.path.endsWith('.glb')) {
        updateData.model_path = file.url;
      }

      if (Object.keys(updateData).length > 0) {
        console.log('Updating product with data:', updateData);
        
        const { data, error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', productId)
          .select();

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }

        console.log('Product updated successfully:', data);

        toast({
          title: "Asset Linked",
          description: `Successfully linked ${file.type.startsWith('image/') ? 'image' : '3D model'} to ${variantCode}`,
        });

        // Call the completion callback to refresh the parent component
        onUploadComplete();
      }
    } catch (error: any) {
      console.error('Error linking asset to product:', error);
      toast({
        title: "Linking Failed",
        description: error.message || "Failed to link asset to product",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = () => {
    onUploadComplete();
    toast({
      title: "Refreshed",
      description: "Product data has been refreshed",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Assets for {variantCode}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Upload Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Images (.jpg, .jpeg, .png):</strong> Will be set as product thumbnail and overview image</li>
              <li>• <strong>3D Models (.glb):</strong> Will be set as the product's 3D model for viewing</li>
              <li>• Files are automatically linked to the product after successful upload</li>
              <li>• You can upload multiple files at once</li>
            </ul>
          </div>
          
          <FileUploadManager
            productId={productId}
            variantCode={variantCode}
            onUploadSuccess={handleUploadSuccess}
            allowedTypes={['.glb', '.jpg', '.jpeg', '.png']}
            maxFiles={5}
          />
          
          <div className="flex justify-between gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Product Data
            </Button>
            
            <Button 
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
