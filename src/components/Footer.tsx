
import React from 'react';
import { siteContent } from '@/data/siteContent';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">{siteContent.companyName}</h3>
            <p className="text-gray-300 mb-4">
              {siteContent.tagline}
            </p>
            <p className="text-gray-400 text-sm">
              {siteContent.copyright}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Laboratory Cabinets</li>
              <li>Fume Hoods</li>
              <li>Storage Solutions</li>
              <li>Safety Equipment</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li>About Us</li>
              <li>Contact</li>
              <li>Support</li>
              <li>News</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
