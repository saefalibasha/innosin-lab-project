
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRFQ } from '@/contexts/RFQContext';

const EnhancedProductDetail = () => {
  const { seriesSlug } = useParams();
  const { addItem } = useRFQ();

  const handleAddToQuote = () => {
    if (seriesSlug) {
      addItem({
        id: seriesSlug,
        name: `Product ${seriesSlug}`,
        category: 'Laboratory Furniture',
        dimensions: '500×500×650 mm',
        image: '/api/placeholder/300/200'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {seriesSlug?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src="/api/placeholder/500/400"
              alt="Product"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div>
            <p className="text-gray-600 mb-6">
              Professional laboratory furniture designed for modern research environments.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Specifications:</h3>
                <ul className="text-gray-600 mt-2">
                  <li>• Dimensions: 500×500×650 mm</li>
                  <li>• Material: Powder coat finish</li>
                  <li>• Chemical resistant construction</li>
                </ul>
              </div>
              <button
                onClick={handleAddToQuote}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Quote Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetail;
