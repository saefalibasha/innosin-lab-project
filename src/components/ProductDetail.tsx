
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Package, ArrowLeft, Eye } from 'lucide-react';
import { cleanProductName } from '@/lib/productUtils';

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    category: string;
    dimensions?: string;
    thumbnail_path?: string;
    model_path?: string;
    description?: string;
    full_description?: string;
    specifications?: string[] | { [key: string]: any };
    keywords?: string[];
    additional_images?: string[];
  };
  onBack?: () => void;
  onDownload?: (product: any) => void;
  className?: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onDownload,
  className = ""
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {cleanProductName(product.name)}
          </h1>
          <Badge variant="secondary" className="mt-2">
            {product.category}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {product.thumbnail_path ? (
                  <img 
                    src={product.thumbnail_path} 
                    alt={cleanProductName(product.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-24 h-24 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Images */}
          {product.additional_images && product.additional_images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {product.additional_images.map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${cleanProductName(product.name)} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.dimensions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Dimensions</h4>
                  <p className="text-gray-600">{product.dimensions}</p>
                </div>
              )}

              {product.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {product.full_description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Full Description</h4>
                  <p className="text-gray-600">{product.full_description}</p>
                </div>
              )}

              {product.keywords && product.keywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specifications */}
          {product.specifications && (
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(product.specifications) ? (
                  <ul className="space-y-2">
                    {product.specifications.map((spec, index) => (
                      <li key={index} className="text-gray-600">
                        • {spec}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium text-gray-900">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => console.log('View 3D model')}
            >
              <Eye className="w-4 h-4 mr-2" />
              View 3D Model
            </Button>
            
            {onDownload && (
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => onDownload(product)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
