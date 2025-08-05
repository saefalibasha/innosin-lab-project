
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, X } from 'lucide-react';

interface ProductSeriesFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSeriesAdded: () => void;
}

export const ProductSeriesFormDialog: React.FC<ProductSeriesFormDialogProps> = ({
  open,
  onClose,
  onSeriesAdded
}) => {
  const [formData, setFormData] = useState({
    product_series: '',
    category: '',
    description: '',
    series_thumbnail_path: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.product_series || !formData.category) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Create a basic product entry for the new series
      const { error } = await supabase
        .from('products')
        .insert([{
          product_series: formData.product_series,
          product_code: `${formData.product_series}-001`,
          name: formData.product_series,
          category: formData.category,
          description: formData.description,
          series_thumbnail_path: formData.series_thumbnail_path,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product series created successfully",
      });

      // Reset form
      setFormData({
        product_series: '',
        category: '',
        description: '',
        series_thumbnail_path: ''
      });

      onSeriesAdded();
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `series-thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        series_thumbnail_path: publicUrl
      }));

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Product Series</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_series">Series Name *</Label>
            <Input
              id="product_series"
              value={formData.product_series}
              onChange={(e) => setFormData(prev => ({ ...prev, product_series: e.target.value }))}
              placeholder="Enter series name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Innosin Lab">Innosin Lab</SelectItem>
                <SelectItem value="Broen-Lab">Broen-Lab</SelectItem>
                <SelectItem value="Laboratory Equipment">Laboratory Equipment</SelectItem>
                <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Enter series description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Series Thumbnail</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {formData.series_thumbnail_path && (
                <img 
                  src={formData.series_thumbnail_path} 
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Series'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
