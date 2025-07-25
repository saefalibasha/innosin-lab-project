
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Package } from 'lucide-react';
import { cleanProductName } from '@/lib/productUtils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    dimensions?: string;
    thumbnail_path?: string;
    description?: string;
    specifications?: string[] | { [key: string]: any };
  };
  onViewDetails?: (product: any) => void;
  onDownload?: (product: any) => void;
  onAddToQuote?: (product: any) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewDetails, 
  onDownload,
  onAddToQuote,
  className = ""
}) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {product.thumbnail_path ? (
            <img 
              src={product.thumbnail_path} 
              alt={cleanProductName(product.name)}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-16 h-16 text-gray-400" />
          )}
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
          {cleanProductName(product.name)}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
          
          {product.dimensions && (
            <p className="text-sm text-gray-600">
              <strong>Dimensions:</strong> {product.dimensions}
            </p>
          )}
          
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {product.description}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 gap-2">
        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(product)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        )}
        
        {onDownload && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onDownload(product)}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
        
        {onAddToQuote && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => onAddToQuote(product)}
            className="flex-1"
          >
            Add to Quote
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
