import React, { useState, useEffect } from 'react';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface ProductDimensionEditorProps {
  selectedProduct: string | null;
  allProducts: PlacedProduct[];
  onProductUpdate: (updatedProduct: PlacedProduct) => void;
  onProductDelete: (productId: string) => void;
  onClose: () => void;
}

const ProductDimensionEditor: React.FC<ProductDimensionEditorProps> = ({
  selectedProduct,
  allProducts,
  onProductUpdate,
  onProductDelete,
  onClose
}) => {
  const [name, setName] = useState('');
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [color, setColor] = useState('');

  useEffect(() => {
    if (selectedProduct) {
      const currentProduct = allProducts.find(p => p.id === selectedProduct);

      if (currentProduct) {
        setName(currentProduct.name);
        setLength(currentProduct.dimensions.length);
        setWidth(currentProduct.dimensions.width);
        setHeight(currentProduct.dimensions.height);
        setRotation(currentProduct.rotation);
        setScale(currentProduct.scale);
        setColor(currentProduct.color || '');
      }
    }
  }, [selectedProduct, allProducts]);

  const handleSave = () => {
    if (selectedProduct) {
      const updatedProduct: PlacedProduct = {
        id: selectedProduct,
        productId: selectedProduct, // Assuming productId is same as id for now
        name: name,
        category: 'Innosin Lab', // Default category
        dimensions: {
          length: length,
          width: width,
          height: height
        },
        position: { x: 0, y: 0 }, // Position doesn't change here
        rotation: rotation,
        scale: scale,
        color: color
      };
      onProductUpdate(updatedProduct);
      onClose();
    }
  };

  const handleDelete = () => {
    if (selectedProduct) {
      onProductDelete(selectedProduct);
      onClose();
    }
  };

  const currentProduct = allProducts.find(p => 
    typeof p === 'object' && p !== null && 'type' in p && (p as any).type === selectedProduct
  );

  const productById = allProducts.find(p => 
    typeof p === 'object' && p !== null && 'id' in p && (p as any).id === selectedProduct
  );

  const matchingProduct = allProducts.find(p => 
    typeof p === 'object' && p !== null && 'type' in p && (p as any).type === selectedProduct
  );

  if (matchingProduct && typeof matchingProduct === 'object') {
    const modelPath = 'modelPath' in matchingProduct ? (matchingProduct as any).modelPath : undefined;
    const thumbnail = 'thumbnail' in matchingProduct ? (matchingProduct as any).thumbnail : undefined;
    
  }

  const productItem = allProducts.find(p => 
    typeof p === 'object' && p !== null && 'id' in p && (p as any).id === selectedProduct
  );

  if (productItem && typeof productItem === 'object') {
    const modelPath = 'modelPath' in productItem ? (productItem as any).modelPath : undefined;
    const thumbnail = 'thumbnail' in productItem ? (productItem as any).thumbnail : undefined;
    const size = 'size' in productItem ? (productItem as any).size : undefined;
    
  }

  const product1 = allProducts.find(p => 
    typeof p === 'object' && p !== null && 'type' in p && (p as any).type === selectedProduct
  );
  const product2 = allProducts.find(p => 
    typeof p === 'object' && p !== null && 'type' in p && (p as any).type === selectedProduct
  );

  if (product1 && typeof product1 === 'object') {
    const name = 'name' in product1 ? (product1 as any).name : '';
    const price = 'price' in product1 ? (product1 as any).price : 0;
    
    const formattedPrice = typeof price === 'number' ? price.toFixed(2) : '0.00';
    
  }

  const productA = allProducts.find(p => 
    typeof p === 'object' && p !== null && 'id' in p && (p as any).id === selectedProduct
  );
  const productB = allProducts.find(p => 
    typeof p === 'object' && p !== null && 'id' in p && (p as any).id === selectedProduct
  );

  if (productA && typeof productA === 'object') {
    const size = 'size' in productA ? (productA as any).size : '';
    
    const dimensions = 'dimensions' in productA ? (productA as any).dimensions : { length: 0, width: 0, height: 0 };
    
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Edit Product Dimensions
          </h3>
          <div className="mt-2 px-7 py-3">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="length">
                Length (mm)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="length"
                type="number"
                placeholder="Length"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="width">
                Width (mm)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="width"
                type="number"
                placeholder="Width"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="height">
                Height (mm)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="height"
                type="number"
                placeholder="Height"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rotation">
                Rotation (degrees)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="rotation"
                type="number"
                placeholder="Rotation"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="scale">
                Scale
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="scale"
                type="number"
                step="0.01"
                placeholder="Scale"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="color">
                Color
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-1/2 shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-1/2 shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-1/2 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDimensionEditor;
