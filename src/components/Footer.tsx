
import React from 'react';
import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';

export const Footer = () => {
  return (
    <footer className="bg-sea text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info - Spans 2 columns */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{siteContent.companyName}</h3>
            <p className="text-gray-300 mb-6 max-w-md">
              {siteContent.tagline}
            </p>
            <p className="text-gray-400 text-sm">
              {siteContent.copyright}
            </p>
          </div>
          
          {/* Products & Series */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Products & Series</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link to="/products" className="hover:text-white transition-colors duration-200">
                  Products Catalog
                </Link>
              </li>
              <li>
                <Link to="/products?series=mobile-cabinet" className="hover:text-white transition-colors duration-200">
                  Mobile Cabinet Series
                </Link>
              </li>
              <li>
                <Link to="/products?series=wall-cabinet" className="hover:text-white transition-colors duration-200">
                  Wall Cabinet Series
                </Link>
              </li>
              <li>
                <Link to="/products?series=tall-cabinet" className="hover:text-white transition-colors duration-200">
                  Tall Cabinet Series
                </Link>
              </li>
              <li>
                <Link to="/products?series=open-rack" className="hover:text-white transition-colors duration-200">
                  Open Rack Series
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Tools & Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Tools & Resources</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link to="/floorplanner" className="hover:text-white transition-colors duration-200">
                  Floor Planner
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/rfq" className="hover:text-white transition-colors duration-200">
                  RFQ Cart
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom border */}
        <div className="border-t border-gray-600 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>Professional laboratory solutions for modern research environments</p>
            <p className="mt-4 md:mt-0">Designed for innovation and safety</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
