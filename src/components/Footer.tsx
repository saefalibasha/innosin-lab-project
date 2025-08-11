
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Innosin Lab</h3>
            <p className="text-gray-300">
              Professional laboratory furniture and storage solutions for modern research environments.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Mobile Cabinets</li>
              <li>Wall Cabinets</li>
              <li>Open Racks</li>
              <li>Tall Cabinets</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">
              Get in touch for custom laboratory solutions and quotes.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-300">
          <p>&copy; 2024 Innosin Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
