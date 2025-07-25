
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Save, X } from 'lucide-react';

interface ProductSeriesFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSeriesAdded: () => void;
}

const AVAILABLE_BRANDS = [
  { value: 'Innosin Lab', label: 'Innosin Lab' },
  { value: 'Broen-Lab', label: 'Broen-Lab' },
  { value: 'Hamilton Laboratory Solutions', label: 'Hamilton Laboratory Solutions' },
  { value: 'Oriental Giken Inc.', label: 'Oriental Giken Inc.' },
  { value: 'Other', label: 'Other' }
];

export const ProductSeriesFormDialog: React.FC<ProductSeriesFormDialogProps> = ({
  open,
  onClose,
  onSeriesAdded
}) => {
  const [formData, setFormData] = useState({
    name: '',
    product_series: '',
    category: '',
    brand: 'Innosin Lab',
    description: '',
    target_variant_count: 4
  });
  const [customBrand, setCustomBrand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.product_series || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const finalBrand = formData.brand === 'Other' ? customBrand : formData.brand;
      
      if (formData.brand === 'Other' && !customBrand.trim()) {
        toast({
          title: "Error",
          description: "Please specify the brand name",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Generate a slug from the series name
      const slug = formData.product_series.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Create the series parent product
      const { data: seriesData, error: seriesError } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          product_series: formData.product_series,
          category: formData.category,
          description: formData.description,
          is_series_parent: true,
          is_active: true,
          series_slug: slug,
          target_variant_count: formData.target_variant_count,
          company_tags: [finalBrand],
          product_code: `${formData.product_series}-SERIES`,
          finish_type: 'PC',
          orientation: 'None',
          series_order: 0
        }])
        .select()
        .single();

      if (seriesError) throw seriesError;

      // Log the activity
      await supabase
        .from('product_activity_log')
        .insert([{
          action: 'series_created',
          changed_by: 'admin',
          new_data: { 
            id: seriesData.id, 
            name: formData.product_series,
            brand: finalBrand,
            category: formData.category,
            created_at: new Date().toISOString()
          }
        }]);

      toast({
        title: "Success",
        description: `Product series "${formData.product_series}" created successfully`,
      });

      // Reset form
      setFormData({
        name: '',
        product_series: '',
        category: '',
        brand: 'Innosin Lab',
        description: '',
        target_variant_count: 4
      });
      setCustomBrand('');
      
      onSeriesAdded();
    } catch (error) {
      console.error('Error creating series:', error);
      toast({
        title: "Error",
        description: "Failed to create product series",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrandChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      brand: value
    }));
    if (value !== 'Other') {
      setCustomBrand('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Product Series</DialogTitle>
          <DialogDescription>
            Add a new product series to the catalog. You can specify the brand, category, and expected number of variants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Select value={formData.brand} onValueChange={handleBrandChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_BRANDS.map(brand => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.brand === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="customBrand">Custom Brand Name *</Label>
                <Input
                  id="customBrand"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter category (e.g., Mobile Cabinets, Fume Hoods)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_series">Series Name *</Label>
            <Input
              id="product_series"
              value={formData.product_series}
              onChange={(e) => setFormData(prev => ({ ...prev, product_series: e.target.value }))}
              placeholder="e.g., Mobile Cabinet Series"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., MC Series - Mobile Laboratory Cabinets"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the product series..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_variant_count">Expected Number of Variants</Label>
            <Input
              id="target_variant_count"
              type="number"
              min="1"
              max="20"
              value={formData.target_variant_count}
              onChange={(e) => setFormData(prev => ({ ...prev, target_variant_count: parseInt(e.target.value) || 4 }))}
            />
            <p className="text-xs text-muted-foreground">
              How many product variants do you plan to create for this series?
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Series'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
