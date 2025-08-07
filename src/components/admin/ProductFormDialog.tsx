
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product as ProductType } from '@/types/product';

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductType | null;
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
    category: '',
    dimensions: '',
    description: '',
    fullDescription: '',
    product_code: '',
    finish_type: '',
    orientation: '',
    door_type: '',
    mounting_type: '',
    mixing_type: '',
    handle_type: '',
    emergency_shower_type: '',
    cabinet_class: 'standard',
    company_tags: [] as string[],
    product_series: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        dimensions: product.dimensions || '',
        description: product.description || '',
        fullDescription: product.fullDescription || '',
        product_code: product.product_code || '',
        finish_type: product.finish_type || '',
        orientation: product.orientation || '',
        door_type: product.door_type || '',
        mounting_type: product.mounting_type || '',
        mixing_type: product.mixing_type || '',
        handle_type: product.handle_type || '',
        emergency_shower_type: product.emergency_shower_type || '',
        cabinet_class: product.cabinet_class || 'standard',
        company_tags: product.company_tags || [],
        product_series: product.product_series || '',
        is_active: product.is_active || true
      });
    } else {
      setFormData({
        name: '',
        category: '',
        dimensions: '',
        description: '',
        fullDescription: '',
        product_code: '',
        finish_type: '',
        orientation: '',
        door_type: '',
        mounting_type: '',
        mixing_type: '',
        handle_type: '',
        emergency_shower_type: '',
        cabinet_class: 'standard',
        company_tags: [],
        product_series: '',
        is_active: true
      });
    }
  }, [product]);

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        name: formData.name,
        category: formData.category,
        dimensions: formData.dimensions || '',
        description: formData.description || '',
        full_description: formData.fullDescription || formData.description || '',
        editable_description: formData.fullDescription || formData.description || '',
        product_code: formData.product_code || '',
        finish_type: formData.finish_type || '',
        orientation: formData.orientation || '',
        door_type: formData.door_type || '',
        mounting_type: formData.mounting_type || '',
        mixing_type: formData.mixing_type || '',
        handle_type: formData.handle_type || '',
        emergency_shower_type: formData.emergency_shower_type || '',
        cabinet_class: formData.cabinet_class || 'standard',
        company_tags: formData.company_tags || [],
        product_series: formData.product_series || '',
        is_active: formData.is_active,
        drawer_count: 0,
        editable_title: formData.name,
        model_path: '',
        thumbnail_path: '',
        additional_images: [],
        specifications: [],
        variant_type: '',
        series_order: 0,
        variant_order: 0,
        is_series_parent: false,
        parent_series_id: null,
        series_model_path: '',
        series_thumbnail_path: '',
        series_overview_image_path: '',
        overview_image_path: '',
        inherits_series_assets: false,
        series_slug: '',
        target_variant_count: null,
        number_of_drawers: null,
        keywords: []
      };

      let result;
      if (product?.id) {
        result = await supabase
          .from('products')
          .update(dataToSave)
          .eq('id', product.id);
      } else {
        result = await supabase
          .from('products')
          .insert([dataToSave]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Product ${product ? 'updated' : 'created'} successfully`,
      });

      onProductSaved();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to ${product ? 'update' : 'create'} product`,
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
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Enter category"
            />
          </div>

          <div>
            <Label htmlFor="product_code">Product Code</Label>
            <Input
              id="product_code"
              value={formData.product_code}
              onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
              placeholder="Enter product code"
            />
          </div>

          <div>
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input
              id="dimensions"
              value={formData.dimensions}
              onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
              placeholder="Enter dimensions"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="fullDescription">Full Description</Label>
            <Textarea
              id="fullDescription"
              value={formData.fullDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
              placeholder="Enter full description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="finish_type">Finish Type</Label>
              <Select
                value={formData.finish_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, finish_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select finish type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="powder-coat">Powder Coat</SelectItem>
                  <SelectItem value="stainless-steel">Stainless Steel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={formData.orientation}
                onValueChange={(value) => setFormData(prev => ({ ...prev, orientation: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LH">Left Hand</SelectItem>
                  <SelectItem value="RH">Right Hand</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
