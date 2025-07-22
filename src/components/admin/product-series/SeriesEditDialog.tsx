
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProductSeries {
  id: string;
  name: string;
  product_code: string;
  product_series: string;
  category: string;
  description: string;
  series_slug: string;
  is_active: boolean;
}

interface SeriesEditDialogProps {
  open: boolean;
  onClose: () => void;
  series: ProductSeries;
  onSeriesUpdated: () => void;
}

export const SeriesEditDialog = ({ open, onClose, series, onSeriesUpdated }: SeriesEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: series.name,
    product_code: series.product_code,
    category: series.category,
    description: series.description || '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.product_code.trim() || !formData.category.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Update the series - the database trigger will handle updating product_series and child variants
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name.trim(),
          product_code: formData.product_code.trim(),
          category: formData.category.trim(),
          description: formData.description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', series.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Series updated successfully. All related variants have been updated automatically.",
      });

      onSeriesUpdated();
    } catch (error) {
      console.error('Error updating series:', error);
      toast({
        title: "Error",
        description: "Failed to update series",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product Series</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Series Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter series name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_code">Product Code *</Label>
            <Input
              id="product_code"
              value={formData.product_code}
              onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
              placeholder="Enter product code"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Enter category"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter series description"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Series
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
