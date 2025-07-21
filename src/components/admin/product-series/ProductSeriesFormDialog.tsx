
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProductSeriesFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSeriesAdded: () => void;
}

export const ProductSeriesFormDialog: React.FC<ProductSeriesFormDialogProps> = ({
  open,
  onClose,
  onSeriesAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    product_code: '',
    product_series: '',
    category: 'Innosin Lab',
    description: '',
    full_description: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const seriesSlug = formData.product_series.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          product_code: formData.product_code,
          product_series: formData.product_series,
          category: formData.category,
          description: formData.description,
          full_description: formData.full_description,
          series_slug: seriesSlug,
          is_series_parent: true,
          is_active: true
        }]);

      if (error) throw error;

      // Log the activity
      await supabase
        .from('product_activity_log')
        .insert([{
          action: 'series_created',
          changed_by: 'admin',
          new_data: formData
        }]);

      setFormData({
        name: '',
        product_code: '',
        product_series: '',
        category: 'Innosin Lab',
        description: '',
        full_description: ''
      });

      onSeriesAdded();
    } catch (error) {
      console.error('Error creating series:', error);
      toast({
        title: "Error",
        description: "Failed to create product series",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Product Series</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="series-name">Series Name</Label>
              <Input
                id="series-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Mobile Cabinet Series"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="product-code">Product Code</Label>
              <Input
                id="product-code"
                value={formData.product_code}
                onChange={(e) => handleChange('product_code', e.target.value)}
                placeholder="e.g., MC-SERIES"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product-series">Product Series</Label>
              <Input
                id="product-series"
                value={formData.product_series}
                onChange={(e) => handleChange('product_series', e.target.value)}
                placeholder="e.g., Mobile Cabinet"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Innosin Lab">Innosin Lab</SelectItem>
                  <SelectItem value="Storage Solutions">Storage Solutions</SelectItem>
                  <SelectItem value="Laboratory Equipment">Laboratory Equipment</SelectItem>
                  <SelectItem value="Workspace Furniture">Workspace Furniture</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the product series..."
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
              placeholder="Detailed description including features, benefits, and use cases..."
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Series'}
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
