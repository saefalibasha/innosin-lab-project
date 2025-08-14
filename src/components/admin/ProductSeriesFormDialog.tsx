
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductSeriesFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onProductSaved: () => void;
}

const ProductSeriesFormDialog: React.FC<ProductSeriesFormDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  onProductSaved
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    fullDescription: '',
    product_code: '',
    company_tags: [] as string[],
    is_active: true,
    is_series_parent: true,
    target_variant_count: 1
  });
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        fullDescription: product.full_description || '',
        product_code: product.product_code || '',
        company_tags: product.company_tags || [],
        is_active: product.is_active ?? true,
        is_series_parent: true,
        target_variant_count: product.target_variant_count || 1
      });
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        fullDescription: '',
        product_code: '',
        company_tags: [],
        is_active: true,
        is_series_parent: true,
        target_variant_count: 1
      });
    }
  }, [product]);

  const handleAddTag = () => {
    if (newTag.trim() && !formData.company_tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        company_tags: [...prev.company_tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      company_tags: prev.company_tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        full_description: formData.fullDescription,
        product_code: formData.product_code,
        company_tags: formData.company_tags,
        is_active: formData.is_active,
        is_series_parent: formData.is_series_parent,
        target_variant_count: formData.target_variant_count,
        updated_at: new Date().toISOString()
      };

      if (product?.id) {
        const { error } = await supabase
          .from('products')
          .update(dataToSave)
          .eq('id', product.id);
        if (error) throw error;
        toast.success('Product series updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{
            ...dataToSave,
            created_at: new Date().toISOString()
          }]);
        if (error) throw error;
        toast.success('Product series created successfully');
      }

      onProductSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving product series:', error);
      toast.error('Failed to save product series');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product Series' : 'Add Product Series'}
          </DialogTitle>
          <DialogDescription>
            Configure the main details for this product series. Variants will be managed separately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_code">Product Code</Label>
            <Input
              id="product_code"
              value={formData.product_code}
              onChange={(e) => setFormData(prev => ({...prev, product_code: e.target.value}))}
              placeholder="e.g., MC-PC-755065"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Description</Label>
            <Textarea
              id="fullDescription"
              value={formData.fullDescription}
              onChange={(e) => setFormData(prev => ({...prev, fullDescription: e.target.value}))}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Company Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add company tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.company_tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_variant_count">Expected Variants</Label>
              <Input
                id="target_variant_count"
                type="number"
                min="1"
                value={formData.target_variant_count}
                onChange={(e) => setFormData(prev => ({...prev, target_variant_count: parseInt(e.target.value) || 1}))}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, is_active: checked}))}
              />
              <Label htmlFor="is_active">Active Series</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : (product ? 'Update Series' : 'Create Series')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSeriesFormDialog;
