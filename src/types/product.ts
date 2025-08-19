
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
  modelPath?: string;
  images?: string[];
}
