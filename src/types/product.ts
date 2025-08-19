
export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  category: string;
  product_code?: string;
  product_series?: string;
  dimensions?: string;
  finish_type?: string;
  orientation?: string;
  door_type?: string;
  is_active: boolean;
  company_tags: string[];
  thumbnail?: string;
  thumbnail_path?: string;
  modelPath?: string;
  model_path?: string;
  images?: string[];
  
  // Additional properties that components expect
  editable_title?: string;
  editable_description?: string;
  specifications?: Record<string, any>;
  mounting_type?: string;
  mixing_type?: string;
  handle_type?: string;
  emergency_shower_type?: string;
  cabinet_class?: string;
  drawer_count?: number;
  number_of_drawers?: number;
  overviewImage?: string;
  finishes?: ProductFinish[];
  variants?: ProductVariant[];
}

export interface ProductFinish {
  id: string;
  name: string;
  color?: string;
  image?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  dimensions?: string;
  model_path?: string;
  thumbnail_path?: string;
}

export interface ProductSpecification {
  [key: string]: string | number | boolean;
}
