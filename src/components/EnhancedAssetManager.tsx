import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, Filter, Plus, Eye, Edit, Trash2, Package, Upload, Download } from 'lucide-react';
import ProductFormDialog from './admin/ProductFormDialog';
import ProductViewDialog from './admin/ProductViewDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Product } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';

const EnhancedAssetManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [finishFilter, setFinishFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

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
      thumbnail: dbProduct.thumbnail_path || '',
      images: dbProduct.additional_images || [],
      description: dbProduct.description || '',
      fullDescription: dbProduct.editable_description || dbProduct.full_description || dbProduct.description || '',
      specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
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

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const handleProductSaved = () => {
    fetchProducts();
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewOpen(true);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.product_code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (product.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (product.company_tags?.some(tag => 
                             tag.toLowerCase().includes(searchTerm.toLowerCase())
                           ));

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesFinish = finishFilter === 'all' || product.finish_type === finishFilter;
      const matchesSeries = seriesFilter === 'all' || product.product_series === seriesFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && product.is_active) ||
                           (statusFilter === 'inactive' && !product.is_active);

      return matchesSearch && matchesCategory && matchesFinish && matchesSeries && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Product] as string;
      let bValue = b[sortBy as keyof Product] as string;

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue || '').getTime().toString();
        bValue = new Date(bValue || '').getTime().toString();
      }

      if (sortOrder === 'asc') {
        return (aValue || '').localeCompare(bValue || '');
      } else {
        return (bValue || '').localeCompare(aValue || '');
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, finishFilter, seriesFilter, statusFilter, sortBy, sortOrder]);

  const uniqueCategories = [...new Set(products.map(p => p.category))];
  const uniqueFinishes = [...new Set(products.map(p => p.finish_type).filter(Boolean))];
  const uniqueSeries = [...new Set(products.map(p => p.product_series).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters & Search Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle>Filters & Search</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, code, description, or keywords..."
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

              <Select value={finishFilter} onValueChange={setFinishFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Finish" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Finishes</SelectItem>
                  {uniqueFinishes.map(finish => (
                    <SelectItem key={finish} value={finish!}>{finish}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={seriesFilter} onValueChange={setSeriesFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {uniqueSeries.map(series => (
                    <SelectItem key={series} value={series!}>{series}</SelectItem>
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

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="product_code">Product Code</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="updated_at">Last Modified</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.product_code}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{product.category}</span>
              </div>
              
              {product.dimensions && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Dimensions:</span> {product.dimensions}
                </p>
              )}
              
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
              
              {product.company_tags && product.company_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.company_tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product.company_tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.company_tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(product)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <Button
                  variant={product.is_active ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleProductStatus(product.id, product.is_active || false)}
                >
                  {product.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ProductFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={editingProduct}
        onProductSaved={handleProductSaved}
      />

      <ProductViewDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        product={selectedProduct}
        onEdit={handleEdit}
        onDelete={handleDeleteProduct}
        onToggleStatus={toggleProductStatus}
      />
    </div>
  );
};

export default EnhancedAssetManager;
