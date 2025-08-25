import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadManager } from './FileUploadManager';
import { Upload } from 'lucide-react';

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
      const updateData: any = {};
      
      if (file.type.startsWith('image/')) {
        updateData.thumbnail_path = file.url;
      } else if (file.type.includes('gltf') || file.type.includes('glb')) {
        updateData.model_path = file.url;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', productId);

        if (error) throw error;

        toast({
          title: "Asset Updated",
          description: `Successfully linked ${file.type.startsWith('image/') ? 'image' : '3D model'} to ${variantCode}`,
        });

        onUploadComplete();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update Failed",
        description: "Failed to link asset to product",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
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
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload new image and 3D model files for this variant. Files will automatically replace any existing placeholder assets.
          </p>
          
          <FileUploadManager
            productId={productId}
            variantCode={variantCode}
            onUploadSuccess={handleUploadSuccess}
            allowedTypes={['.glb', '.jpg', '.jpeg', '.png']}
            maxFiles={2}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
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