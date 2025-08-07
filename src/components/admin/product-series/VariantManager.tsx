
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product as ProductType } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';

// Transform any database object to proper DatabaseProduct with defaults
const ensureDatabaseProduct = (rawProduct: any): DatabaseProduct => {
  return {
    id: rawProduct.id || '',
    name: rawProduct.name || '',
    category: rawProduct.category || '',
    dimensions: rawProduct.dimensions || '',
    model_path: rawProduct.model_path || '',
    thumbnail_path: rawProduct.thumbnail_path || '',
    additional_images: rawProduct.additional_images || [],
    description: rawProduct.description || '',
    full_description: rawProduct.full_description || '',
    specifications: rawProduct.specifications || [],
    finish_type: rawProduct.finish_type || '',
    orientation: rawProduct.orientation || '',
    door_type: rawProduct.door_type || '',
    variant_type: rawProduct.variant_type || '',
    drawer_count: rawProduct.drawer_count || 0,
    cabinet_class: rawProduct.cabinet_class || 'standard',
    product_code: rawProduct.product_code || '',
    mounting_type: rawProduct.mounting_type || '',
    mixing_type: rawProduct.mixing_type || '',
    handle_type: rawProduct.handle_type || '',
    emergency_shower_type: rawProduct.emergency_shower_type || '',
    company_tags: rawProduct.company_tags || [],
    product_series: rawProduct.product_series || '',
    parent_series_id: rawProduct.parent_series_id || '',
    is_series_parent: rawProduct.is_series_parent || false,
    is_active: rawProduct.is_active !== undefined ? rawProduct.is_active : true,
    series_model_path: rawProduct.series_model_path || '',
    series_thumbnail_path: rawProduct.series_thumbnail_path || '',
    series_overview_image_path: rawProduct.series_overview_image_path || '',
    overview_image_path: rawProduct.overview_image_path || '',
    series_order: rawProduct.series_order || 0,
    variant_order: rawProduct.variant_order || 0,
    created_at: rawProduct.created_at || '',
    updated_at: rawProduct.updated_at || '',
    editable_title: rawProduct.editable_title || rawProduct.name || '',
    editable_description: rawProduct.editable_description || rawProduct.description || ''
  };
};

const transformDatabaseProduct = (dbProduct: DatabaseProduct): ProductType => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.editable_description || dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.thumbnail_path,
    model_path: dbProduct.model_path,
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    cabinet_class: dbProduct.cabinet_class || 'standard',
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    editable_title: dbProduct.editable_title,
    editable_description: dbProduct.editable_description,
    is_active: dbProduct.is_active || false,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at
  };
};

interface VariantManagerProps {
  seriesId?: string;
}

const VariantManager: React.FC<VariantManagerProps> = ({ seriesId }) => {
  const [variants, setVariants] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (seriesId) {
      fetchVariants();
    }
  }, [seriesId]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('parent_series_id', seriesId)
        .order('variant_order');

      if (error) throw error;
      
      const transformedVariants = (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
      setVariants(transformedVariants);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch variants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading variants...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {variants.map((variant) => (
            <div key={variant.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <h4 className="font-medium">{variant.name}</h4>
                <p className="text-sm text-muted-foreground">{variant.product_code}</p>
                <p className="text-xs text-muted-foreground">Drawers: {variant.drawer_count}</p>
              </div>
              <Badge variant={variant.is_active ? "default" : "secondary"}>
                {variant.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VariantManager;
