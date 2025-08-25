
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Eye, Search, ToggleLeft, ToggleRight, Image, Box } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Variant } from '@/types/variant';
import { DatabaseProduct } from '@/types/supabase';
import { VariantFormDialog } from './VariantFormDialog';
import { useProductRealtime } from '@/hooks/useProductRealtime';
import { AssetStatusIndicator } from './AssetStatusIndicator';

interface EnhancedVariantManagerProps {
  seriesId: string;
  seriesName: string;
  onVariantChange?: () => void;
}

// Transform database product to Variant - using the raw data directly
const transformToVariant = (rawProduct: any): Variant => {
  return {
    id: rawProduct.id || '',
    name: rawProduct.name || '',
    category: rawProduct.category || '',
    dimensions: rawProduct.dimensions || '',
    model_path: rawProduct.model_path || '',
    thumbnail_path: rawProduct.thumbnail_path || '',
    additional_images: rawProduct.additional_images || [],
    description: rawProduct.description || '',
    full_description: rawProduct.full_description || '',
    specifications: rawProduct.specifications || {},
    finish_type: rawProduct.finish_type || '',
    orientation: rawProduct.orientation || '',
    door_type: rawProduct.door_type || '',
    variant_type: rawProduct.variant_type || '',
    drawer_count: rawProduct.drawer_count || 0,
    cabinet_class: rawProduct.cabinet_class || 'standard',
    product_code: rawProduct.product_code || '',
    mounting_type: rawProduct.mounting_type || '',
    mixing_type: rawProduct.mixing_type || '',
    handle_type: rawProduct.handle_type || '',
    emergency_shower_type: rawProduct.emergency_shower_type || '',
    company_tags: rawProduct.company_tags || [],
    product_series: rawProduct.product_series || '',
    parent_series_id: rawProduct.parent_series_id || '',
    is_series_parent: rawProduct.is_series_parent || false,
    is_active: rawProduct.is_active !== undefined ? rawProduct.is_active : true,
    series_model_path: rawProduct.series_model_path || '',
    series_thumbnail_path: rawProduct.series_thumbnail_path || '',
    series_overview_image_path: rawProduct.series_overview_image_path || '',
    overview_image_path: rawProduct.overview_image_path || '',
    series_order: rawProduct.series_order || 0,
    variant_order: rawProduct.variant_order || 0,
    created_at: rawProduct.created_at || '',
    updated_at: rawProduct.updated_at || '',
    editable_title: rawProduct.editable_title || rawProduct.name || '',
    editable_description: rawProduct.editable_description || rawProduct.description || '',
    inherits_series_assets: rawProduct.inherits_series_assets || false,
    target_variant_count: rawProduct.target_variant_count || 0,
    keywords: rawProduct.keywords || []
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());

  const fetchVariants = async () => {
    try {
      setLoading(true);
      
      // Fetch variants using both product_series and parent_series_id for better coverage
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`product_series.eq.${seriesId},parent_series_id.eq.${seriesId}`)
        .eq('is_series_parent', false)
        .order('variant_order', { ascending: true });

      if (error) throw error;

      // Transform database products to variants - using raw data directly
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

  // Set up real-time updates
  useProductRealtime({
    onProductChange: fetchVariants,
    enabled: true
  });

  const filteredVariants = variants.filter(variant =>
    variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.editable_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBulkToggleStatus = async (variantIds: string[], isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .in('id', variantIds);

      if (error) throw error;

      await fetchVariants();
      onVariantChange?.();
      setSelectedVariants(new Set());
      toast.success(`${variantIds.length} variants ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating variants:', error);
      toast.error('Failed to update variants');
    }
  };

  const toggleVariantSelection = (variantId: string) => {
    const newSelection = new Set(selectedVariants);
    if (newSelection.has(variantId)) {
      newSelection.delete(variantId);
    } else {
      newSelection.add(variantId);
    }
    setSelectedVariants(newSelection);
  };

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
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search variants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {selectedVariants.size > 0 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkToggleStatus(Array.from(selectedVariants), true)}
            >
              <ToggleRight className="h-4 w-4 mr-1" />
              Activate ({selectedVariants.size})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkToggleStatus(Array.from(selectedVariants), false)}
            >
              <ToggleLeft className="h-4 w-4 mr-1" />
              Deactivate ({selectedVariants.size})
            </Button>
          </div>
        )}
      </div>

      {filteredVariants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No variants match your search' : 'No variants found for this series'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVariants.map((variant) => (
            <Card key={variant.id} className={`${!variant.is_active ? 'opacity-50' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedVariants.has(variant.id)}
                      onChange={() => toggleVariantSelection(variant.id)}
                      className="mt-1"
                    />
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {variant.editable_title || variant.name}
                        {!variant.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{variant.product_code}</p>
                    </div>
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
                <div className="space-y-3">
                  <p className="text-sm">{variant.editable_description || variant.description}</p>
                  
                  {/* Asset Status */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Assets</span>
                      <AssetStatusIndicator
                        hasImage={!!variant.thumbnail_path}
                        hasModel={!!variant.model_path}
                        imagePath={variant.thumbnail_path}
                        modelPath={variant.model_path}
                        showValidation={true}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        <span className={variant.thumbnail_path ? "text-green-600" : "text-muted-foreground"}>
                          {variant.thumbnail_path ? "Image Available" : "No Image"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Box className="h-3 w-3" />
                        <span className={variant.model_path ? "text-green-600" : "text-muted-foreground"}>
                          {variant.model_path ? "Model Available" : "No Model"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Variant Properties */}
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
                    {variant.orientation && (
                      <Badge variant="secondary">{variant.orientation}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Variant Dialog */}
      <VariantFormDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        seriesId={seriesId}
        seriesName={seriesName}
        onVariantSaved={() => {
          fetchVariants();
          onVariantChange?.();
        }}
      />

      {/* Edit Variant Dialog */}
      <VariantFormDialog
        open={editingVariant !== null}
        onClose={() => setEditingVariant(null)}
        seriesId={seriesId}
        seriesName={seriesName}
        variant={editingVariant}
        onVariantSaved={() => {
          fetchVariants();
          onVariantChange?.();
          setEditingVariant(null);
        }}
      />
    </div>
  );
};
