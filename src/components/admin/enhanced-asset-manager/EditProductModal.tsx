
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';

interface Product {
  id: string;
  product_code: string;
  name: string;
  category: string;
  product_series: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  dimensions: string;
  description: string;
  full_description: string;
  editable_title: string;
  editable_description: string;
  company_tags: string[];
  is_active: boolean;
}

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onProductUpdated: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    product_code: product.product_code || '',
    name: product.name || '',
    category: product.category || 'Innosin Lab',
    product_series: product.product_series || '',
    dimensions: product.dimensions || '',
    finish_type: product.finish_type || 'PC',
    orientation: product.orientation || 'None',
    door_type: product.door_type || '',
    drawer_count: product.drawer_count || 0,
    description: product.description || '',
    full_description: product.full_description || '',
    editable_title: product.editable_title || '',
    editable_description: product.editable_description || '',
    company_tags: product.company_tags || [],
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    
    if (!formData.product_code.trim() || !formData.name.trim()) {
      toast.error('Product code and name are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          product_code: formData.product_code.trim(),
          name: formData.name.trim(),
          category: formData.category,
          product_series: formData.product_series.trim() || null,
          dimensions: formData.dimensions.trim() || null,
          finish_type: formData.finish_type,
          orientation: formData.orientation,
          door_type: formData.door_type.trim() || null,
          drawer_count: formData.drawer_count,
          description: formData.description.trim() || null,
          full_description: formData.full_description.trim() || null,
          editable_title: formData.editable_title.trim() || null,
          editable_description: formData.editable_description.trim() || null,
          company_tags: formData.company_tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) {
        if (error.code === '23505') {
          toast.error('Product code already exists. Please use a unique code.');
        } else {
          toast.error('Error updating product: ' + error.message);
        }
        return;
      }

      toast.success('Product updated successfully!');
      onProductUpdated();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product: {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Code & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_code">Product Code *</Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => handleInputChange('product_code', e.target.value)}
                placeholder="e.g., KS750, MC-PC-755065"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Mobile Cabinet Series"
                required
              />
            </div>
          </div>

          {/* Category & Series */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Innosin Lab">Innosin Lab</SelectItem>
                  <SelectItem value="Broen Lab">Broen Lab</SelectItem>
                  <SelectItem value="Hamilton Laboratory">Hamilton Laboratory</SelectItem>
                  <SelectItem value="Oriental Giken">Oriental Giken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_series">Product Series</Label>
              <Input
                id="product_series"
                value={formData.product_series}
                onChange={(e) => handleInputChange('product_series', e.target.value)}
                placeholder="e.g., Laboratory Bench Knee Space Series"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input
              id="dimensions"
              value={formData.dimensions}
              onChange={(e) => handleInputChange('dimensions', e.target.value)}
              placeholder="e.g., 750×550×880 mm"
            />
          </div>

          {/* Finish Type & Orientation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="finish_type">Finish Type</Label>
              <Select value={formData.finish_type} onValueChange={(value) => handleInputChange('finish_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PC">PC (Powder Coat)</SelectItem>
                  <SelectItem value="SS">SS (Stainless Steel)</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select value={formData.orientation} onValueChange={(value) => handleInputChange('orientation', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="LH">LH (Left Hand)</SelectItem>
                  <SelectItem value="RH">RH (Right Hand)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Door Type & Drawer Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="door_type">Door Type</Label>
              <Input
                id="door_type"
                value={formData.door_type}
                onChange={(e) => handleInputChange('door_type', e.target.value)}
                placeholder="e.g., Single Door, Double Door"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawer_count">Drawer Count</Label>
              <Input
                id="drawer_count"
                type="number"
                value={formData.drawer_count}
                onChange={(e) => handleInputChange('drawer_count', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          {/* Company Tags */}
          <div className="space-y-2">
            <Label>Company Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.company_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.company_tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief product description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_description">Full Description</Label>
              <Textarea
                id="full_description"
                value={formData.full_description}
                onChange={(e) => handleInputChange('full_description', e.target.value)}
                placeholder="Detailed product description..."
                rows={4}
              />
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editable_title">Editable Title</Label>
              <Input
                id="editable_title"
                value={formData.editable_title}
                onChange={(e) => handleInputChange('editable_title', e.target.value)}
                placeholder="Custom title for display..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editable_description">Editable Description</Label>
              <Textarea
                id="editable_description"
                value={formData.editable_description}
                onChange={(e) => handleInputChange('editable_description', e.target.value)}
                placeholder="Custom description for display..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
