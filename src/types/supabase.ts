
export interface DatabaseProduct {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  model_path: string;
  thumbnail_path: string;
  additional_images: string[];
  description: string;
  full_description: string;
  specifications: any;
  finish_type: string;
  orientation: string;
  door_type: string;
  variant_type: string;
  drawer_count: number;
  cabinet_class: string;
  product_code: string;
  mounting_type: string;
  mixing_type: string;
  handle_type: string;
  emergency_shower_type: string;
  company_tags: string[];
  product_series: string;
  parent_series_id: string;
  is_series_parent: boolean;
  is_active: boolean;
  series_model_path: string;
  series_thumbnail_path: string;
  series_overview_image_path: string;
  overview_image_path: string;
  series_order: number;
  variant_order: number;
  created_at: string;
  updated_at: string;
  editable_title: string;
  editable_description: string;
}

export interface RealtimePayload {
  new?: DatabaseProduct;
  old?: DatabaseProduct;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}
