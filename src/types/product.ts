
export interface Product {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  modelPath: string; // Path to .glb file
  thumbnail: string; // Main product image
  images: string[]; // Array of additional product images
  description: string; // Short description for grid view
  fullDescription: string; // Detailed description for detail page
  specifications: string[];
}
