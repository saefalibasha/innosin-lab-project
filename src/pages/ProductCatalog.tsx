
import React from 'react';
import { Link } from 'react-router-dom';

const ProductCatalog = () => {
  const productSeries = [
    {
      slug: 'mobile-cabinets',
      name: 'Mobile Cabinet Series',
      description: 'Flexible laboratory storage with mobility',
      image: '/api/placeholder/300/200'
    },
    {
      slug: 'wall-cabinets',
      name: 'Wall Cabinet Series',
      description: 'Space-efficient wall-mounted solutions',
      image: '/api/placeholder/300/200'
    },
    {
      slug: 'open-racks',
      name: 'Open Rack Series',
      description: 'Accessible storage for equipment',
      image: '/api/placeholder/300/200'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productSeries.map((series) => (
          <Link
            key={series.slug}
            to={`/products/${series.slug}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={series.image}
              alt={series.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{series.name}</h3>
              <p className="text-gray-600">{series.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;
