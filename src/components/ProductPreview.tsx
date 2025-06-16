
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductPreviewProps {
  name: string;
  image: string;
  description: string;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ name, image, description }) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-black mb-2">{name}</h3>
          <p className="text-gray-600 mb-4 text-sm">{description}</p>
          
          <Link to="/products">
            <Button 
              variant="outline" 
              className="w-full border-black text-black hover:bg-black hover:text-white transition-colors"
            >
              View Products <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPreview;
