
import React from 'react';

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Innosin Lab
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Professional laboratory furniture and storage solutions
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Mobile Cabinets</h3>
            <p className="text-gray-600">Flexible storage solutions for modern laboratories</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Wall Cabinets</h3>
            <p className="text-gray-600">Space-efficient wall-mounted storage</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Open Racks</h3>
            <p className="text-gray-600">Accessible storage for frequently used equipment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
