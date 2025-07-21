
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Upload } from 'lucide-react';

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
  description?: string;
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

interface VariantFormDialogProps {
  open: boolean;
  onClose: () => void;
  series: ProductSeries;
  variant: Product | null;
  onVariantSaved: () => void;
}

export const VariantFormDialog = ({ 
  open, 
  onClose, 
  series, 
  variant, 
  onVariantSaved 
}: VariantFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    product_code: '',
    dimensions: '',
    orientation: '',
    door_type: '',
    drawer_count: '',
    finish_type: 'PC',
    is_active: true,
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (variant) {
      setFormData({
        name: variant.name,
        product_code: variant.product_code,
        dimensions: variant.dimensions || '',
        orientation: variant.orientation || '',
        door_type: variant.door_type || '',
        drawer_count: variant.drawer_count?.toString() || '',
        finish_type: variant.finish_type,
        is_active: variant.is_active,
        description: variant.description || ''
      });
    } else {
      // Reset form for new variant
      setFormData({
        name: '',
        product_code: '',
        dimensions: '',
        orientation: '',
        door_type: '',
        drawer_count: '',
        finish_type: 'PC',
        is_active: true,
        description: ''
      });
    }
  }, [variant, open]);

  const handleSave = async () => {
    try {
      const variantData = {
        name: formData.name,
        product_code: formData.product_code,
        category: series.category,
        product_series: series.product_series,
        parent_series_id: series.id,
        is_series_parent: false,
        dimensions: formData.dimensions,
        orientation: formData.orientation,
        door_type: formData.door_type,
        drawer_count: formData.drawer_count ? parseInt(formData.drawer_count) : null,
        finish_type: formData.finish_type,
        is_active: formData.is_active,
        description: formData.description,
        updated_at: new Date().toISOString()
      };

      if (variant) {
        // Update existing variant
        const { error } = await supabase
          .from('products')
          .update(variantData)
          .eq('id', variant.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Variant updated successfully",
        });
      } else {
        // Create new variant
        const { error } = await supabase
          .from('products')
          .insert([{
            ...variantData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Variant created successfully",
        });
      }

      onVariantSaved();
    } catch (error) {
      console.error('Error saving variant:', error);
      toast({
        title: "Error",
        description: "Failed to save variant",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'model') => {
    const file = event.target.files?.[0];
    if (!file || !variant) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${variant.id}-${type}.${fileExt}`;
      const filePath = `product-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Update variant with new asset path
      const updateField = type === 'thumbnail' ? 'thumbnail_path' : 'model_path';
      const { error: updateError } = await supabase
        .from('products')
        .update({ [updateField]: publicUrl })
        .eq('id', variant.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `${type === 'thumbnail' ? 'Image' : '3D Model'} uploaded successfully`,
      });

      onVariantSaved();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {variant ? 'Edit Variant' : 'Add New Variant'} - {series.product_series}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Variant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter variant name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_code">Product Code</Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
                placeholder="Enter product code"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="e.g., 500×500×650 mm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finish_type">Finish Type</Label>
              <Input
                id="finish_type"
                value={formData.finish_type}
                onChange={(e) => setFormData(prev => ({ ...prev, finish_type: e.target.value }))}
                placeholder="e.g., PC, SS"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Input
                id="orientation"
                value={formData.orientation}
                onChange={(e) => setFormData(prev => ({ ...prev, orientation: e.target.value }))}
                placeholder="e.g., Left Hand, Right Hand"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drawer_count">Drawer Count</Label>
              <Input
                id="drawer_count"
                type="number"
                value={formData.drawer_count}
                onChange={(e) => setFormData(prev => ({ ...prev, drawer_count: e.target.value }))}
                placeholder="Number of drawers"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="door_type">Door Type</Label>
            <Input
              id="door_type"
              value={formData.door_type}
              onChange={(e) => setFormData(prev => ({ ...prev, door_type: e.target.value }))}
              placeholder="e.g., Glass, Solid, Combination"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter variant description"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Active Status</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          {variant && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold">Asset Upload</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thumbnail Image (.jpg)</Label>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleImageUpload(e, 'thumbnail')}
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>3D Model (.glb)</Label>
                  <Input
                    type="file"
                    accept=".glb"
                    onChange={(e) => handleImageUpload(e, 'model')}
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {variant ? 'Update' : 'Create'} Variant
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
