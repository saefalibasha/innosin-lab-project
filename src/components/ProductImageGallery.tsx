
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductImageGalleryProps {
  thumbnail: string;
  images: string[];
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  thumbnail,
  images,
  productName
}) => {
  const [selectedImage, setSelectedImage] = useState(thumbnail || images[0] || '');
  const allImages = [thumbnail, ...images].filter(Boolean);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span>No image available</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImage === image
                      ? 'border-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productName} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImageGallery;
