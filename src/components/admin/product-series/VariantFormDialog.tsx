
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VariantFormDialogProps {
  open: boolean;
  onClose: () => void;
  seriesId: string;
  seriesName: string;
  onVariantAdded: () => void;
}

export const VariantFormDialog: React.FC<VariantFormDialogProps> = ({
  open,
  onClose,
  seriesId,
  seriesName,
  onVariantAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    product_code: '',
    dimensions: '',
    finish_type: 'PC',
    orientation: 'None',
    door_type: '',
    drawer_count: 0,
    description: '',
    full_description: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting variant form for series:', seriesId);
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          product_code: formData.product_code,
          product_series: seriesName,
          category: 'Innosin Lab',
          dimensions: formData.dimensions,
          finish_type: formData.finish_type,
          orientation: formData.orientation,
          door_type: formData.door_type,
          drawer_count: formData.drawer_count,
          description: formData.description,
          full_description: formData.full_description,
          is_series_parent: false,
          parent_series_id: seriesId,
          is_active: true,
          inherits_series_assets: true
        }]);

      if (error) {
        console.error('Error creating variant:', error);
        throw error;
      }

      console.log('Variant created successfully');

      // Log the activity
      await supabase
        .from('product_activity_log')
        .insert([{
          action: 'variant_created',
          changed_by: 'admin',
          new_data: { ...formData, parent_series_id: seriesId }
        }]);

      setFormData({
        name: '',
        product_code: '',
        dimensions: '',
        finish_type: 'PC',
        orientation: 'None',
        door_type: '',
        drawer_count: 0,
        description: '',
        full_description: ''
      });

      onVariantAdded();
      toast({
        title: "Success",
        description: "Product variant created successfully",
      });
    } catch (error) {
      console.error('Error creating variant:', error);
      toast({
        title: "Error",
        description: "Failed to create product variant",
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
          <DialogTitle>Create New Variant for {seriesName}</DialogTitle>
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the product variant..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="full-description">Full Description</Label>
            <Textarea
              id="full-description"
              value={formData.full_description}
              onChange={(e) => handleChange('full_description', e.target.value)}
              placeholder="Detailed description including specifications and features..."
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Variant'}
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
