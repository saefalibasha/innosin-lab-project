
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import AnimatedSection from '@/components/AnimatedSection';
import ProductFilters from '@/components/ProductFilters';
import ProductGrid from '@/components/ProductGrid';
import QuoteCartSummary from '@/components/QuoteCartSummary';
import CompanyLandingHeader from '@/components/CompanyLandingHeader';
import { getProductsAsync, getCategories } from '@/data/products';
import { Product } from '@/types/product';
import { productPageContent } from '@/data/productPageContent';

const ProductCatalog = () => {
  const { addItem, itemCount } = useRFQ();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products and categories from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [loadedProducts, loadedCategories] = await Promise.all([
          getProductsAsync(),
          getCategories()
        ]);
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Read category from URL on component mount and handle navigation changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToQuote = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      dimensions: product.dimensions,
      image: product.thumbnail
    });
    toast.success(`${product.name} ${productPageContent.productDetail.addToQuoteSuccess}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <div className="container-custom py-12">
            <div className="text-center mb-12">
              <div className="h-12 bg-gray-200 animate-pulse rounded mb-4" />
              <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-4">
                  <div className="w-full h-48 bg-gray-200 animate-pulse rounded" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded" />
                    <div className="h-6 bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <div className="container-custom py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Products</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        {/* Company-specific header for branded categories */}
        {selectedCategory !== 'all' && categories.includes(selectedCategory) && (
          <CompanyLandingHeader productsCount={filteredProducts.length} />
        )}
        
        <div className="container-custom py-12">
          {/* Header for general catalog or All Products */}
          {(selectedCategory === 'all' || !categories.includes(selectedCategory)) && (
            <div className="text-center mb-12">
              <AnimatedSection animation="fade-in" delay={100}>
                <h1 className="text-4xl font-serif font-bold text-primary mb-4">{productPageContent.catalog.title}</h1>
              </AnimatedSection>
              <AnimatedSection animation="fade-in" delay={300}>
                <p className="text-xl text-muted-foreground">
                  {productPageContent.catalog.description}
                </p>
              </AnimatedSection>
              {selectedCategory !== 'all' && (
                <AnimatedSection animation="fade-in" delay={400}>
                  <Badge variant="outline" className="mt-4 text-lg px-4 py-2 border-sea text-sea">
                    {productPageContent.catalog.showingProductsText} {selectedCategory}
                  </Badge>
                </AnimatedSection>
              )}
            </div>
          )}

          {/* Filters */}
          <ProductFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            filteredProductsCount={filteredProducts.length}
          />

          {/* Products Grid */}
          {filteredProducts.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} onAddToQuote={handleAddToQuote} />
          )}

          {/* Quote Cart Summary */}
          <QuoteCartSummary itemCount={itemCount} />
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
