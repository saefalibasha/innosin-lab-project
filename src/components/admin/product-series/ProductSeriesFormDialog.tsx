
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

// Standardized INNOSIN product series names
const INNOSIN_SERIES_OPTIONS = [
  'KNEE SPACE',
  'MOBILE CABINET FOR 750mm H BENCH',
  'MOBILE CABINET FOR 900mm H BENCH',
  'MODULAR CABINET',
  'OPEN RACK',
  'SINK CABINET',
  'TALL CABINET GLASS DOOR',
  'TALL CABINET SOLID DOOR',
  'WALL CABINET'
];

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
    product_code: '',
    target_variant_count: 4
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

    if (!INNOSIN_SERIES_OPTIONS.includes(formData.product_series)) {
      toast({
        title: "Error",
        description: "Please select a valid product series from the dropdown",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check if this series already exists
      const { data: existingSeries, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('product_series', formData.product_series)
        .eq('is_series_parent', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingSeries) {
        toast({
          title: "Error",
          description: "This product series already exists",
          variant: "destructive",
        });
        return;
      }

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
          is_active: true,
          target_variant_count: formData.target_variant_count
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
        product_code: '',
        target_variant_count: 4
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
            <Select value={formData.product_series} onValueChange={(value) => setFormData(prev => ({ ...prev, product_series: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product series" />
              </SelectTrigger>
              <SelectContent>
                {INNOSIN_SERIES_OPTIONS.map((series) => (
                  <SelectItem key={series} value={series}>
                    {series}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div>
            <Label htmlFor="target_variant_count">Expected Number of Variants</Label>
            <Input
              id="target_variant_count"
              type="number"
              min="1"
              max="20"
              value={formData.target_variant_count}
              onChange={(e) => setFormData(prev => ({ ...prev, target_variant_count: parseInt(e.target.value) || 4 }))}
              placeholder="4"
            />
            <p className="text-xs text-muted-foreground mt-1">
              How many variants do you plan to create for this series?
            </p>
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
