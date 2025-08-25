
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductAsset {
  id: string;
  file_path: string;
  file_type: string;
  file_size: number;
  upload_status: string;
  created_at: string;
  public_url?: string;
}

export const useProductAssets = (productId: string) => {
  const [assets, setAssets] = useState<ProductAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAssets = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('asset_uploads')
        .select('*')
        .eq('product_id', productId)
        .eq('upload_status', 'completed')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Get public URLs for each asset
      const assetsWithUrls = await Promise.all(
        (data || []).map(async (asset) => {
          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(asset.file_path);
          
          return {
            ...asset,
            public_url: urlData.publicUrl
          };
        })
      );

      setAssets(assetsWithUrls);
    } catch (err: any) {
      console.error('Error fetching product assets:', err);
      setError(err.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (assetId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Update database record
      const { error: dbError } = await supabase
        .from('asset_uploads')
        .update({ upload_status: 'deleted' })
        .eq('id', assetId);

      if (dbError) throw dbError;

      // Refresh assets
      await fetchAssets();

      toast({
        title: "Asset Deleted",
        description: "Asset has been successfully removed",
      });
    } catch (err: any) {
      console.error('Error deleting asset:', err);
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete asset",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [productId]);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
    deleteAsset
  };
};
