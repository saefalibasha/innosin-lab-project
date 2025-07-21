
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProductSeriesFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSeriesAdded: () => void;
}

export const ProductSeriesFormDialog = ({ open, onClose, onSeriesAdded }: ProductSeriesFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    product_series: '',
    category: 'Innosin Lab',
    description: '',
    product_code: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.product_series || !formData.product_code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create series slug from product_series
      const seriesSlug = formData.product_series.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Create the series parent product
      const { error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          product_code: formData.product_code,
          product_series: formData.product_series,
          category: formData.category,
          description: formData.description,
          series_slug: seriesSlug,
          is_series_parent: true,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product series created successfully",
      });

      // Reset form
      setFormData({
        name: '',
        product_series: '',
        category: 'Innosin Lab',
        description: '',
        product_code: ''
      });

      onSeriesAdded();
      onClose();

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Product Series</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Series Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mobile Cabinet Series"
                required
              />
            </div>
            <div>
              <Label htmlFor="product_code">Product Code *</Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
                placeholder="e.g., MC-PC-SERIES"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product_series">Product Series *</Label>
            <Input
              id="product_series"
              value={formData.product_series}
              onChange={(e) => setFormData(prev => ({ ...prev, product_series: e.target.value }))}
              placeholder="e.g., Mobile Cabinet"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Innosin Lab">Innosin Lab</SelectItem>
                <SelectItem value="Storage Solutions">Storage Solutions</SelectItem>
                <SelectItem value="Laboratory Equipment">Laboratory Equipment</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the product series..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Series
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
