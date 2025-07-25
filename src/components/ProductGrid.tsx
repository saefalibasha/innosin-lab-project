
import React from 'react';
import { ProductCard } from './ProductCard';
import { cleanProductNames } from '@/lib/productUtils';

interface ProductGridProps {
  products: any[];
  onViewDetails?: (product: any) => void;
  onDownload?: (product: any) => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onViewDetails, 
  onDownload,
  className = ""
}) => {
  const cleanedProducts = cleanProductNames(products);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {cleanedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetails={onViewDetails}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
};
