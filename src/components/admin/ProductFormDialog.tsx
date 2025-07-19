
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  product_code: string;
  category: string;
  dimensions?: string;
  description?: string;
  full_description?: string;
  product_series?: string;
  finish_type?: string;
  orientation?: string;
  door_type?: string;
  drawer_count?: number;
  specifications?: any;
  keywords?: string[];
  company_tags?: string[];
  thumbnail_path?: string;
  model_path?: string;
  additional_images?: string[];
  overview_image_path?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onProductSaved: () => void;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  onProductSaved
}) => {
  const [formData, setFormData] = useState({
    name: '',
    product_code: '',
    category: '',
    description: '',
    dimensions: '',
    product_series: '',
    finish_type: '',
    orientation: '',
    door_type: '',
    drawer_count: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        product_code: product.product_code || '',
        category: product.category || '',
        description: product.description || '',
        dimensions: product.dimensions || '',
        product_series: product.product_series || '',
        finish_type: product.finish_type || '',
        orientation: product.orientation || '',
        door_type: product.door_type || '',
        drawer_count: product.drawer_count || 0,
        is_active: product.is_active
      });
    } else {
      setFormData({
        name: '',
        product_code: '',
        category: '',
        description: '',
        dimensions: '',
        product_series: '',
        finish_type: '',
        orientation: '',
        door_type: '',
        drawer_count: 0,
        is_active: true
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      onProductSaved();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="product_code">Product Code</Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
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
                  <SelectItem value="Mobile Cabinet">Mobile Cabinet</SelectItem>
                  <SelectItem value="Storage">Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="product_series">Product Series</Label>
              <Input
                id="product_series"
                value={formData.product_series}
                onChange={(e) => setFormData(prev => ({ ...prev, product_series: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="finish_type">Finish Type</Label>
              <Select value={formData.finish_type} onValueChange={(value) => setFormData(prev => ({ ...prev, finish_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select finish" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PC">Powder Coat</SelectItem>
                  <SelectItem value="SS">Stainless Steel</SelectItem>
                  <SelectItem value="PC/SS">PC/SS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="e.g., 500×500×650 mm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
