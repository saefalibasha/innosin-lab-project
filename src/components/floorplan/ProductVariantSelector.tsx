
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Eye, Download } from 'lucide-react';
import { cleanProductName } from '@/lib/productUtils';

interface ProductVariantSelectorProps {
  variants: Array<{
    id: string;
    name: string;
    dimensions?: string;
    thumbnail_path?: string;
    category?: string;
    description?: string;
    specifications?: string[] | { [key: string]: any };
  }>;
  selectedVariant?: string;
  onVariantSelect: (variantId: string) => void;
  onViewDetails?: (variant: any) => void;
  onDownload?: (variant: any) => void;
  className?: string;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantSelect,
  onViewDetails,
  onDownload,
  className = ""
}) => {
  // Helper function to extract first numeric value from dimension string
  const extractNumericValue = (dimensions: string): number => {
    const match = dimensions.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Sort variants by dimensions (length first)
  const sortedVariants = [...variants].sort((a, b) => {
    if (a.dimensions && b.dimensions) {
      return extractNumericValue(a.dimensions) - extractNumericValue(b.dimensions);
    }
    return 0;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">Product Variants</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVariants.map((variant) => (
          <Card 
            key={variant.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedVariant === variant.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onVariantSelect(variant.id)}
          >
            <CardHeader className="pb-3">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {variant.thumbnail_path ? (
                  <img 
                    src={variant.thumbnail_path} 
                    alt={cleanProductName(variant.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <CardTitle className="text-base font-medium line-clamp-2">
                {cleanProductName(variant.name)}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                {variant.category && (
                  <Badge variant="secondary" className="text-xs">
                    {variant.category}
                  </Badge>
                )}
                
                {variant.dimensions && (
                  <p className="text-sm text-gray-600">
                    <strong>Dimensions:</strong> {variant.dimensions}
                  </p>
                )}
                
                {variant.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {variant.description}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 mt-3">
                {onViewDetails && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(variant);
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                )}
                
                {onDownload && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(variant);
                    }}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
