export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      agent_health_log: {
        Row: {
          agent_name: string | null
          check_type: string | null
          created_at: string | null
          details: string | null
          id: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          agent_name?: string | null
          check_type?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          agent_name?: string | null
          check_type?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      agent_memory: {
        Row: {
          created_at: string | null
          id: string
          key: string | null
          last_updated: string | null
          memory_type: string | null
          session_id: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key?: string | null
          last_updated?: string | null
          memory_type?: string | null
          session_id?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string | null
          last_updated?: string | null
          memory_type?: string | null
          session_id?: string | null
          value?: string | null
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          approved_by: string | null
          cost_usd: number | null
          created_at: string | null
          id: string
          task_type: string | null
          tokens_in: number | null
          tokens_out: number | null
        }
        Insert: {
          approved_by?: string | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          task_type?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Update: {
          approved_by?: string | null
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          task_type?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Relationships: []
      }
      approval_log: {
        Row: {
          action_type: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          description: string | null
          id: string
          permission_level: number | null
          status: string | null
        }
        Insert: {
          action_type?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          permission_level?: number | null
          status?: string | null
        }
        Update: {
          action_type?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          permission_level?: number | null
          status?: string | null
        }
        Relationships: []
      }
      asset_uploads: {
        Row: {
          created_at: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          product_id: string | null
          upload_status: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          product_id?: string | null
          upload_status?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          product_id?: string | null
          upload_status?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      before_after_projects: {
        Row: {
          after_image: string | null
          before_image: string | null
          completion_date: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          location: string | null
          project_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          after_image?: string | null
          before_image?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          project_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          after_image?: string | null
          before_image?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          project_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          publish_date: string | null
          read_time: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          publish_date?: string | null
          read_time?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          publish_date?: string | null
          read_time?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bulk_upload_sessions: {
        Row: {
          created_at: string
          error_log: Json | null
          failed_uploads: number | null
          id: string
          processed_files: number | null
          session_name: string
          status: string | null
          successful_uploads: number | null
          total_files: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_log?: Json | null
          failed_uploads?: number | null
          id?: string
          processed_files?: number | null
          session_name: string
          status?: string | null
          successful_uploads?: number | null
          total_files?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_log?: Json | null
          failed_uploads?: number | null
          id?: string
          processed_files?: number | null
          session_name?: string
          status?: string | null
          successful_uploads?: number | null
          total_files?: number | null
          updated_at?: string
          user_id?: string | null
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
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions_public"
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
          encrypted_company: string | null
          encrypted_email: string | null
          encrypted_job_title: string | null
          encrypted_name: string | null
          encrypted_phone: string | null
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
          encrypted_company?: string | null
          encrypted_email?: string | null
          encrypted_job_title?: string | null
          encrypted_name?: string | null
          encrypted_phone?: string | null
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
          encrypted_company?: string | null
          encrypted_email?: string | null
          encrypted_job_title?: string | null
          encrypted_name?: string | null
          encrypted_phone?: string | null
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
      conversation_flows: {
        Row: {
          created_at: string
          description: string | null
          flow_data: Json
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          flow_data: Json
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          flow_data?: Json
          id?: string
          is_active?: boolean | null
          name?: string
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
          {
            foreignKeyName: "hubspot_integration_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      inno_alert_log: {
        Row: {
          bucket: string
          sent_at: string
          task_id: string
        }
        Insert: {
          bucket: string
          sent_at?: string
          task_id: string
        }
        Update: {
          bucket?: string
          sent_at?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inno_alert_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "inno_vault_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      inno_email_intel: {
        Row: {
          action_required: boolean | null
          actions_taken: string[] | null
          category: string | null
          created_at: string | null
          follow_ups: string[] | null
          from_addr: string | null
          from_address: string | null
          gmail_id: string
          id: string
          needs_saef_reply: boolean | null
          pending_items: string[] | null
          processed_at: string | null
          project: string | null
          project_name: string | null
          raw_claude_json: Json | null
          received_at: string
          sentiment: string | null
          snippet: string | null
          subject: string | null
          summary: string | null
          thread_id: string
          urgency: string | null
        }
        Insert: {
          action_required?: boolean | null
          actions_taken?: string[] | null
          category?: string | null
          created_at?: string | null
          follow_ups?: string[] | null
          from_addr?: string | null
          from_address?: string | null
          gmail_id: string
          id?: string
          needs_saef_reply?: boolean | null
          pending_items?: string[] | null
          processed_at?: string | null
          project?: string | null
          project_name?: string | null
          raw_claude_json?: Json | null
          received_at: string
          sentiment?: string | null
          snippet?: string | null
          subject?: string | null
          summary?: string | null
          thread_id: string
          urgency?: string | null
        }
        Update: {
          action_required?: boolean | null
          actions_taken?: string[] | null
          category?: string | null
          created_at?: string | null
          follow_ups?: string[] | null
          from_addr?: string | null
          from_address?: string | null
          gmail_id?: string
          id?: string
          needs_saef_reply?: boolean | null
          pending_items?: string[] | null
          processed_at?: string | null
          project?: string | null
          project_name?: string | null
          raw_claude_json?: Json | null
          received_at?: string
          sentiment?: string | null
          snippet?: string | null
          subject?: string | null
          summary?: string | null
          thread_id?: string
          urgency?: string | null
        }
        Relationships: []
      }
      inno_email_tasks: {
        Row: {
          created_at: string | null
          deadline: string | null
          deadline_text: string | null
          description: string
          email_intel_id: string | null
          id: string
          last_alerted_at: string | null
          owner: string | null
          priority: string | null
          project: string | null
          promoted_to_vault_task_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          deadline_text?: string | null
          description: string
          email_intel_id?: string | null
          id?: string
          last_alerted_at?: string | null
          owner?: string | null
          priority?: string | null
          project?: string | null
          promoted_to_vault_task_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          deadline_text?: string | null
          description?: string
          email_intel_id?: string | null
          id?: string
          last_alerted_at?: string | null
          owner?: string | null
          priority?: string | null
          project?: string | null
          promoted_to_vault_task_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inno_email_tasks_email_intel_id_fkey"
            columns: ["email_intel_id"]
            isOneToOne: false
            referencedRelation: "inno_email_intel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inno_email_tasks_promoted_to_vault_task_id_fkey"
            columns: ["promoted_to_vault_task_id"]
            isOneToOne: false
            referencedRelation: "inno_vault_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      inno_gdrive_log: {
        Row: {
          action: string
          created_at: string | null
          file_id: string | null
          file_name: string | null
          id: string
          mime_type: string | null
          query: string | null
          status: string | null
          summary: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          file_id?: string | null
          file_name?: string | null
          id?: string
          mime_type?: string | null
          query?: string | null
          status?: string | null
          summary?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          file_id?: string | null
          file_name?: string | null
          id?: string
          mime_type?: string | null
          query?: string | null
          status?: string | null
          summary?: string | null
        }
        Relationships: []
      }
      inno_gmail_log: {
        Row: {
          action: string
          approved_by: string | null
          created_at: string | null
          from_address: string | null
          id: string
          message_id: string | null
          status: string | null
          subject: string | null
          summary: string | null
          thread_id: string | null
          to_address: string | null
        }
        Insert: {
          action: string
          approved_by?: string | null
          created_at?: string | null
          from_address?: string | null
          id?: string
          message_id?: string | null
          status?: string | null
          subject?: string | null
          summary?: string | null
          thread_id?: string | null
          to_address?: string | null
        }
        Update: {
          action?: string
          approved_by?: string | null
          created_at?: string | null
          from_address?: string | null
          id?: string
          message_id?: string | null
          status?: string | null
          subject?: string | null
          summary?: string | null
          thread_id?: string | null
          to_address?: string | null
        }
        Relationships: []
      }
      inno_message_log: {
        Row: {
          channel: string | null
          content: string | null
          created_at: string | null
          id: string
          project_id: string | null
          role: string
          session_id: string | null
          telegram_chat_id: string
          telegram_username: string | null
          thread_id: string | null
          tokens_used: number | null
          tool_calls: Json | null
        }
        Insert: {
          channel?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          role: string
          session_id?: string | null
          telegram_chat_id: string
          telegram_username?: string | null
          thread_id?: string | null
          tokens_used?: number | null
          tool_calls?: Json | null
        }
        Update: {
          channel?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: string
          session_id?: string | null
          telegram_chat_id?: string
          telegram_username?: string | null
          thread_id?: string | null
          tokens_used?: number | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "inno_message_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "inno_project_state"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "inno_message_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "inno_vault_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      inno_reminders: {
        Row: {
          completed: boolean | null
          created_at: string | null
          due_date: string | null
          id: number
          list_name: string | null
          notes: string | null
          priority: number | null
          reminder_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: number
          list_name?: string | null
          notes?: string | null
          priority?: number | null
          reminder_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          due_date?: string | null
          id?: number
          list_name?: string | null
          notes?: string | null
          priority?: number | null
          reminder_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inno_vault_daily: {
        Row: {
          actions_taken: string[] | null
          created_at: string | null
          date: string
          emails_triaged: number | null
          id: string
          leads_captured: number | null
          open_tasks_count: number | null
          priorities: string[] | null
          summary: string | null
        }
        Insert: {
          actions_taken?: string[] | null
          created_at?: string | null
          date: string
          emails_triaged?: number | null
          id?: string
          leads_captured?: number | null
          open_tasks_count?: number | null
          priorities?: string[] | null
          summary?: string | null
        }
        Update: {
          actions_taken?: string[] | null
          created_at?: string | null
          date?: string
          emails_triaged?: number | null
          id?: string
          leads_captured?: number | null
          open_tasks_count?: number | null
          priorities?: string[] | null
          summary?: string | null
        }
        Relationships: []
      }
      inno_vault_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          last_reviewed_at: string | null
          links: string[] | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          links?: string[] | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          links?: string[] | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inno_vault_tasks: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          project_id: string | null
          source: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          source?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          source?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inno_vault_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "inno_project_state"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "inno_vault_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "inno_vault_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_analytics: {
        Row: {
          entry_id: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          entry_id?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          entry_id?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_analytics_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_entries: {
        Row: {
          auto_generated: boolean | null
          brand: string
          confidence_threshold: number | null
          content_hash: string | null
          created_at: string
          effectiveness_score: number | null
          id: string
          is_active: boolean | null
          keywords: string[]
          last_updated: string | null
          priority: number | null
          product_category: string
          response_template: string
          source_content_ids: string[] | null
          source_document_id: string | null
          tags: string[] | null
          updated_at: string
          usage_count: number | null
          version: number | null
        }
        Insert: {
          auto_generated?: boolean | null
          brand: string
          confidence_threshold?: number | null
          content_hash?: string | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          is_active?: boolean | null
          keywords: string[]
          last_updated?: string | null
          priority?: number | null
          product_category: string
          response_template: string
          source_content_ids?: string[] | null
          source_document_id?: string | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          version?: number | null
        }
        Update: {
          auto_generated?: boolean | null
          brand?: string
          confidence_threshold?: number | null
          content_hash?: string | null
          created_at?: string
          effectiveness_score?: number | null
          id?: string
          is_active?: boolean | null
          keywords?: string[]
          last_updated?: string | null
          priority?: number | null
          product_category?: string
          response_template?: string
          source_content_ids?: string[] | null
          source_document_id?: string | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          version?: number | null
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
      knowledge_base_history: {
        Row: {
          change_description: string | null
          change_type: string
          changed_by: string | null
          created_at: string
          entry_id: string | null
          id: string
          previous_data: Json
          version: number
        }
        Insert: {
          change_description?: string | null
          change_type: string
          changed_by?: string | null
          created_at?: string
          entry_id?: string | null
          id?: string
          previous_data: Json
          version: number
        }
        Update: {
          change_description?: string | null
          change_type?: string
          changed_by?: string | null
          created_at?: string
          entry_id?: string | null
          id?: string
          previous_data?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_history_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_content: {
        Row: {
          content: string
          content_type: string | null
          created_at: string
          document_id: string | null
          extracted_at: string | null
          id: string
          page_number: number | null
          updated_at: string
        }
        Insert: {
          content: string
          content_type?: string | null
          created_at?: string
          document_id?: string | null
          extracted_at?: string | null
          id?: string
          page_number?: number | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: string | null
          created_at?: string
          document_id?: string | null
          extracted_at?: string | null
          id?: string
          page_number?: number | null
          updated_at?: string
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
      product_activity_log: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          product_id: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          product_id?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          product_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          additional_images: string[] | null
          category: string | null
          company_tags: string[] | null
          created_at: string | null
          description: string | null
          dimensions: string | null
          door_type: string | null
          emergency_shower_type: string | null
          finish_type: string | null
          full_description: string | null
          handle_type: string | null
          id: string | null
          inherits_series_assets: boolean | null
          is_active: boolean | null
          is_series_parent: boolean | null
          keywords: string[] | null
          mixing_type: string | null
          model_path: string | null
          mounting_type: string | null
          name: string | null
          number_of_drawers: number | null
          orientation: string | null
          overview_image_path: string | null
          parent_series_id: string | null
          product_code: string | null
          product_series: string | null
          series_model_path: string | null
          series_order: number | null
          series_overview_image_path: string | null
          series_slug: string | null
          series_thumbnail_path: string | null
          slug: string | null
          specifications: Json | null
          target_variant_count: number | null
          thumbnail_path: string | null
          updated_at: string | null
          variant_order: number | null
          variant_type: string | null
        }
        Insert: {
          additional_images?: string[] | null
          category?: string | null
          company_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          door_type?: string | null
          emergency_shower_type?: string | null
          finish_type?: string | null
          full_description?: string | null
          handle_type?: string | null
          id?: string | null
          inherits_series_assets?: boolean | null
          is_active?: boolean | null
          is_series_parent?: boolean | null
          keywords?: string[] | null
          mixing_type?: string | null
          model_path?: string | null
          mounting_type?: string | null
          name?: string | null
          number_of_drawers?: number | null
          orientation?: string | null
          overview_image_path?: string | null
          parent_series_id?: string | null
          product_code?: string | null
          product_series?: string | null
          series_model_path?: string | null
          series_order?: number | null
          series_overview_image_path?: string | null
          series_slug?: string | null
          series_thumbnail_path?: string | null
          slug?: string | null
          specifications?: Json | null
          target_variant_count?: number | null
          thumbnail_path?: string | null
          updated_at?: string | null
          variant_order?: number | null
          variant_type?: string | null
        }
        Update: {
          additional_images?: string[] | null
          category?: string | null
          company_tags?: string[] | null
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          door_type?: string | null
          emergency_shower_type?: string | null
          finish_type?: string | null
          full_description?: string | null
          handle_type?: string | null
          id?: string | null
          inherits_series_assets?: boolean | null
          is_active?: boolean | null
          is_series_parent?: boolean | null
          keywords?: string[] | null
          mixing_type?: string | null
          model_path?: string | null
          mounting_type?: string | null
          name?: string | null
          number_of_drawers?: number | null
          orientation?: string | null
          overview_image_path?: string | null
          parent_series_id?: string | null
          product_code?: string | null
          product_series?: string | null
          series_model_path?: string | null
          series_order?: number | null
          series_overview_image_path?: string | null
          series_slug?: string | null
          series_thumbnail_path?: string | null
          slug?: string | null
          specifications?: Json | null
          target_variant_count?: number | null
          thumbnail_path?: string | null
          updated_at?: string | null
          variant_order?: number | null
          variant_type?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_name: string | null
          contact_person: string | null
          created_at: string | null
          data_retention_date: string | null
          id: string
          last_updated: string | null
          notes: string | null
          project_name: string | null
          service_type: string | null
          start_date: string | null
          status: string | null
          target_completion: string | null
        }
        Insert: {
          client_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          data_retention_date?: string | null
          id?: string
          last_updated?: string | null
          notes?: string | null
          project_name?: string | null
          service_type?: string | null
          start_date?: string | null
          status?: string | null
          target_completion?: string | null
        }
        Update: {
          client_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          data_retention_date?: string | null
          id?: string
          last_updated?: string | null
          notes?: string | null
          project_name?: string | null
          service_type?: string | null
          start_date?: string | null
          status?: string | null
          target_completion?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount_sgd: number | null
          approved_by: string | null
          client_name: string | null
          created_at: string | null
          data_retention_date: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          project_id: string | null
          quote_ref: string | null
          sent_date: string | null
          status: string | null
        }
        Insert: {
          amount_sgd?: number | null
          approved_by?: string | null
          client_name?: string | null
          created_at?: string | null
          data_retention_date?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          quote_ref?: string | null
          sent_date?: string | null
          status?: string | null
        }
        Update: {
          amount_sgd?: number | null
          approved_by?: string | null
          client_name?: string | null
          created_at?: string | null
          data_retention_date?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          quote_ref?: string | null
          sent_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_log: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          ip_address: unknown
          operation: string
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown
          operation: string
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown
          operation?: string
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      secure_session_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_accessed: string | null
          session_data: Json
          token_hash: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          last_accessed?: string | null
          session_data?: Json
          token_hash: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_accessed?: string | null
          session_data?: Json
          token_hash?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          resource: string | null
          resource_id: string | null
          user_agent: string | null
          user_email: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
          user_email: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
          user_email?: string
        }
        Relationships: []
      }
      security_log: {
        Row: {
          action_taken: string | null
          alert_type: string | null
          created_at: string | null
          description: string | null
          id: string
          resolved_at: string | null
          reviewed_by: string | null
          severity: string | null
          source: string | null
        }
        Insert: {
          action_taken?: string | null
          alert_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          source?: string | null
        }
        Update: {
          action_taken?: string | null
          alert_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          source?: string | null
        }
        Relationships: []
      }
      shop_look_content: {
        Row: {
          background_alt: string | null
          background_image: string | null
          created_at: string | null
          description: string
          display_order: number | null
          id: string
          is_active: boolean | null
          title: string
          title_highlight: string
          updated_at: string | null
        }
        Insert: {
          background_alt?: string | null
          background_image?: string | null
          created_at?: string | null
          description?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          title_highlight?: string
          updated_at?: string | null
        }
        Update: {
          background_alt?: string | null
          background_image?: string | null
          created_at?: string | null
          description?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          title_highlight?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shop_look_hotspots: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image: string | null
          is_active: boolean | null
          price: string | null
          product_link: string | null
          specifications: Json | null
          title: string
          updated_at: string | null
          x_position: number
          y_position: number
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          price?: string | null
          product_link?: string | null
          specifications?: Json | null
          title: string
          updated_at?: string | null
          x_position: number
          y_position: number
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          price?: string | null
          product_link?: string | null
          specifications?: Json | null
          title?: string
          updated_at?: string | null
          x_position?: number
          y_position?: number
        }
        Relationships: []
      }
      task_queue: {
        Row: {
          created_at: string | null
          id: string
          processed_at: string | null
          retry_count: number | null
          status: string | null
          task_data: Json | null
          task_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
          task_data?: Json | null
          task_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
          task_data?: Json | null
          task_type?: string | null
        }
        Relationships: []
      }
      training_data_entries: {
        Row: {
          category: string | null
          confidence_threshold: number | null
          context_requirements: Json | null
          created_at: string
          example_inputs: string[]
          id: string
          intent: string
          is_active: boolean | null
          performance_score: number | null
          priority: number | null
          response_template: string
          session_id: string | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          confidence_threshold?: number | null
          context_requirements?: Json | null
          created_at?: string
          example_inputs: string[]
          id?: string
          intent: string
          is_active?: boolean | null
          performance_score?: number | null
          priority?: number | null
          response_template: string
          session_id?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          confidence_threshold?: number | null
          context_requirements?: Json | null
          created_at?: string
          example_inputs?: string[]
          id?: string
          intent?: string
          is_active?: boolean | null
          performance_score?: number | null
          priority?: number | null
          response_template?: string
          session_id?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_data_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_performance: {
        Row: {
          actual_output: string | null
          confidence_score: number | null
          entry_id: string | null
          expected_output: string
          id: string
          metadata: Json | null
          session_id: string | null
          success_rate: number | null
          test_input: string
          tested_at: string
        }
        Insert: {
          actual_output?: string | null
          confidence_score?: number | null
          entry_id?: string | null
          expected_output: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          success_rate?: number | null
          test_input: string
          tested_at?: string
        }
        Update: {
          actual_output?: string | null
          confidence_score?: number | null
          entry_id?: string | null
          expected_output?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          success_rate?: number | null
          test_input?: string
          tested_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_performance_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "training_data_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_performance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          performance_metrics: Json | null
          progress: number | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          performance_metrics?: Json | null
          progress?: number | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          performance_metrics?: Json | null
          progress?: number | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      chat_sessions_public: {
        Row: {
          context: Json | null
          id: string | null
          last_activity: string | null
          session_id: string | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          context?: Json | null
          id?: string | null
          last_activity?: string | null
          session_id?: string | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          context?: Json | null
          id?: string | null
          last_activity?: string | null
          session_id?: string | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: []
      }
      inno_project_state: {
        Row: {
          closed_last_week: number | null
          due_this_week: number | null
          last_note_at: string | null
          open_count: number | null
          overdue_count: number | null
          project: string | null
          project_id: string | null
          tags: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_anonymous_session_rate_limit: { Args: never; Returns: boolean }
      check_rate_limit: {
        Args: {
          max_attempts?: number
          operation_name: string
          time_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_anonymous_sessions_enhanced: { Args: never; Returns: undefined }
      cleanup_expired_tokens: { Args: never; Returns: undefined }
      cleanup_old_anonymous_sessions: { Args: never; Returns: undefined }
      create_session_token: {
        Args: { session_data_param: Json; user_id_param?: string }
        Returns: string
      }
      encrypt_pii: { Args: { data: string }; Returns: string }
      get_current_user_email: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_session_data: { Args: { session_token: string }; Returns: Json }
      is_admin: { Args: { user_email: string }; Returns: boolean }
      is_super_admin: { Args: { user_email: string }; Returns: boolean }
      log_security_event: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource?: string
          p_resource_id?: string
        }
        Returns: undefined
      }
      process_uploaded_asset: {
        Args: {
          p_file_path: string
          p_file_type: string
          p_product_id: string
          p_public_url: string
        }
        Returns: undefined
      }
      slugify: { Args: { input: string }; Returns: string }
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
