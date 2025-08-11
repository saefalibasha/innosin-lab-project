
import React from 'react';
import { useRFQ } from '@/contexts/RFQContext';

const RFQCart = () => {
  const { items, updateItem, removeItem, clearCart, itemCount } = useRFQ();

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quote Request</h1>
          <p className="text-gray-600">Your quote request is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quote Request ({itemCount})</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800"
        >
          Clear All
        </button>
      </div>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{item.category}</p>
                  <p className="text-sm text-gray-500">{item.dimensions}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                  className="w-16 px-2 py-1 border rounded"
                  min="1"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
          Request Quote
        </button>
      </div>
    </div>
  );
};

export default RFQCart;
