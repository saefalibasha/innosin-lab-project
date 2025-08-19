
import React from 'react';
import { Product } from '@/types/product';

interface ProductCarouselProps {
  product: Product;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ product }) => {
  return (
    <div className="w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center">
      {product.thumbnail ? (
        <img 
          src={product.thumbnail} 
          alt={product.name}
          className="w-full h-full object-cover rounded-md"
        />
      ) : (
        <div className="text-gray-400 text-center">
          <p>Product Image</p>
          <p className="text-sm">{product.name}</p>
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
