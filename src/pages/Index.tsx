
import React from 'react';
import Navigation from '@/components/Navigation';
import ProductCard from '@/components/ProductCard';
import Product3DViewer from '@/components/Product3DViewer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const featuredProducts = [
    {
      id: '1',
      name: 'Premium Cube',
      price: '$299',
      description: 'A beautifully crafted geometric cube with premium materials and modern design.',
      productType: 'box' as const,
      color: '#4F46E5'
    },
    {
      id: '2',
      name: 'Sphere Collection',
      price: '$199',
      description: 'Elegant spherical design perfect for modern interiors and contemporary spaces.',
      productType: 'sphere' as const,
      color: '#DC2626'
    },
    {
      id: '3',
      name: 'Cone Series',
      price: '$149',
      description: 'Unique conical shape that adds visual interest to any room or office space.',
      productType: 'cone' as const,
      color: '#059669'
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, number: '10K+', label: 'Happy Customers' },
    { icon: <Star className="w-6 h-6" />, number: '4.9', label: 'Average Rating' },
    { icon: <Award className="w-6 h-6" />, number: '50+', label: 'Design Awards' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Experience Products in
                <span className="text-blue-600 block">3D Reality</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Discover our innovative collection through immersive 3D models. 
                Rotate, zoom, and explore every detail before you buy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/catalog">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                    Explore Catalog <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="px-8 py-3">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Product3DViewer 
                productType="box" 
                color="#4F46E5"
                className="w-full max-w-md h-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular items, each designed with precision and crafted with care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/catalog">
              <Button size="lg" variant="outline" className="px-8 py-3">
                View All Products <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of customers who have already transformed their spaces with our innovative products.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
