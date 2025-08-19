import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Variant } from '@/types/variant';

interface VariantFormDialogProps {
  open: boolean;
  onClose: () => void;
  seriesId: string;
  seriesName: string;
  variant?: Variant | null;
  onVariantSaved: () => void;
}

export const VariantFormDialog: React.FC<VariantFormDialogProps> = ({
  open,
  onClose,
  seriesId,
  seriesName,
  variant,
  onVariantSaved
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dimensions: '',
    finish_type: '',
    orientation: '',
    door_type: '',
    drawer_count: 0,
    product_code: '',
    editable_title: '',
    editable_description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (variant) {
      setFormData({
        name: variant.name || '',
        description: variant.description || '',
        dimensions: variant.dimensions || '',
        finish_type: variant.finish_type || '',
        orientation: variant.orientation || '',
        door_type: variant.door_type || '',
        drawer_count: variant.drawer_count || 0,
        product_code: variant.product_code || '',
        editable_title: variant.editable_title || '',
        editable_description: variant.editable_description || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        dimensions: '',
        finish_type: '',
        orientation: '',
        door_type: '',
        drawer_count: 0,
        product_code: '',
        editable_title: '',
        editable_description: ''
      });
    }
  }, [variant, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (variant) {
        // Update existing variant
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            dimensions: formData.dimensions,
            finish_type: formData.finish_type,
            orientation: formData.orientation,
            door_type: formData.door_type,
            drawer_count: formData.drawer_count,
            product_code: formData.product_code,
            editable_title: formData.editable_title,
            editable_description: formData.editable_description,
            updated_at: new Date().toISOString()
          })
          .eq('id', variant.id);

        if (error) throw error;
        toast.success('Variant updated successfully');
      } else {
        // Create new variant
        const { error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description,
            dimensions: formData.dimensions,
            finish_type: formData.finish_type,
            orientation: formData.orientation,
            door_type: formData.door_type,
            drawer_count: formData.drawer_count,
            product_code: formData.product_code,
            editable_title: formData.editable_title,
            editable_description: formData.editable_description,
            product_series: seriesId,
            parent_series_id: seriesId,
            is_series_parent: false,
            is_active: true,
            category: 'Laboratory Equipment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Variant created successfully');
      }

      onVariantSaved();
      onClose();
    } catch (error) {
      console.error('Error saving variant:', error);
      toast.error('Failed to save variant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {variant ? 'Edit Variant' : 'Add New Variant'} - {seriesName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="product_code">Product Code</Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="editable_title">Display Title</Label>
            <Input
              id="editable_title"
              value={formData.editable_title}
              onChange={(e) => setFormData({ ...formData, editable_title: e.target.value })}
              placeholder="Optional custom title for display"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="editable_description">Display Description</Label>
            <Textarea
              id="editable_description"
              value={formData.editable_description}
              onChange={(e) => setFormData({ ...formData, editable_description: e.target.value })}
              rows={3}
              placeholder="Optional custom description for display"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 24W x 24D x 36H"
              />
            </div>
            <div>
              <Label htmlFor="finish_type">Finish Type</Label>
              <Select
                value={formData.finish_type}
                onValueChange={(value) => setFormData({ ...formData, finish_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select finish" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="powder_coated">Powder Coated</SelectItem>
                  <SelectItem value="stainless_steel">Stainless Steel</SelectItem>
                  <SelectItem value="phenolic_resin">Phenolic Resin</SelectItem>
                  <SelectItem value="epoxy_resin">Epoxy Resin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={formData.orientation}
                onValueChange={(value) => setFormData({ ...formData, orientation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="door_type">Door Type</Label>
              <Select
                value={formData.door_type}
                onValueChange={(value) => setFormData({ ...formData, door_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select door type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hinged">Hinged</SelectItem>
                  <SelectItem value="sliding">Sliding</SelectItem>
                  <SelectItem value="folding">Folding</SelectItem>
                  <SelectItem value="none">No Door</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="drawer_count">Drawer Count</Label>
              <Input
                id="drawer_count"
                type="number"
                min="0"
                value={formData.drawer_count}
                onChange={(e) => setFormData({ ...formData, drawer_count: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : variant ? 'Update Variant' : 'Create Variant'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
