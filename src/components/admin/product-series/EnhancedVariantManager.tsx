
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Variant } from '@/types/variant';
import { DatabaseProduct } from '@/types/supabase';

interface EnhancedVariantManagerProps {
  seriesId: string;
  seriesName: string;
  onVariantChange?: () => void;
}

// Transform database product to Variant
const transformToVariant = (dbProduct: DatabaseProduct): Variant => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    model_path: dbProduct.model_path || '',
    thumbnail_path: dbProduct.thumbnail_path || '',
    additional_images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    full_description: dbProduct.full_description || '',
    specifications: dbProduct.specifications || {},
    finish_type: dbProduct.finish_type || '',
    orientation: dbProduct.orientation || '',
    door_type: dbProduct.door_type || '',
    variant_type: dbProduct.variant_type || '',
    drawer_count: dbProduct.drawer_count || 0,
    cabinet_class: dbProduct.cabinet_class || 'standard',
    product_code: dbProduct.product_code || '',
    mounting_type: dbProduct.mounting_type || '',
    mixing_type: dbProduct.mixing_type || '',
    handle_type: dbProduct.handle_type || '',
    emergency_shower_type: dbProduct.emergency_shower_type || '',
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series || '',
    parent_series_id: dbProduct.parent_series_id || '',
    is_series_parent: dbProduct.is_series_parent || false,
    is_active: dbProduct.is_active !== undefined ? dbProduct.is_active : true,
    series_model_path: dbProduct.series_model_path || '',
    series_thumbnail_path: dbProduct.series_thumbnail_path || '',
    series_overview_image_path: dbProduct.series_overview_image_path || '',
    overview_image_path: dbProduct.overview_image_path || '',
    series_order: dbProduct.series_order || 0,
    variant_order: dbProduct.variant_order || 0,
    created_at: dbProduct.created_at || '',
    updated_at: dbProduct.updated_at || '',
    editable_title: dbProduct.editable_title || dbProduct.name,
    editable_description: dbProduct.editable_description || dbProduct.description || '',
    inherits_series_assets: dbProduct.inherits_series_assets || false,
    target_variant_count: dbProduct.target_variant_count || 0,
    keywords: dbProduct.keywords || []
  };
};

export const EnhancedVariantManager: React.FC<EnhancedVariantManagerProps> = ({
  seriesId,
  seriesName,
  onVariantChange
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_series', seriesId)
        .eq('is_active', true)
        .order('variant_order', { ascending: true });

      if (error) throw error;

      // Transform database products to variants
      const transformedVariants = (data || []).map(transformToVariant);
      setVariants(transformedVariants);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('Failed to fetch variants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seriesId) {
      fetchVariants();
    }
  }, [seriesId]);

  const handleDeleteVariant = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', variantId);

      if (error) throw error;

      await fetchVariants();
      onVariantChange?.();
      toast.success('Variant deleted successfully');
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete variant');
    }
  };

  const handleEditVariant = async (variant: Variant) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: variant.name,
          description: variant.description,
          dimensions: variant.dimensions,
          finish_type: variant.finish_type,
          orientation: variant.orientation,
          door_type: variant.door_type,
          drawer_count: variant.drawer_count,
          product_code: variant.product_code,
          editable_title: variant.editable_title,
          editable_description: variant.editable_description,
          updated_at: new Date().toISOString()
        })
        .eq('id', variant.id);

      if (error) throw error;

      await fetchVariants();
      onVariantChange?.();
      setEditingVariant(null);
      toast.success('Variant updated successfully');
    } catch (error) {
      console.error('Error updating variant:', error);
      toast.error('Failed to update variant');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading variants...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Variants for {seriesName}</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Variant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add variant functionality would be implemented here
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {variants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No variants found for this series</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {variants.map((variant) => (
            <Card key={variant.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{variant.editable_title || variant.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{variant.product_code}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingVariant(variant)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteVariant(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{variant.editable_description || variant.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {variant.dimensions && (
                      <Badge variant="secondary">{variant.dimensions}</Badge>
                    )}
                    {variant.finish_type && (
                      <Badge variant="secondary">{variant.finish_type}</Badge>
                    )}
                    {variant.drawer_count > 0 && (
                      <Badge variant="secondary">{variant.drawer_count} Drawers</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Variant Dialog */}
      <Dialog open={editingVariant !== null} onOpenChange={() => setEditingVariant(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
          </DialogHeader>
          {editingVariant && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="variant-name">Name</Label>
                <Input
                  id="variant-name"
                  value={editingVariant.editable_title || editingVariant.name}
                  onChange={(e) => setEditingVariant({
                    ...editingVariant,
                    editable_title: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="variant-description">Description</Label>
                <Textarea
                  id="variant-description"
                  value={editingVariant.editable_description || editingVariant.description}
                  onChange={(e) => setEditingVariant({
                    ...editingVariant,
                    editable_description: e.target.value
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variant-dimensions">Dimensions</Label>
                  <Input
                    id="variant-dimensions"
                    value={editingVariant.dimensions}
                    onChange={(e) => setEditingVariant({
                      ...editingVariant,
                      dimensions: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="variant-code">Product Code</Label>
                  <Input
                    id="variant-code"
                    value={editingVariant.product_code}
                    onChange={(e) => setEditingVariant({
                      ...editingVariant,
                      product_code: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingVariant(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleEditVariant(editingVariant)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
