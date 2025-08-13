import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Ruler, Package, Eye, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';

interface VariantSelectorProps {
  baseProduct: Product;
  seriesSlug?: string;
  onVariantSelect: (variant: Product) => void;
  onAddToRFQ: (product: Product) => void;
}

interface VariantFilters {
  dimensions?: string;
  door_type?: string;
  orientation?: string;
  finish_type?: string;
  mounting_type?: string;
  mixing_type?: string;
  handle_type?: string;
  emergency_shower_type?: string;
  number_of_drawers?: number;
}

// Helper function to convert database result to Product
const convertDatabaseResultToProduct = (dbResult: any): Product => ({
  id: dbResult.id,
  name: dbResult.name,
  category: dbResult.category,
  dimensions: dbResult.dimensions || '',
  modelPath: dbResult.model_path || '',
  thumbnail: dbResult.thumbnail_path || '',
  images: dbResult.additional_images || [],
  description: dbResult.description || '',
  fullDescription: dbResult.full_description || '',
  specifications: dbResult.specifications || [],
  finishes: [],
  variants: [],
  finish_type: dbResult.finish_type,
  orientation: dbResult.orientation,
  drawer_count: dbResult.drawer_count || 0,
  door_type: dbResult.door_type,
  product_code: dbResult.product_code,
  thumbnail_path: dbResult.thumbnail_path,
  model_path: dbResult.model_path,
  mounting_type: dbResult.mounting_type,
  mixing_type: dbResult.mixing_type,
  handle_type: dbResult.handle_type,
  company_tags: dbResult.company_tags || [],
  product_series: dbResult.product_series,
  cabinet_class: dbResult.cabinet_class,
  emergency_shower_type: dbResult.emergency_shower_type,
  editable_title: dbResult.editable_title,
  editable_description: dbResult.editable_description,
  overviewImage: dbResult.overview_image_path,
  seriesOverviewImage: dbResult.series_overview_image_path,
  created_at: dbResult.created_at,
  updated_at: dbResult.updated_at,
  is_active: dbResult.is_active,
  parent_series_id: dbResult.parent_series_id
});

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  baseProduct,
  seriesSlug,
  onVariantSelect,
  onAddToRFQ
}) => {
  const [variants, setVariants] = useState<Product[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<Product[]>([]);
  const [filters, setFilters] = useState<VariantFilters>({});
  const [availableOptions, setAvailableOptions] = useState<{
    dimensions: string[];
    door_types: string[];
    orientations: string[];
    finish_types: string[];
    mounting_types: string[];
    mixing_types: string[];
    handle_types: string[];
    emergency_shower_types: string[];
    drawer_counts: number[];
  }>({
    dimensions: [],
    door_types: [],
    orientations: [],
    finish_types: [],
    mounting_types: [],
    mixing_types: [],
    handle_types: [],
    emergency_shower_types: [],
    drawer_counts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVariants();
  }, [baseProduct.id, seriesSlug]);

  useEffect(() => {
    applyFilters();
  }, [filters, variants]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_series_parent', false);

      // Use seriesSlug for special grouping logic
      if (seriesSlug) {
        if (seriesSlug.includes('broen-lab-emergency-shower')) {
          query = query.eq('category', 'Broen-Lab Emergency Shower');
        } else if (seriesSlug.includes('broen-lab-uniflex')) {
          query = query.eq('category', 'Broen-Lab UNIFLEX Taps');
        } else if (seriesSlug.includes('fume-hood')) {
          query = query.or('category.eq.Safe Aire II Fume Hoods,category.eq.Fume Hood - NOCE Series');
        } else {
          query = query.eq('parent_series_id', baseProduct.id);
        }
      } else {
        query = query.eq('parent_series_id', baseProduct.id);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      const variantData = (data || []).map(convertDatabaseResultToProduct);
      setVariants(variantData);
      
      // Extract available options using correct property names
      const options = {
        dimensions: [...new Set(variantData.map(v => v.dimensions).filter(Boolean))],
        door_types: [...new Set(variantData.map(v => v.door_type).filter(Boolean))],
        orientations: [...new Set(variantData.map(v => v.orientation).filter(Boolean))],
        finish_types: [...new Set(variantData.map(v => v.finish_type).filter(Boolean))],
        mounting_types: [...new Set(variantData.map(v => v.mounting_type).filter(Boolean))],
        mixing_types: [...new Set(variantData.map(v => v.mixing_type).filter(Boolean))],
        handle_types: [...new Set(variantData.map(v => v.handle_type).filter(Boolean))],
        emergency_shower_types: [...new Set(variantData.map(v => v.emergency_shower_type).filter(Boolean))],
        drawer_counts: [...new Set(variantData.map(v => v.drawer_count).filter(d => d !== undefined && d !== null && d > 0))]
      };
      
      setAvailableOptions(options);
      
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = variants;

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        filtered = filtered.filter(variant => {
          if (key === 'number_of_drawers') {
            return variant.drawer_count === value;
          }
          return variant[key as keyof Product] === value;
        });
      }
    });

    setFilteredVariants(filtered);
  };

  const handleFilterChange = (filterKey: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value === 'all' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading variants...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variants.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No variants available for this product.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Configurator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure your product by selecting from available options below.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableOptions.dimensions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Select onValueChange={(value) => handleFilterChange('dimensions', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dimensions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dimensions</SelectItem>
                  {availableOptions.dimensions.map(dim => (
                    <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.door_types.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="door_type">Door Type</Label>
              <Select onValueChange={(value) => handleFilterChange('door_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select door type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Door Types</SelectItem>
                  {availableOptions.door_types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.orientations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select onValueChange={(value) => handleFilterChange('orientation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orientations</SelectItem>
                  {availableOptions.orientations.map(orientation => (
                    <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.finish_types.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="finish_type">Finish Type</Label>
              <Select onValueChange={(value) => handleFilterChange('finish_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select finish" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Finishes</SelectItem>
                  {availableOptions.finish_types.map(finish => (
                    <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.mounting_types.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="mounting_type">Mounting Type</Label>
              <Select onValueChange={(value) => handleFilterChange('mounting_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mounting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mounting Types</SelectItem>
                  {availableOptions.mounting_types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.mixing_types.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="mixing_type">Mixing Type</Label>
              <Select onValueChange={(value) => handleFilterChange('mixing_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mixing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Mixing Types</SelectItem>
                  {availableOptions.mixing_types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.handle_types.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="handle_type">Handle Type</Label>
              <Select onValueChange={(value) => handleFilterChange('handle_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select handle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Handle Types</SelectItem>
                  {availableOptions.handle_types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.emergency_shower_types.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="emergency_shower_type">Emergency Shower Type</Label>
              <Select onValueChange={(value) => handleFilterChange('emergency_shower_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shower type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shower Types</SelectItem>
                  {availableOptions.emergency_shower_types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.drawer_counts.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="number_of_drawers">Number of Drawers</Label>
              <Select onValueChange={(value) => handleFilterChange('number_of_drawers', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drawer count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drawer Counts</SelectItem>
                  {availableOptions.drawer_counts.map(count => (
                    <SelectItem key={count} value={count.toString()}>{count} Drawers</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {Object.keys(filters).some(key => filters[key as keyof VariantFilters] !== undefined) && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredVariants.length} of {variants.length} variants shown
            </span>
          </div>
        )}

        <Separator />

        {/* Variant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVariants.map((variant) => (
            <Card key={variant.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">{variant.name}</h4>
                    {variant.product_code && (
                      <p className="text-xs text-muted-foreground">{variant.product_code}</p>
                    )}
                  </div>

                  {variant.dimensions && (
                    <div className="flex items-center gap-2 text-xs">
                      <Ruler className="h-3 w-3" />
                      <span>{variant.dimensions}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {variant.finish_type && (
                      <Badge variant="secondary" className="text-xs">{variant.finish_type}</Badge>
                    )}
                    {variant.door_type && (
                      <Badge variant="secondary" className="text-xs">{variant.door_type}</Badge>
                    )}
                    {variant.orientation && (
                      <Badge variant="secondary" className="text-xs">{variant.orientation}</Badge>
                    )}
                    {variant.mounting_type && (
                      <Badge variant="secondary" className="text-xs">{variant.mounting_type}</Badge>
                    )}
                    {variant.mixing_type && (
                      <Badge variant="secondary" className="text-xs">{variant.mixing_type}</Badge>
                    )}
                    {variant.handle_type && (
                      <Badge variant="secondary" className="text-xs">{variant.handle_type}</Badge>
                    )}
                    {variant.emergency_shower_type && (
                      <Badge variant="secondary" className="text-xs">{variant.emergency_shower_type}</Badge>
                    )}
                    {variant.drawer_count !== undefined && variant.drawer_count > 0 && (
                      <Badge variant="secondary" className="text-xs">{variant.drawer_count} Drawers</Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onVariantSelect(variant)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => onAddToRFQ(variant)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add to RFQ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVariants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No variants match your current filter selection.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
