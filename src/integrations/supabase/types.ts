export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_role_audit: {
        Row: {
          action: string
          changed_by_email: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_role: string | null
          old_role: string | null
          target_user_email: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_by_email: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_role?: string | null
          old_role?: string | null
          target_user_email: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_by_email?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_role?: string | null
          old_role?: string | null
          target_user_email?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          role: string
          user_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          role?: string
          user_email: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          role?: string
          user_email?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          confidence: number | null
          created_at: string
          hubspot_synced: boolean | null
          id: string
          is_typing: boolean | null
          message: string
          sender: string
          session_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          hubspot_synced?: boolean | null
          id?: string
          is_typing?: boolean | null
          message: string
          sender: string
          session_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          hubspot_synced?: boolean | null
          id?: string
          is_typing?: boolean | null
          message?: string
          sender?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          assigned_agent: string | null
          company: string | null
          context: Json | null
          created_at: string
          email: string | null
          end_time: string | null
          hubspot_contact_id: string | null
          hubspot_deal_id: string | null
          hubspot_ticket_id: string | null
          id: string
          job_title: string | null
          last_activity: string
          name: string | null
          phone: string | null
          satisfaction_score: number | null
          session_id: string
          start_time: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_agent?: string | null
          company?: string | null
          context?: Json | null
          created_at?: string
          email?: string | null
          end_time?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          hubspot_ticket_id?: string | null
          id?: string
          job_title?: string | null
          last_activity?: string
          name?: string | null
          phone?: string | null
          satisfaction_score?: number | null
          session_id: string
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_agent?: string | null
          company?: string | null
          context?: Json | null
          created_at?: string
          email?: string | null
          end_time?: string | null
          hubspot_contact_id?: string | null
          hubspot_deal_id?: string | null
          hubspot_ticket_id?: string | null
          id?: string
          job_title?: string | null
          last_activity?: string
          name?: string | null
          phone?: string | null
          satisfaction_score?: number | null
          session_id?: string
          start_time?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chatbot_training_data: {
        Row: {
          category: string | null
          confidence_threshold: number | null
          created_at: string
          example_input: string
          expected_response: string
          id: string
          intent: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          confidence_threshold?: number | null
          created_at?: string
          example_input: string
          expected_response: string
          id?: string
          intent: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          confidence_threshold?: number | null
          created_at?: string
          example_input?: string
          expected_response?: string
          id?: string
          intent?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      hubspot_integration_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          hubspot_object_id: string | null
          hubspot_object_type: string | null
          id: string
          request_data: Json | null
          response_data: Json | null
          session_id: string | null
          success: boolean
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          hubspot_object_id?: string | null
          hubspot_object_type?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          session_id?: string | null
          success: boolean
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          hubspot_object_id?: string | null
          hubspot_object_type?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          session_id?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_integration_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_entries: {
        Row: {
          auto_generated: boolean | null
          brand: string
          confidence_threshold: number | null
          created_at: string
          id: string
          is_active: boolean | null
          keywords: string[]
          last_updated: string | null
          priority: number | null
          product_category: string
          response_template: string
          source_content_ids: string[] | null
          source_document_id: string | null
          updated_at: string
        }
        Insert: {
          auto_generated?: boolean | null
          brand: string
          confidence_threshold?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords: string[]
          last_updated?: string | null
          priority?: number | null
          product_category: string
          response_template: string
          source_content_ids?: string[] | null
          source_document_id?: string | null
          updated_at?: string
        }
        Update: {
          auto_generated?: boolean | null
          brand?: string
          confidence_threshold?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[]
          last_updated?: string | null
          priority?: number | null
          product_category?: string
          response_template?: string
          source_content_ids?: string[] | null
          source_document_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_entries_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "pdf_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_content: {
        Row: {
          confidence_score: number | null
          content: string
          content_type: string
          created_at: string
          document_id: string
          id: string
          is_active: boolean | null
          keywords: string[] | null
          page_number: number | null
          section: string | null
          title: string | null
        }
        Insert: {
          confidence_score?: number | null
          content: string
          content_type: string
          created_at?: string
          document_id: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          page_number?: number | null
          section?: string | null
          title?: string | null
        }
        Update: {
          confidence_score?: number | null
          content?: string
          content_type?: string
          created_at?: string
          document_id?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          page_number?: number | null
          section?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_content_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "pdf_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_documents: {
        Row: {
          brand: string
          created_at: string
          file_path: string | null
          file_size: number | null
          file_url: string | null
          filename: string
          id: string
          last_processed: string | null
          processing_error: string | null
          processing_status: string
          product_type: string
          updated_at: string
          upload_date: string
        }
        Insert: {
          brand: string
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          filename: string
          id?: string
          last_processed?: string | null
          processing_error?: string | null
          processing_status?: string
          product_type: string
          updated_at?: string
          upload_date?: string
        }
        Update: {
          brand?: string
          created_at?: string
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          filename?: string
          id?: string
          last_processed?: string | null
          processing_error?: string | null
          processing_status?: string
          product_type?: string
          updated_at?: string
          upload_date?: string
        }
        Relationships: []
      }
      product_specifications: {
        Row: {
          category: string | null
          created_at: string
          document_id: string
          id: string
          is_key_feature: boolean | null
          product_id: string | null
          specification_name: string
          specification_type: string
          specification_value: string
          unit: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          document_id: string
          id?: string
          is_key_feature?: boolean | null
          product_id?: string | null
          specification_name: string
          specification_type: string
          specification_value: string
          unit?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          document_id?: string
          id?: string
          is_key_feature?: boolean | null
          product_id?: string | null
          specification_name?: string
          specification_type?: string
          specification_value?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "pdf_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_log: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          ip_address: unknown | null
          operation: string
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown | null
          operation: string
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown | null
          operation?: string
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          operation_name: string
          max_attempts?: number
          time_window_minutes?: number
        }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
