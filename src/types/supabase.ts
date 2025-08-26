
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
  inherits_series_assets: boolean;
  target_variant_count: number;
  keywords: string[];
}

export interface RealtimePayload {
  new?: DatabaseProduct;
  old?: DatabaseProduct;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: DatabaseProduct;
        Insert: Partial<DatabaseProduct>;
        Update: Partial<DatabaseProduct>;
      };
      shop_look_images: {
        Row: {
          id: string;
          url: string;
          alt: string | null;
          filename: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          url: string;
          alt?: string | null;
          filename?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          url?: string;
          alt?: string | null;
          filename?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      shop_look_hotspots: {
        Row: {
          id: string;
          x_position: number;
          y_position: number;
          title: string;
          description: string | null;
          price: string | null;
          category: string | null;
          image: string | null;
          product_link: string | null;
          specifications: any;
          is_active: boolean | null;
          display_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          x_position: number;
          y_position: number;
          title: string;
          description?: string | null;
          price?: string | null;
          category?: string | null;
          image?: string | null;
          product_link?: string | null;
          specifications?: any;
          is_active?: boolean | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          x_position?: number;
          y_position?: number;
          title?: string;
          description?: string | null;
          price?: string | null;
          category?: string | null;
          image?: string | null;
          product_link?: string | null;
          specifications?: any;
          is_active?: boolean | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shop_look_content: {
        Row: {
          id: string;
          title: string;
          title_highlight: string;
          description: string;
          background_image: string;
          background_alt: string;
          is_active: boolean;
          display_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          title_highlight?: string;
          description?: string;
          background_image?: string;
          background_alt?: string;
          is_active?: boolean;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          title_highlight?: string;
          description?: string;
          background_image?: string;
          background_alt?: string;
          is_active?: boolean;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
