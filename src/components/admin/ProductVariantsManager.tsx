
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Upload, Image, Box } from 'lucide-react';
import ProductVariantDialog from './ProductVariantDialog';

interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  variant_code: string;
  variant_type: string;
  finish_type?: string;
  color?: string;
  size_dimensions?: string;
  thumbnail_path?: string;
  model_path?: string;
  additional_images: string[];
  additional_specs: Record<string, any>;
  is_active: boolean;
  sort_order: number;
}

interface ProductVariantsManagerProps {
  productId: string;
  productName: string;
}

const ProductVariantsManager = ({ productId, productName }: ProductVariantsManagerProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVariants();
  }, [productId]);

  const loadVariants = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // Map the data to ensure proper type conversion
      const mappedVariants: ProductVariant[] = (data || []).map(variant => ({
        id: variant.id,
        product_id: variant.product_id,
        variant_name: variant.variant_name,
        variant_code: variant.variant_code,
        variant_type: variant.variant_type || 'standard',
        finish_type: variant.finish_type,
        color: variant.color,
        size_dimensions: variant.size_dimensions,
        thumbnail_path: variant.thumbnail_path,
        model_path: variant.model_path,
        additional_images: variant.additional_images || [],
        additional_specs: (variant.additional_specs as Record<string, any>) || {},
        is_active: variant.is_active,
        sort_order: variant.sort_order
      }));
      
      setVariants(mappedVariants);
    } catch (error) {
      console.error('Error loading variants:', error);
      toast({
        title: "Error",
        description: "Failed to load product variants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Variant deleted successfully",
      });
      
      loadVariants();
    } catch (error: any) {
      console.error('Error deleting variant:', error);
      toast({
        title: "Error",
        description: "Failed to delete variant",
        variant: "destructive",
      });
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setDialogOpen(true);
  };

  const handleAddVariant = () => {
    setSelectedVariant(null);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    loadVariants();
    setDialogOpen(false);
    setSelectedVariant(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        <Button onClick={handleAddVariant} size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No variants found for this product.</p>
            <Button onClick={handleAddVariant} className="mt-4">
              Create First Variant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map((variant) => (
            <Card key={variant.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{variant.variant_name}</CardTitle>
                  <Badge variant={variant.is_active ? 'default' : 'secondary'}>
                    {variant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Code: {variant.variant_code}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {variant.finish_type && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Finish:</span>
                      <span>{variant.finish_type}</span>
                    </div>
                  )}
                  
                  {variant.color && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Color:</span>
                      <span>{variant.color}</span>
                    </div>
                  )}
                  
                  {variant.size_dimensions && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{variant.size_dimensions}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Image className="h-3 w-3" />
                      <span>{variant.additional_images.length} images</span>
                    </div>
                    
                    {variant.model_path && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Box className="h-3 w-3" />
                        <span>3D Model</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button
                    onClick={() => handleEditVariant(variant)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => handleDeleteVariant(variant.id)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductVariantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant={selectedVariant}
        productId={productId}
        productName={productName}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default ProductVariantsManager;
