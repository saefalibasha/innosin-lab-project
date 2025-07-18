
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, X } from 'lucide-react';

interface Product {
  id: string;
  product_code: string;
  name: string;
  editable_title: string;
  editable_description: string;
  category: string;
  product_series: string;
  finish_type: string;
  dimensions: string;
}

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave
}) => {
  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (product) {
      setEditableTitle(product.editable_title || product.name);
      setEditableDescription(product.editable_description || '');
    }
  }, [product]);

  const handleSave = async () => {
    if (!product) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          editable_title: editableTitle,
          editable_description: editableDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product information updated successfully",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update product information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Product: {product.product_code}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Series:</span> {product.product_series}
            </div>
            <div>
              <span className="font-medium">Finish:</span> {product.finish_type}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Dimensions:</span> {product.dimensions}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Display Title</Label>
              <Input
                id="title"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder="Enter display title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                placeholder="Enter product description"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditModal;
