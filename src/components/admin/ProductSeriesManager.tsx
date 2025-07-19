
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Grid3X3,
  Building2,
  Tag,
  Users
} from 'lucide-react';
import ProductSeriesDialog from './ProductSeriesDialog';
import ProductVariantsManager from './ProductVariantsManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProductSeries {
  id: string;
  series_name: string;
  series_code: string;
  description?: string;
  brand: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  _count?: {
    products: number;
  };
}

interface Product {
  id: string;
  name: string;
  product_code: string;
  category: string;
  is_active: boolean;
}

const ProductSeriesManager = () => {
  const [series, setSeries] = useState<ProductSeries[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<ProductSeries | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variantsDialogOpen, setVariantsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load series
      const { data: seriesData, error: seriesError } = await supabase
        .from('product_series')
        .select('*')
        .order('series_name');

      if (seriesError) throw seriesError;
      setSeries(seriesData || []);

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, product_code, category, is_active')
        .order('name');

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm('Are you sure you want to delete this series?')) return;

    try {
      const { error } = await supabase
        .from('product_series')
        .delete()
        .eq('id', seriesId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Series deleted successfully",
      });
      
      loadData();
    } catch (error: any) {
      console.error('Error deleting series:', error);
      toast({
        title: "Error",
        description: "Failed to delete series",
        variant: "destructive",
      });
    }
  };

  const handleEditSeries = (seriesItem: ProductSeries) => {
    setSelectedSeries(seriesItem);
  };

  const handleManageVariants = (product: Product) => {
    setSelectedProduct(product);
    setVariantsDialogOpen(true);
  };

  const filteredSeries = series.filter(item =>
    item.series_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.series_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Manage product series and variants</p>
        </div>
        <ProductSeriesDialog 
          onSuccess={loadData}
          trigger={
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Series
            </Button>
          }
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search series or products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Product Series */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Product Series ({filteredSeries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSeries.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No product series found</p>
              <ProductSeriesDialog onSuccess={loadData} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSeries.map((seriesItem) => (
                <Card key={seriesItem.id} className="relative hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{seriesItem.series_name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {seriesItem.series_code}
                          </Badge>
                          <Badge variant={seriesItem.is_active ? 'default' : 'secondary'}>
                            {seriesItem.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{seriesItem.brand}</span>
                      </div>
                      
                      {seriesItem.category && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Tag className="h-4 w-4" />
                          <span>{seriesItem.category}</span>
                        </div>
                      )}
                      
                      {seriesItem.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {seriesItem.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          onClick={() => handleEditSeries(seriesItem)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteSeries(seriesItem.id)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products with Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products & Variants ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {product.product_code}
                          </Badge>
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        <span>{product.category}</span>
                      </div>
                      
                      <Button
                        onClick={() => handleManageVariants(product)}
                        size="sm"
                        className="w-full flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Manage Variants
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Series Dialog */}
      <ProductSeriesDialog
        series={selectedSeries}
        onSuccess={() => {
          loadData();
          setSelectedSeries(null);
        }}
        trigger={<div />}
      />

      {/* Product Variants Dialog */}
      <Dialog open={variantsDialogOpen} onOpenChange={setVariantsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Variants - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductVariantsManager
              productId={selectedProduct.id}
              productName={selectedProduct.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductSeriesManager;
