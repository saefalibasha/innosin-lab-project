import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SeriesEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  series: {
    id: string;
    name: string;
    category: string;
    description: string;
    thumbnail_path: string;
    is_active: boolean;
  } | null;
  onSeriesUpdated: () => void;
}

export const SeriesEditDialog: React.FC<SeriesEditDialogProps> = ({
  isOpen,
  onOpenChange,
  series,
  onSeriesUpdated
}) => {
  const [formData, setFormData] = useState({
    name: series?.name || '',
    category: series?.category || '',
    description: series?.description || '',
    thumbnail_path: series?.thumbnail_path || '',
    is_active: series?.is_active ?? true
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (series) {
      setFormData({
        name: series.name,
        category: series.category,
        description: series.description,
        thumbnail_path: series.thumbnail_path,
        is_active: series.is_active
      });
    }
  }, [series]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!series) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          thumbnail_path: formData.thumbnail_path,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', series.id);

      if (error) throw error;

      toast.success('Series updated successfully');
      onSeriesUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating series:', error);
      toast.error('Failed to update series');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product Series</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Series Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fume Hoods">Fume Hoods</SelectItem>
                <SelectItem value="Biosafety Cabinets">Biosafety Cabinets</SelectItem>
                <SelectItem value="Laboratory Furniture">Laboratory Furniture</SelectItem>
                <SelectItem value="Storage Solutions">Storage Solutions</SelectItem>
                <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="thumbnail">Thumbnail Path</Label>
            <Input
              id="thumbnail"
              value={formData.thumbnail_path}
              onChange={(e) => setFormData({ ...formData, thumbnail_path: e.target.value })}
              placeholder="Path to thumbnail image"
            />
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.is_active ? 'active' : 'inactive'}
              onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Series'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
