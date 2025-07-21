
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface VariantFormDialogProps {
  open: boolean;
  onClose: () => void;
  series: ProductSeries;
  variant?: Product | null;
  onVariantSaved: () => void;
}

export const VariantFormDialog: React.FC<VariantFormDialogProps> = ({
  open,
  onClose,
  series,
  variant,
  onVariantSaved
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: variant?.name || '',
    product_code: variant?.product_code || '',
    dimensions: variant?.dimensions || '',
    finish_type: variant?.finish_type || 'PC',
    orientation: variant?.orientation || 'None',
    door_type: variant?.door_type || '',
    drawer_count: variant?.drawer_count || 0
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting variant form for series:', series.id);
    setLoading(true);

    try {
      if (variant) {
        // Update existing variant
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            product_code: formData.product_code,
            dimensions: formData.dimensions,
            finish_type: formData.finish_type,
            orientation: formData.orientation,
            door_type: formData.door_type,
            drawer_count: formData.drawer_count
          })
          .eq('id', variant.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product variant updated successfully",
        });
      } else {
        // Create new variant
        const { error } = await supabase
          .from('products')
          .insert([{
            name: formData.name,
            product_code: formData.product_code,
            product_series: series.product_series,
            category: series.category,
            dimensions: formData.dimensions,
            finish_type: formData.finish_type,
            orientation: formData.orientation,
            door_type: formData.door_type,
            drawer_count: formData.drawer_count,
            is_series_parent: false,
            parent_series_id: series.id,
            is_active: true,
            inherits_series_assets: true
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product variant created successfully",
        });
      }

      // Log the activity
      await supabase
        .from('product_activity_log')
        .insert([{
          action: variant ? 'variant_updated' : 'variant_created',
          changed_by: 'admin',
          new_data: { ...formData, parent_series_id: series.id }
        }]);

      if (!variant) {
        setFormData({
          name: '',
          product_code: '',
          dimensions: '',
          finish_type: 'PC',
          orientation: 'None',
          door_type: '',
          drawer_count: 0
        });
      }

      onVariantSaved();
      onClose();
    } catch (error) {
      console.error('Error saving variant:', error);
      toast({
        title: "Error",
        description: "Failed to save product variant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {variant ? 'Edit' : 'Create New'} Variant for {series.product_series}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variant-name">Variant Name</Label>
              <Input
                id="variant-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., MC-PC (755065)"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="product-code">Product Code</Label>
              <Input
                id="product-code"
                value={formData.product_code}
                onChange={(e) => handleChange('product_code', e.target.value)}
                placeholder="e.g., MC-PC-755065"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => handleChange('dimensions', e.target.value)}
                placeholder="e.g., 750×500×650 mm"
              />
            </div>
            
            <div>
              <Label htmlFor="finish-type">Finish Type</Label>
              <Select value={formData.finish_type} onValueChange={(value) => handleChange('finish_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select finish type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PC">Powder Coat (PC)</SelectItem>
                  <SelectItem value="SS">Stainless Steel (SS)</SelectItem>
                  <SelectItem value="GLS">Glass (GLS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orientation">Orientation</Label>
              <Select value={formData.orientation} onValueChange={(value) => handleChange('orientation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Left Hand">Left Hand</SelectItem>
                  <SelectItem value="Right Hand">Right Hand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="door-type">Door Type</Label>
              <Input
                id="door-type"
                value={formData.door_type}
                onChange={(e) => handleChange('door_type', e.target.value)}
                placeholder="e.g., Single Door, Double Door"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="drawer-count">Drawer Count</Label>
            <Input
              id="drawer-count"
              type="number"
              value={formData.drawer_count}
              onChange={(e) => handleChange('drawer_count', parseInt(e.target.value) || 0)}
              min="0"
              max="10"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : variant ? 'Update Variant' : 'Create Variant'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
