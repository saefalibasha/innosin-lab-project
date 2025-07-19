
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Plus, Tag } from 'lucide-react';
import { ProductSeriesSection } from './ProductSeriesSection';
import { AddProductModal } from './AddProductModal';

// Define the Product interface to match our database schema
interface DatabaseProduct {
  id: string;
  name: string;
  product_code: string;
  category: string;
  product_series: string;
  dimensions: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  drawer_count: number;
  description: string;
  full_description: string;
  specifications: any; // Keep as any since it comes from jsonb
  company_tags: string[];
  model_path?: string;
  thumbnail_path?: string;
  additional_images?: string[];
  created_at?: string;
  updated_at?: string;
  editable_title?: string;
  editable_description?: string;
  is_active: boolean;
}

interface ProductSeries {
  seriesName: string;
  products: DatabaseProduct[];
}

export const EnhancedAssetManager = () => {
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompanyTag, setSelectedCompanyTag] = useState<string>('all');
  const [availableCompanyTags, setAvailableCompanyTags] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedCompanyTag]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('product_series', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      const formattedProducts: DatabaseProduct[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        product_code: product.product_code || '',
        category: product.category || '',
        product_series: product.product_series || '',
        dimensions: product.dimensions || '',
        finish_type: product.finish_type || '',
        orientation: product.orientation || '',
        door_type: product.door_type || '',
        drawer_count: product.drawer_count || 0,
        description: product.description || '',
        full_description: product.full_description || '',
        specifications: product.specifications || [],
        company_tags: product.company_tags || [],
        model_path: product.model_path,
        thumbnail_path: product.thumbnail_path,
        additional_images: product.additional_images || [],
        created_at: product.created_at,
        updated_at: product.updated_at,
        editable_title: product.editable_title,
        editable_description: product.editable_description,
        is_active: product.is_active
      }));

      setProducts(formattedProducts);

      // Extract unique company tags
      const allTags = formattedProducts.flatMap(p => p.company_tags || []);
      const uniqueTags = Array.from(new Set(allTags)).sort();
      setAvailableCompanyTags(uniqueTags);

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

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_series.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedCompanyTag !== 'all') {
      filtered = filtered.filter(product => 
        product.company_tags && product.company_tags.includes(selectedCompanyTag)
      );
    }

    setFilteredProducts(filtered);
  };

  const groupProductsBySeries = (products: DatabaseProduct[]): ProductSeries[] => {
    const grouped = products.reduce((acc, product) => {
      const series = product.product_series || 'Uncategorized';
      if (!acc[series]) {
        acc[series] = [];
      }
      acc[series].push(product);
      return acc;
    }, {} as Record<string, DatabaseProduct[]>);

    return Object.entries(grouped).map(([seriesName, products]) => ({
      seriesName,
      products: products.sort((a, b) => a.name.localeCompare(b.name))
    }));
  };

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const productSeries = groupProductsBySeries(filteredProducts);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Laboratory Equipment Manager</h2>
          <p className="text-muted-foreground">
            Comprehensive asset management for all laboratory equipment
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCompanyTag} onValueChange={setSelectedCompanyTag}>
              <SelectTrigger>
                <SelectValue placeholder="All Company Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Company Tags</SelectItem>
                {availableCompanyTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} products found
              </span>
              {(searchTerm || selectedCategory !== 'all' || selectedCompanyTag !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedCompanyTag('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {availableCompanyTags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Available Company Tags:</p>
              <div className="flex flex-wrap gap-2">
                {availableCompanyTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedCompanyTag === tag ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCompanyTag(selectedCompanyTag === tag ? 'all' : tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Series */}
      <div className="space-y-6">
        {productSeries.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <p>No products found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Your First Product
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          productSeries.map((series) => (
            <ProductSeriesSection
              key={series.seriesName}
              seriesName={series.seriesName}
              products={series.products}
              onProductSelect={(product) => console.log('Product selected:', product)}
              onEditProduct={(product) => console.log('Edit product:', product)}
              onProductUpdated={fetchProducts}
            />
          ))
        )}
      </div>

      <AddProductModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={fetchProducts}
      />
    </div>
  );
};
