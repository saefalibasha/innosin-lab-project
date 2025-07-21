
export interface ProductFinish {
  type: 'powder-coat' | 'stainless-steel';
  name: string;
  price?: string;
  modelPath?: string;
  thumbnail?: string;
  images?: string[];
}

export interface ProductVariant {
  id: string;
  size: string;
  dimensions: string;
  type?: string;
  orientation?: 'LH' | 'RH' | 'None';
  modelPath: string;
  thumbnail: string;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  modelPath: string; // Path to .glb file
  thumbnail: string; // Main product image
  overviewImage?: string; // Overview image for catalog display (JPG only)
  seriesOverviewImage?: string; // Series overview image from admin
  images: string[]; // Array of additional product images
  description: string; // Short description for grid view
  fullDescription: string; // Detailed description for detail page
  specifications: string[];
  // Enhanced fields for Innosin Lab products
  finishes?: ProductFinish[];
  variants?: ProductVariant[];
  baseProductId?: string;
}
