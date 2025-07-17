
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  const products = [
    {
      id: '1',
      name: 'Premium Cube',
      price: '$299',
      description: 'A beautifully crafted geometric cube with premium materials and modern design.',
      productType: 'box' as const,
      color: '#4F46E5',
      category: 'geometric'
    },
    {
      id: '2',
      name: 'Sphere Collection',
      price: '$199',
      description: 'Elegant spherical design perfect for modern interiors and contemporary spaces.',
      productType: 'sphere' as const,
      color: '#DC2626',
      category: 'organic'
    },
    {
      id: '3',
      name: 'Cone Series',
      price: '$149',
      description: 'Unique conical shape that adds visual interest to any room or office space.',
      productType: 'cone' as const,
      color: '#059669',
      category: 'geometric'
    },
    {
      id: '4',
      name: 'Azure Cube',
      price: '$349',
      description: 'Limited edition cube with azure blue finish and premium craftsmanship.',
      productType: 'box' as const,
      color: '#0EA5E9',
      category: 'limited'
    },
    {
      id: '5',
      name: 'Golden Sphere',
      price: '$449',
      description: 'Luxurious golden sphere that adds elegance to any sophisticated setting.',
      productType: 'sphere' as const,
      color: '#EAB308',
      category: 'luxury'
    },
    {
      id: '6',
      name: 'Emerald Cone',
      price: '$199',
      description: 'Stunning emerald green cone with exceptional attention to detail.',
      productType: 'cone' as const,
      color: '#10B981',
      category: 'geometric'
    }
  ];

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterBy === 'all' || product.category === filterBy)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseInt(a.price.slice(1)) - parseInt(b.price.slice(1));
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Catalog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our complete collection of innovative 3D products. Each item is carefully designed and crafted for excellence.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
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
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="geometric">Geometric</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="limited">Limited Edition</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price">Price (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{product.description}</p>
              <div className="text-xl font-bold text-blue-600 mb-4">{product.price}</div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
