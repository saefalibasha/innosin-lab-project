
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
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white rounded-2xl">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        <div className="p-8">
          <h3 className="text-xl font-light text-black mb-3 group-hover:text-gray-800 transition-colors duration-300">
            {name}
          </h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed font-light">
            {description}
          </p>
          
          <Link to="/products" className="block">
            <Button 
              variant="outline" 
              className="w-full border-2 border-gray-200 text-black hover:bg-black hover:text-white hover:border-black transition-all duration-300 rounded-full py-3 font-medium group-hover:shadow-lg"
            >
              <span className="flex items-center justify-center">
                View Products 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPreview;
