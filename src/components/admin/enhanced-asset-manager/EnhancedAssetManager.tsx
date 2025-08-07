
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Filter, Plus, Eye, Edit, Trash2, Package, Upload, Download } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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

const EnhancedAssetManager = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Transform raw database response to proper DatabaseProduct objects, then to Product objects
      const transformedProducts = (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced Asset Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-muted-foreground">{product.product_code}</p>
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAssetManager;
