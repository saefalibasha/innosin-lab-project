
export interface Product {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  modelPath: string;
  thumbnail: string;
  images: string[];
  description: string;
  fullDescription: string;
  specifications: any[];
  finishes: ProductFinish[];
  variants: ProductVariant[];
  baseProductId?: string;
  
  // Variant-specific fields
  finish_type?: string;
  orientation?: string;
  drawer_count?: number;
  door_type?: string;
  product_code?: string;
  thumbnail_path?: string;
  model_path?: string;
  
  // New variant fields
  mounting_type?: string;
  mixing_type?: string;
  handle_type?: string;
  company_tags?: string[];
  product_series?: string;
  cabinet_class?: string;
  emergency_shower_type?: string;
  
  // Admin editable fields
  editable_title?: string;
  editable_description?: string;
  
  // Image fields
  overviewImage?: string;
  seriesOverviewImage?: string;
  
  // Timestamps and status
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  
  // Series parent relationship
  parent_series_id?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  finish: string;
  price?: number;
  dimensions?: string;
  modelPath?: string;
  thumbnail?: string;
  images?: string[];
  size?: string;
  type?: string;
  orientation?: string;
}

export interface ProductFinish {
  type: string;
  name: string;
  price?: string;
}

export interface WallCabinetConfiguration {
  id: string;
  name: string;
  dimensions: string;
  type: string;
  finish: string;
  price?: number;
}
