
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  dimensions: string;
  material: string;
  features: string[];
  image: string;
}

const ProductComparison = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Standard Fume Hood',
      category: 'Fume Hoods',
      price: '$8,500',
      dimensions: '1500 x 750 x 2400mm',
      material: 'Stainless Steel',
      features: ['Variable Air Volume', 'Safety Glass', 'Digital Display'],
      image: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Premium Fume Hood',
      category: 'Fume Hoods',
      price: '$12,000',
      dimensions: '1800 x 900 x 2400mm',
      material: 'Epoxy Resin',
      features: ['Variable Air Volume', 'Safety Glass', 'Digital Display', 'Auto Sash'],
      image: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Compact Lab Bench',
      category: 'Lab Benches',
      price: '$2,500',
      dimensions: '1200 x 600 x 850mm',
      material: 'Phenolic Resin',
      features: ['Chemical Resistant', 'Storage Drawers', 'Power Outlets'],
      image: '/placeholder.svg'
    }
  ];

  const addToComparison = (product: Product) => {
    if (selectedProducts.length < 3 && !selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeFromComparison = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const clearComparison = () => {
    setSelectedProducts([]);
  };

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Products to Compare (Max 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleProducts.map(product => (
              <div key={product.id} className="border rounded-lg p-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.category}</p>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => addToComparison(product)}
                  disabled={selectedProducts.length >= 3 || selectedProducts.find(p => p.id === product.id) !== undefined}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {selectedProducts.find(p => p.id === product.id) ? 'Added' : 'Compare'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product Comparison</CardTitle>
            <Button variant="outline" size="sm" onClick={clearComparison}>
              Clear All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Feature</th>
                    {selectedProducts.map(product => (
                      <th key={product.id} className="text-center p-4">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => removeFromComparison(product.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded mx-auto mb-2"
                          />
                          <div className="font-medium text-sm">{product.name}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Price</td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        <Badge variant="secondary">{product.price}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Dimensions</td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center text-sm">
                        {product.dimensions}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Material</td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        {product.material}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">Features</td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        <div className="space-y-1">
                          {product.features.map(feature => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductComparison;
