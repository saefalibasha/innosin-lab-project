
import React from 'react';
import Product3DViewer from './Product3DViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  description: string;
  productType?: 'box' | 'sphere' | 'cone';
  color?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  description,
  productType = 'box',
  color = '#4F46E5'
}) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="p-0">
        <Product3DViewer 
          productType={productType} 
          color={color}
          className="w-full h-48"
        />
      </CardHeader>
      
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
          {name}
        </CardTitle>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>
        <div className="text-xl font-bold text-blue-600">
          {price}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
