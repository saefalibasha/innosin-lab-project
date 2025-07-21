
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Upload, Eye, Package } from 'lucide-react';
import { VariantFormDialog } from './VariantFormDialog';

interface ProductVariant {
  id: string;
  name: string;
  product_code: string;
  dimensions: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  description: string;
  thumbnail_path?: string;
  model_path?: string;
  variant_order: number;
  is_active: boolean;
}

interface VariantManagerProps {
  open: boolean;
  onClose: () => void;
  series: {
    id: string;
    name: string;
    product_series: string;
  };
  onVariantsUpdated: () => void;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  open,
  onClose,
  series,
  onVariantsUpdated
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchVariants();
    }
  }, [open, series.id]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('parent_series_id', series.id)
        .eq('is_series_parent', false)
        .order('variant_order', { ascending: true });

      if (error) throw error;

      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product variants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVariantAdded = () => {
    setShowAddDialog(false);
    fetchVariants();
    onVariantsUpdated();
    toast({
      title: "Success",
      description: "Product variant created successfully",
    });
  };

  const getCompletionBadge = (variant: ProductVariant) => {
    const hasAssets = variant.thumbnail_path && variant.model_path;
    return (
      <Badge variant={hasAssets ? "default" : "secondary"}>
        {hasAssets ? "Complete" : "Incomplete"}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Variants - {series.product_series}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">{variants.length} variants</span>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Variant
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {variants.map((variant) => (
                <Card key={variant.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm">{variant.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{variant.product_code}</p>
                      </div>
                      {getCompletionBadge(variant)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs space-y-1">
                      <p><strong>Dimensions:</strong> {variant.dimensions || 'N/A'}</p>
                      <p><strong>Finish:</strong> {variant.finish_type || 'N/A'}</p>
                      <p><strong>Orientation:</strong> {variant.orientation || 'N/A'}</p>
                      {variant.drawer_count > 0 && (
                        <p><strong>Drawers:</strong> {variant.drawer_count}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVariant(variant)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        Assets
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {variants.length === 0 && !loading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No variants found for this series.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowAddDialog(true)}
                  >
                    Create First Variant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <VariantFormDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          seriesId={series.id}
          seriesName={series.product_series}
          onVariantAdded={handleVariantAdded}
        />
      </DialogContent>
    </Dialog>
  );
};
