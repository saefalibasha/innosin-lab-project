
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
  // Database variant fields
  finish_type?: string;
  orientation?: string;
  drawer_count?: number;
  door_type?: string;
  product_code?: string;
  thumbnail_path?: string;
  model_path?: string;
  // New variant fields for specific product types
  mounting_type?: string; // For Safe Aire II (bench-mounted/floor-mounted)
  mixing_type?: string;   // For UNIFLEX (non-mix/mix)
  handle_type?: string;   // For UNIFLEX (polypropylene/wrist-action)
  emergency_shower_type?: string; // For Emergency Shower (eye-wash/body-shower/combination)
  cabinet_class?: string; // For TANGERINE (A2/B2)
  company_tags?: string[]; // Company/brand tags
  product_series?: string; // Product series name
  // Series relationship fields
  parent_series_id?: string; // Reference to parent series product
  is_series_parent?: boolean; // Whether this product is a series parent
}

// New interface for wall cabinet configuration
export interface WallCabinetConfiguration {
  dimension: string;
  doorType: string;
  orientation?: string;
  availableFinishes: string[];
  variants: WallCabinetVariant[];
}

export interface WallCabinetVariant {
  id: string;
  product_code: string;
  name: string;
  dimensions: string;
  finish_type: string;
  orientation: string;
  door_type: string;
  thumbnail_path: string;
  model_path: string;
  additional_images: string[];
}
