
import React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface ProductSeriesFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSeriesCreated: () => void;
}

export const ProductSeriesFormDialog: React.FC<ProductSeriesFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSeriesCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    product_series: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          category: formData.category,
          description: formData.description,
          product_series: formData.product_series || formData.name,
          is_series_parent: true,
          is_active: formData.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Product series created successfully!');
      onSeriesCreated();
      onOpenChange(false);
      setFormData({
        name: '',
        category: '',
        description: '',
        product_series: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error creating product series:', error);
      toast.error('Failed to create product series');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Product Series
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Series Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter series name"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter category"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product_series">Series Code</Label>
            <Input
              id="product_series"
              value={formData.product_series}
              onChange={(e) => setFormData(prev => ({ ...prev, product_series: e.target.value }))}
              placeholder="Leave empty to auto-generate from name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter series description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active Series</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Series'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
