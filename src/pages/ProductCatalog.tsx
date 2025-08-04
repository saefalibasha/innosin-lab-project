
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
import { Product } from '@/types/product';
import { productPageContent } from '@/data/productPageContent';
import { fetchProductsFromDatabase, fetchCategoriesFromDatabase, subscribeToProductUpdates, unsubscribeFromProductUpdates } from '@/services/productService';
import { usePerformanceLogger } from '@/hooks/usePerformanceLogger';

const ProductCatalog = () => {
  usePerformanceLogger('ProductCatalog');
  const { addItem, itemCount } = useRFQ();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Read category from URL on component mount and handle navigation changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      // Reset to 'all' when no category parameter is present (e.g., "All Products" link)
      setSelectedCategory('all');
    }
  }, [searchParams]);

  // Fetch products and categories from database with performance logging
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.time('ProductCatalog data fetch');
        const [productsData, categoriesData] = await Promise.all([
          fetchProductsFromDatabase(),
          fetchCategoriesFromDatabase()
        ]);
        console.timeEnd('ProductCatalog data fetch');
        
        setProducts(productsData);
        setCategories(categoriesData);
        console.log(`Loaded ${productsData.length} products with variants in ${categoriesData.length} categories`);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for product updates
    const subscription = subscribeToProductUpdates((payload) => {
      console.log('Product update detected in catalog, refreshing data');
      fetchData();
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromProductUpdates(subscription);
    };
  }, []);

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
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
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
          <ProductGrid products={filteredProducts} onAddToQuote={handleAddToQuote} />

          {/* Quote Cart Summary */}
          <QuoteCartSummary itemCount={itemCount} />
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
