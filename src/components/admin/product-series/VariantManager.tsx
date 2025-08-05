import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package, Edit, Eye, Plus, Trash2 } from 'lucide-react';

interface DatabaseVariant {
  id: string;
  product_code: string;
  name: string;
  category: string;
  dimensions?: string;
  door_type?: string;
  orientation?: string;
  finish_type?: string;
  mounting_type?: string;
  mixing_type?: string;
  handle_type?: string;
  emergency_shower_type?: string;
  drawer_count?: number;
  description?: string;
  thumbnail_path?: string;
  model_path?: string;
  is_active: boolean;
}

interface ProductSeries {
  product_series: string;
  series_slug: string;
  category: string;
  description: string;
  is_active: boolean;
  variant_count: number;
  completion_rate: number;
  series_thumbnail_path?: string;
  variants: DatabaseVariant[];
}

interface VariantManagerProps {
  open: boolean;
  onClose: () => void;
  series: ProductSeries;
  onVariantsUpdated: () => void;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  open,
  onClose,
  series,
  onVariantsUpdated
}) => {
  const [variants, setVariants] = useState<DatabaseVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && series) {
      fetchVariants();
    }
  }, [open, series]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_series', series.product_series)
        .order('product_code');

      if (error) throw error;

      const formattedVariants: DatabaseVariant[] = (data || []).map(item => ({
        id: item.id,
        product_code: item.product_code || '',
        name: item.name || '',
        category: item.category || '',
        dimensions: item.dimensions,
        door_type: item.door_type,
        orientation: item.orientation,
        finish_type: item.finish_type,
        mounting_type: item.mounting_type,
        mixing_type: item.mixing_type,
        handle_type: item.handle_type,
        emergency_shower_type: item.emergency_shower_type,
        drawer_count: item.drawer_count,
        description: item.description,
        thumbnail_path: item.thumbnail_path,
        model_path: item.model_path,
        is_active: item.is_active || false
      }));

      setVariants(formattedVariants);
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

  const handleDeleteVariant = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', variantId);

      if (error) throw error;

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

  const handleToggleActive = async (variantId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', variantId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Variant ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchVariants();
      onVariantsUpdated();
    } catch (error) {
      console.error('Error updating variant:', error);
      toast({
        title: "Error",
        description: "Failed to update variant",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Manage Variants: {series.product_series}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {variants.length} variants found in this series
                </p>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Variant
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {variants.map((variant) => (
                  <Card key={variant.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{variant.product_code}</h4>
                          <p className="text-xs text-muted-foreground">{variant.name}</p>
                        </div>
                        <Badge variant={variant.is_active ? "default" : "secondary"}>
                          {variant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {variant.thumbnail_path && (
                        <div className="w-full h-24 bg-muted rounded overflow-hidden">
                          <img 
                            src={variant.thumbnail_path} 
                            alt={variant.product_code}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span>{variant.category}</span>
                        </div>
                        
                        {variant.dimensions && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dimensions:</span>
                            <span>{variant.dimensions}</span>
                          </div>
                        )}
                        
                        {variant.finish_type && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Finish:</span>
                            <span>{variant.finish_type}</span>
                          </div>
                        )}
                        
                        {variant.orientation && variant.orientation !== 'None' && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Orientation:</span>
                            <span>{variant.orientation}</span>
                          </div>
                        )}
                        
                        {variant.door_type && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Door Type:</span>
                            <span>{variant.door_type}</span>
                          </div>
                        )}
                        
                        {variant.drawer_count && variant.drawer_count > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Drawers:</span>
                            <span>{variant.drawer_count}</span>
                          </div>
                        )}
                        
                        {variant.mounting_type && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mounting:</span>
                            <span>{variant.mounting_type}</span>
                          </div>
                        )}
                        
                        {variant.emergency_shower_type && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shower Type:</span>
                            <span>{variant.emergency_shower_type}</span>
                          </div>
                        )}
                      </div>

                      {variant.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {variant.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(variant.id, variant.is_active)}
                          className={variant.is_active ? "text-orange-600" : "text-green-600"}
                        >
                          {variant.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {variants.length === 0 && (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No variants found in this series.</p>
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Variant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
