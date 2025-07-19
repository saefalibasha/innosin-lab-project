
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit } from 'lucide-react';

interface ProductSeries {
  id?: string;
  series_name: string;
  series_code: string;
  description?: string;
  brand: string;
  category?: string;
  is_active: boolean;
}

interface ProductSeriesDialogProps {
  series?: ProductSeries | null;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

const ProductSeriesDialog = ({ series, onSuccess, trigger }: ProductSeriesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductSeries>({
    series_name: series?.series_name || '',
    series_code: series?.series_code || '',
    description: series?.description || '',
    brand: series?.brand || 'Innosin',
    category: series?.category || '',
    is_active: series?.is_active ?? true,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (series?.id) {
        const { error } = await supabase
          .from('product_series')
          .update(formData)
          .eq('id', series.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product series updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('product_series')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product series created successfully",
        });
      }

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error saving series:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product series",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductSeries, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Series
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {series ? 'Edit Product Series' : 'Create New Product Series'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="series_name">Series Name</Label>
              <Input
                id="series_name"
                value={formData.series_name}
                onChange={(e) => handleInputChange('series_name', e.target.value)}
                placeholder="Mobile Cabinet Series"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="series_code">Series Code</Label>
              <Input
                id="series_code"
                value={formData.series_code}
                onChange={(e) => handleInputChange('series_code', e.target.value)}
                placeholder="MC"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Innosin"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile Cabinet">Mobile Cabinet</SelectItem>
                  <SelectItem value="Storage">Storage</SelectItem>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the product series..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (series ? 'Update Series' : 'Create Series')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSeriesDialog;
