
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductComparison = () => {
  const [selectedProducts, setSelectedProducts] = useState([1, 2]);

  const products = [
    {
      id: 1,
      name: "Standard Fume Hood",
      category: "Broen-Lab",
      // PRODUCT IMAGE - Replace with: public/product-comparison/fume-hood-standard.jpg
      // Current: Placeholder image, should show standard fume hood
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
      features: {
        "Airflow Control": true,
        "LED Lighting": false,
        "Digital Display": false,
        "Emergency Alarm": true,
        "Auto Sash": false,
        "Energy Efficient": false
      },
      specifications: ["Basic ventilation", "Manual controls", "Standard lighting"]
    },
    {
      id: 2,
      name: "Premium Fume Hood",
      category: "Broen-Lab",
      // PRODUCT IMAGE - Replace with: public/product-comparison/fume-hood-premium.jpg
      // Current: Placeholder image, should show premium fume hood
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      features: {
        "Airflow Control": true,
        "LED Lighting": true,
        "Digital Display": true,
        "Emergency Alarm": true,
        "Auto Sash": true,
        "Energy Efficient": true
      },
      specifications: ["Advanced ventilation", "Digital controls", "LED lighting", "Auto-adjusting sash"]
    },
    {
      id: 3,
      name: "Compact Lab Bench",
      category: "Hamilton Laboratory Solutions",
      // PRODUCT IMAGE - Replace with: public/product-comparison/lab-bench-compact.jpg
      // Current: Placeholder image, should show compact lab bench
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
      features: {
        "Airflow Control": false,
        "LED Lighting": true,
        "Digital Display": false,
        "Emergency Alarm": false,
        "Auto Sash": false,
        "Energy Efficient": true
      },
      specifications: ["Chemical resistant surface", "Integrated storage", "Ergonomic design"]
    }
  ];

  const toggleProduct = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      if (selectedProducts.length > 1) {
        setSelectedProducts(selectedProducts.filter(id => id !== productId));
      }
    } else {
      if (selectedProducts.length < 3) {
        setSelectedProducts([...selectedProducts, productId]);
      }
    }
  };

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
  const allFeatures = [...new Set(products.flatMap(p => Object.keys(p.features)))];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-serif font-bold text-primary mb-6 tracking-tight">
          Compare <span className="text-sea">Products</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
          Select up to 3 products to compare their features and specifications side by side
        </p>
      </div>

      {/* Product Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card 
            key={product.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedProducts.includes(product.id) 
                ? 'ring-2 ring-sea bg-sea/5' 
                : 'hover:scale-105'
            }`}
            onClick={() => toggleProduct(product.id)}
          >
            <CardHeader className="p-0">
              <img
                src={product.image}
                alt={`${product.name} - Replace with actual product image`}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </CardHeader>
            <CardContent className="p-4">
              <Badge variant="outline" className="mb-2 border-sea text-sea">
                {product.category}
              </Badge>
              <h3 className="text-lg font-serif font-semibold text-primary">
                {product.name}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      {selectedProducts.length > 1 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-serif">
              Product Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-serif">Features</th>
                    {selectedProductsData.map((product) => (
                      <th key={product.id} className="text-center p-4 font-serif">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature) => (
                    <tr key={feature} className="border-b hover:bg-secondary/50">
                      <td className="p-4 font-medium">{feature}</td>
                      {selectedProductsData.map((product) => (
                        <td key={product.id} className="text-center p-4">
                          {product.features[feature] ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <Button asChild size="lg" className="bg-sea hover:bg-sea-dark">
                <Link to="/products">
                  View Full Catalog <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductComparison;
