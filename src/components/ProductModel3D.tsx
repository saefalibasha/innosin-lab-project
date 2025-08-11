
import React from 'react';

interface ProductModel3DProps {
  modelUrl: string;
  productName: string;
}

const ProductModel3D: React.FC<ProductModel3DProps> = ({ modelUrl, productName }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center p-8">
        <p className="text-gray-500 mb-2">3D Model Preview</p>
        <p className="text-sm text-gray-400">{productName}</p>
        <p className="text-xs text-gray-300 mt-2">Model: {modelUrl}</p>
      </div>
    </div>
  );
};

export default ProductModel3D;
