import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Filter, Plus, Eye, Edit, Trash2, Package } from 'lucide-react';
import { Product } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';

interface SeriesGroup {
  seriesName: string;
  products: Product[];
  totalVariants: number;
  categories: string[];
}

const EnhancedProductSeriesManager = () => {
  const [seriesGroups, setSeriesGroups] = useState<SeriesGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

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

  const transformDatabaseProduct = (dbProduct: DatabaseProduct): Product => {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      category: dbProduct.category,
      dimensions: dbProduct.dimensions || '',
      modelPath: dbProduct.model_path || '',
      thumbnail: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path || '',
      overviewImage: dbProduct.overview_image_path,
      seriesOverviewImage: dbProduct.series_overview_image_path,
      images: dbProduct.additional_images || [],
      description: dbProduct.editable_description || dbProduct.description || '',
      fullDescription: dbProduct.editable_description || dbProduct.full_description || dbProduct.description || '',
      specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
      finishes: [], // Initialize empty array
      variants: [], // Initialize empty array
      finish_type: dbProduct.finish_type,
      orientation: dbProduct.orientation,
      drawer_count: dbProduct.drawer_count || 0,
      door_type: dbProduct.door_type,
      product_code: dbProduct.product_code,
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

  useEffect(() => {
    fetchSeriesData();
  }, []);

  const fetchSeriesData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('product_series', { ascending: true })
        .order('series_order', { ascending: true })
        .order('variant_order', { ascending: true });

      if (error) throw error;

      // Transform raw database response and group by series
      const transformedProducts = (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
        
      // Group products by series
      const seriesMap = new Map<string, Product[]>();
      
      transformedProducts.forEach((product) => {
        const seriesKey = product.product_series || 'Uncategorized';
        if (!seriesMap.has(seriesKey)) {
          seriesMap.set(seriesKey, []);
        }
        seriesMap.get(seriesKey)!.push(product);
      });

      // Convert to SeriesGroup format
      const groups: SeriesGroup[] = Array.from(seriesMap.entries()).map(([seriesName, products]) => ({
        seriesName,
        products,
        totalVariants: products.length,
        categories: [...new Set(products.map(p => p.category))]
      }));

      setSeriesGroups(groups);
    } catch (error) {
      console.error('Error fetching series data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product series data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = seriesGroups.filter(group => {
    const matchesSearch = group.seriesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.products.some(p => 
                           p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (p.product_code?.toLowerCase().includes(searchTerm.toLowerCase()))
                         );

    const matchesCategory = categoryFilter === 'all' || 
                           group.categories.includes(categoryFilter);

    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && group.products.some(p => p.is_active)) ||
                         (statusFilter === 'inactive' && group.products.some(p => !p.is_active));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const uniqueCategories = [...new Set(seriesGroups.flatMap(g => g.categories))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading series data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle>Product Series Manager</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search series or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Series Groups Display */}
      <div className="space-y-4">
        {filteredGroups.map((group) => (
          <Card key={group.seriesName}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.seriesName}</CardTitle>
                <Badge variant="outline">{group.totalVariants} variants</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {group.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">{product.product_code}</p>
                      </div>
                      <Badge 
                        variant={product.is_active ? "default" : "secondary"} 
                        className="text-xs ml-2"
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    {product.dimensions && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {product.dimensions}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No product series found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedProductSeriesManager;
