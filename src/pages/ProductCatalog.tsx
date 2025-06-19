
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, Filter, Maximize } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import Product3DViewer from '@/components/Product3DViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AnimatedSection from '@/components/AnimatedSection';
import { products, getCategories } from '@/data/products';
import { Product } from '@/types/product';

const ProductCatalog = () => {
  const { addItem, itemCount } = useRFQ();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const categories = getCategories();

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
      image: product.image
    });
    toast.success(`${product.name} added to quote request`);
  };

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container-custom py-12 pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedSection animation="fade-in" delay={100}>
            <h1 className="text-4xl font-serif font-bold text-primary mb-4">Product Catalog</h1>
          </AnimatedSection>
          <AnimatedSection animation="fade-in" delay={300}>
            <p className="text-xl text-muted-foreground">
              Browse our comprehensive range of laboratory equipment and furniture from leading manufacturers
            </p>
          </AnimatedSection>
          {selectedCategory !== 'all' && (
            <AnimatedSection animation="fade-in" delay={400}>
              <Badge variant="outline" className="mt-4 text-lg px-4 py-2 border-sea text-sea">
                Showing products from: {selectedCategory}
              </Badge>
            </AnimatedSection>
          )}
        </div>

        {/* Filters */}
        <AnimatedSection animation="slide-up" delay={200}>
          <div className="glass-card p-6 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus:border-sea transition-all duration-300"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="focus:border-sea transition-all duration-300">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Manufacturers" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Manufacturers' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-end">
                <Badge variant="secondary" className="text-sm">
                  {filteredProducts.length} products found
                </Badge>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <AnimatedSection key={product.id} animation="bounce-in" delay={100 + index * 100}>
              <Card className="hover:shadow-xl transition-all duration-500 glass-card hover:scale-105 group">
                <CardHeader className="p-0">
                  <div className="relative">
                    <Product3DViewer
                      productType={product.modelType}
                      color={product.modelColor}
                      className="w-full h-48"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                            <Maximize className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle className="font-serif">{product.name} - 3D View</DialogTitle>
                          </DialogHeader>
                          <Product3DViewer
                            productType={product.modelType}
                            color={product.modelColor}
                            className="w-full h-96"
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge variant="outline" className="mb-2 border-sea text-sea">
                      {product.category}
                    </Badge>
                    <CardTitle className="text-lg font-serif font-semibold mb-2 group-hover:text-sea transition-colors">
                      {product.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">
                      Dimensions: {product.dimensions}
                    </p>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4">
                    {product.description}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.specifications.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleAddToQuote(product)}
                    className="w-full bg-sea hover:bg-sea-dark transition-all duration-300 hover:scale-105"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Quote
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* Quote Cart Summary - Fixed positioning to avoid header conflict */}
        {itemCount > 0 && (
          <AnimatedSection animation="slide-in-right" delay={0}>
            <div className="fixed bottom-6 right-6 glass-card text-foreground p-4 rounded-lg shadow-lg animate-float z-40">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-5 h-5 text-sea" />
                <span>{itemCount} items in quote</span>
                <Button size="sm" variant="secondary" asChild>
                  <a href="/rfq-cart">View Cart</a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
