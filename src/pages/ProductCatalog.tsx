
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';

const ProductCatalog = () => {
  const { addItem, itemCount } = useRFQ();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample product data - in a real app this would come from an API
  const products = [
    {
      id: 'fh-001',
      name: 'Chemical Fume Hood - Standard',
      category: 'Fume Hoods',
      dimensions: '1500 × 750 × 2400mm',
      image: '/placeholder.svg',
      description: 'Standard chemical fume hood with variable air volume control and energy-efficient design.',
      specifications: ['VAV Control', 'Energy Efficient', 'ASHRAE 110 Compliant']
    },
    {
      id: 'lb-001',
      name: 'Epoxy Resin Lab Bench',
      category: 'Lab Benches',
      dimensions: '3000 × 750 × 850mm',
      image: '/placeholder.svg',
      description: 'Chemical-resistant epoxy resin lab bench with integrated utilities.',
      specifications: ['Chemical Resistant', 'Integrated Utilities', 'Modular Design']
    },
    {
      id: 'ew-001',
      name: 'Emergency Eye Wash Station',
      category: 'Safety Equipment',
      dimensions: '600 × 400 × 1200mm',
      image: '/placeholder.svg',
      description: 'ANSI Z358.1 compliant emergency eye wash station with stainless steel construction.',
      specifications: ['ANSI Z358.1', 'Stainless Steel', 'Hands-Free Operation']
    },
    {
      id: 'ss-001',
      name: 'Emergency Safety Shower',
      category: 'Safety Equipment',
      dimensions: '900 × 900 × 2300mm',
      image: '/placeholder.svg',
      description: 'Emergency safety shower with thermostatic mixing valve and freeze protection.',
      specifications: ['Thermostatic Valve', 'Freeze Protection', 'Easy Maintenance']
    },
    {
      id: 'sc-001',
      name: 'Chemical Storage Cabinet',
      category: 'Storage Solutions',
      dimensions: '1200 × 600 × 1800mm',
      image: '/placeholder.svg',
      description: 'Fire-resistant chemical storage cabinet with ventilation system.',
      specifications: ['Fire Resistant', 'Ventilated', 'Multiple Shelves']
    },
    {
      id: 'fh-002',
      name: 'Perchloric Acid Fume Hood',
      category: 'Fume Hoods',
      dimensions: '1800 × 750 × 2400mm',
      image: '/placeholder.svg',
      description: 'Specialized fume hood for perchloric acid applications with wash-down system.',
      specifications: ['Wash-down System', 'Specialized Design', 'Corrosion Resistant']
    }
  ];

  const categories = ['all', 'Fume Hoods', 'Lab Benches', 'Safety Equipment', 'Storage Solutions'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToQuote = (product: typeof products[0]) => {
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Catalog</h1>
          <p className="text-xl text-gray-600">
            Browse our comprehensive range of laboratory equipment and furniture
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-3">
                  <Badge variant="outline" className="mb-2">
                    {product.category}
                  </Badge>
                  <CardTitle className="text-lg font-semibold mb-2">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mb-2">
                    Dimensions: {product.dimensions}
                  </p>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
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
                  className="w-full bg-black hover:bg-gray-800"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Quote
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quote Cart Summary */}
        {itemCount > 0 && (
          <div className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-5 h-5" />
              <span>{itemCount} items in quote</span>
              <Button size="sm" variant="secondary" asChild>
                <a href="/rfq-cart">View Cart</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
