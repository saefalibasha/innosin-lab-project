
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { VariantFormDialog } from './VariantFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Product {
  id: string;
  name: string;
  product_code: string;
  category: string;
  product_series: string;
  finish_type: string;
  is_active: boolean;
  thumbnail_path?: string;
  model_path?: string;
  dimensions?: string;
  orientation?: string;
  door_type?: string;
  drawer_count?: number;
}

interface ProductSeries {
  id: string;
  name: string;
  product_code: string;
  product_series: string;
  category: string;
  description: string;
  series_slug: string;
  is_active: boolean;
  variant_count: number;
  completion_rate: number;
  series_thumbnail_path?: string;
  series_model_path?: string;
}

interface VariantManagerProps {
  open: boolean;
  onClose: () => void;
  series: ProductSeries;
  onVariantsUpdated: () => void;
}

export const VariantManager = ({ open, onClose, series, onVariantsUpdated }: VariantManagerProps) => {
  const [variants, setVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchVariants();
    }
  }, [open, series.id]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      
      const { data: variantsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('parent_series_id', series.id)
        .eq('is_series_parent', false)
        .order('name');

      if (error) throw error;

      setVariants(variantsData || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch variants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSaved = () => {
    fetchVariants();
    onVariantsUpdated();
    setShowAddDialog(false);
    setEditingVariant(null);
  };

  const handleDeleteVariant = async (variantId: string, variantName: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', variantId);

      if (error) throw error;

      // Log the activity
      await supabase
        .from('product_activity_log')
        .insert([{
          action: 'variant_deleted',
          changed_by: 'admin',
          old_data: { id: variantId, name: variantName }
        }]);

      toast({
        title: "Success",
        description: "Variant deleted successfully",
      });

      fetchVariants();
      onVariantsUpdated();
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast({
        title: "Error",
        description: "Failed to delete variant",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Manage Variants - {series.product_series}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{series.name}</h3>
                <p className="text-sm text-muted-foreground">{series.description}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {variants.map((variant) => (
                  <Card key={variant.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{variant.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{variant.product_code}</p>
                        </div>
                        <Badge variant={variant.is_active ? "default" : "secondary"}>
                          {variant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <p><strong>Finish:</strong> {variant.finish_type}</p>
                        {variant.dimensions && <p><strong>Dimensions:</strong> {variant.dimensions}</p>}
                        {variant.orientation && <p><strong>Orientation:</strong> {variant.orientation}</p>}
                        {variant.door_type && <p><strong>Door Type:</strong> {variant.door_type}</p>}
                        {variant.drawer_count && <p><strong>Drawers:</strong> {variant.drawer_count}</p>}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant={variant.thumbnail_path ? "default" : "secondary"}>
                          {variant.thumbnail_path ? "Image ✓" : "No Image"}
                        </Badge>
                        <Badge variant={variant.model_path ? "default" : "secondary"}>
                          {variant.model_path ? "3D Model ✓" : "No Model"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingVariant(variant)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Delete Variant
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the variant "{variant.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVariant(variant.id, variant.name)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {variants.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No variants found for this series.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  Add Your First Variant
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <VariantFormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        series={series}
        variant={null}
        onVariantSaved={handleVariantSaved}
      />

      {editingVariant && (
        <VariantFormDialog
          open={true}
          onClose={() => setEditingVariant(null)}
          series={series}
          variant={editingVariant}
          onVariantSaved={handleVariantSaved}
        />
      )}
    </>
  );
};
