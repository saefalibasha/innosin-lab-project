
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Settings,
  AlertTriangle,
  Image,
  Box,
  Check,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';
import MissingModelsTracker from '../MissingModelsTracker';
import { useMissingModelsTracker } from '@/hooks/useMissingModelsTracker';

// Transform database product to Product interface
const transformDatabaseProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id || '',
    name: dbProduct.editable_title || dbProduct.name || '',
    category: dbProduct.category || '',
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.series_model_path || dbProduct.model_path || '',
    thumbnail: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.editable_description || dbProduct.description || '',
    fullDescription: dbProduct.editable_description || dbProduct.full_description || '',
    specifications: dbProduct.specifications || [],
    finishes: [],
    variants: [],
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path,
    model_path: dbProduct.series_model_path || dbProduct.model_path,
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    cabinet_class: dbProduct.cabinet_class || 'standard',
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    editable_title: dbProduct.editable_title,
    editable_description: dbProduct.editable_description,
    is_active: dbProduct.is_active !== false,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    overviewImage: dbProduct.overview_image_path,
    seriesOverviewImage: dbProduct.series_overview_image_path,
    parent_series_id: dbProduct.parent_series_id,
    baseProductId: dbProduct.parent_series_id
  };
};

interface ProductSeriesWithStats {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail_path: string;
  model_path: string;
  is_active: boolean;
  variant_count: number;
  completion_percentage: number;
  missing_assets: string[];
  company_tags: string[];
  variants: Product[];
}

export const EnhancedProductSeriesManager = () => {
  const [series, setSeries] = useState<ProductSeriesWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const missingModelsTracker = useMissingModelsTracker();

  useEffect(() => {
    fetchProductSeries();
  }, []);

  const fetchProductSeries = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching product series from database...');

      // Fetch all products to group by series
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('product_series', { ascending: true })
        .order('name', { ascending: true });

      if (productsError) throw productsError;

      if (!allProducts || allProducts.length === 0) {
        console.log('⚠️ No products found in database');
        setSeries([]);
        return;
      }

      // Group products by series
      const seriesMap = new Map<string, any[]>();
      const categoriesSet = new Set<string>();

      allProducts.forEach(product => {
        const seriesKey = product.product_series || product.category || 'Uncategorized';
        if (!seriesMap.has(seriesKey)) {
          seriesMap.set(seriesKey, []);
        }
        seriesMap.get(seriesKey)!.push(product);
        
        if (product.category) {
          categoriesSet.add(product.category);
        }
      });

      setCategories(['all', ...Array.from(categoriesSet)]);

      // Calculate stats for each series
      const seriesWithStats: ProductSeriesWithStats[] = Array.from(seriesMap.entries()).map(([seriesName, products]) => {
        const seriesMain = products.find(p => p.is_series_parent) || products[0];
        const variants = products.filter(p => !p.is_series_parent).map(transformDatabaseProduct);
        
        // Calculate completion metrics
        const hasDescription = Boolean(seriesMain.editable_description || seriesMain.description);
        const hasThumbnail = Boolean(seriesMain.series_thumbnail_path || seriesMain.thumbnail_path);
        const hasModel = Boolean(seriesMain.series_model_path || seriesMain.model_path);
        const hasVariants = variants.length > 0;
        
        const completionFields = [hasDescription, hasThumbnail, hasModel, hasVariants];
        const completedFields = completionFields.filter(Boolean).length;
        const completion_percentage = Math.round((completedFields / completionFields.length) * 100);
        
        // Track missing assets
        const missing_assets = [];
        if (!hasDescription) missing_assets.push('Description');
        if (!hasThumbnail) missing_assets.push('Thumbnail');
        if (!hasModel) missing_assets.push('3D Model');
        if (!hasVariants) missing_assets.push('Variants');

        return {
          id: seriesMain.id,
          name: seriesMain.editable_title || seriesMain.name,
          category: seriesMain.category || 'Uncategorized',
          description: seriesMain.editable_description || seriesMain.description || '',
          thumbnail_path: seriesMain.series_thumbnail_path || seriesMain.thumbnail_path || '',
          model_path: seriesMain.series_model_path || seriesMain.model_path || '',
          is_active: seriesMain.is_active !== false,
          variant_count: variants.length,
          completion_percentage,
          missing_assets,
          company_tags: seriesMain.company_tags || [],
          variants
        };
      });

      setSeries(seriesWithStats);
      console.log(`✅ Successfully loaded ${seriesWithStats.length} product series`);
      
    } catch (error) {
      console.error('Error fetching product series:', error);
      toast.error('Failed to load product series');
    } finally {
      setLoading(false);
    }
  };

  // Filter series based on search term and category
  const filteredSeries = series.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.company_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleTrackMissingModel = (productId: string, productName: string) => {
    missingModelsTracker.trackMissingModel(productId, productName);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Enhanced Product Series Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <div className="text-muted-foreground">Loading product series...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{series.length}</div>
            <div className="text-sm text-muted-foreground">Product Series</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {series.filter(s => s.is_active).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Series</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {series.reduce((acc, s) => acc + s.variant_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Variants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(series.reduce((acc, s) => acc + s.completion_percentage, 0) / series.length || 0)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Models Tracker */}
      <MissingModelsTracker
        missingModels={missingModelsTracker.missingModels}
        onClearModel={missingModelsTracker.clearMissingModel}
        onClearAll={missingModelsTracker.clearAllMissingModels}
      />

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search product series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Badge variant="outline">
              {filteredSeries.length} series found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Series Grid */}
      {filteredSeries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Product Series Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No series match your search criteria.' 
                : 'Start by adding your first product series.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeries.map((seriesItem) => (
            <Card key={seriesItem.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{seriesItem.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {seriesItem.category}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {seriesItem.company_tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant={seriesItem.is_active ? "default" : "secondary"}>
                    {seriesItem.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {seriesItem.description || 'No description available'}
                  </p>
                </div>
                
                {/* Asset Status */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    {seriesItem.thumbnail_path ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Box className="w-3 h-3" />
                    {seriesItem.model_path ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span className="font-medium">{seriesItem.variant_count}</span>
                  </div>
                </div>
                
                {/* Missing Assets Alert */}
                {seriesItem.missing_assets.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Missing: {seriesItem.missing_assets.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Completion Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-medium">{seriesItem.completion_percentage}%</span>
                  </div>
                  <Progress value={seriesItem.completion_percentage} className="h-2" />
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Variants
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedProductSeriesManager;
