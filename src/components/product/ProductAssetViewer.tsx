
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductAssetViewerProps {
  currentAssets: {
    thumbnail?: string;
    model?: string;
    images?: string[];
  };
  productName: string;
  productId: string;
}

const ProductAssetViewer: React.FC<ProductAssetViewerProps> = ({
  currentAssets,
  productName,
  productId
}) => {
  const { thumbnail, model, images } = currentAssets;

  console.log('ProductAssetViewer - Assets:', currentAssets);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card>
        <CardContent className="p-6">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={productName}
              className="w-full h-96 object-contain rounded-lg"
              onError={(e) => {
                console.error('Failed to load image:', thumbnail);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Images */}
      {images && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index}>
              <CardContent className="p-2">
                <img 
                  src={image} 
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-32 object-contain rounded"
                  onError={(e) => {
                    console.error('Failed to load additional image:', image);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 3D Model Placeholder */}
      {model && (
        <Card>
          <CardContent className="p-6">
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">3D Model: {model}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductAssetViewer;
