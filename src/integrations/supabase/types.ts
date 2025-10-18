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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          commission_rate: number
          created_at: string
          id: string
          is_affiliate: boolean
          referral_code: string
          total_clicks: number
          total_conversions: number
          total_earnings: number
          user_id: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          id?: string
          is_affiliate?: boolean
          referral_code: string
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          user_id: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          id?: string
          is_affiliate?: boolean
          referral_code?: string
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_name: string
          last_used_at: string | null
          permissions: Json
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name: string
          last_used_at?: string | null
          permissions?: Json
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          permissions?: Json
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          method: string
          response_time: number | null
          status_code: number
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          method: string
          response_time?: number | null
          status_code: number
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          method?: string
          response_time?: number | null
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          created_at: string
          description: string | null
          form_id: string | null
          id: string
          is_active: boolean
          name: string
          steps: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          form_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          steps?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          form_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          steps?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assignment_rules: {
        Row: {
          assign_to: string | null
          assign_to_team: string | null
          conditions: Json
          created_at: string
          form_id: string | null
          id: string
          is_active: boolean
          priority: number
          rule_name: string
          user_id: string
        }
        Insert: {
          assign_to?: string | null
          assign_to_team?: string | null
          conditions?: Json
          created_at?: string
          form_id?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          rule_name: string
          user_id: string
        }
        Update: {
          assign_to?: string | null
          assign_to_team?: string | null
          conditions?: Json
          created_at?: string
          form_id?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          rule_name?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      batch_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          failed_forms: number
          id: string
          job_name: string
          processed_forms: number
          results: Json | null
          status: string
          total_forms: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          failed_forms?: number
          id?: string
          job_name: string
          processed_forms?: number
          results?: Json | null
          status?: string
          total_forms: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          failed_forms?: number
          id?: string
          job_name?: string
          processed_forms?: number
          results?: Json | null
          status?: string
          total_forms?: number
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_requests: {
        Row: {
          budget_range: string | null
          company_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          id: string
          message: string
          preferred_start_date: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_range?: string | null
          company_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          message: string
          preferred_start_date?: string | null
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_range?: string | null
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          message?: string
          preferred_start_date?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_integrations: {
        Row: {
          api_key_encrypted: string
          created_at: string
          id: string
          instance_url: string | null
          is_active: boolean
          provider: string
          sync_settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          created_at?: string
          id?: string
          instance_url?: string | null
          is_active?: boolean
          provider: string
          sync_settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          created_at?: string
          id?: string
          instance_url?: string | null
          is_active?: boolean
          provider?: string
          sync_settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_webhooks: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          name: string
          secret_key: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events: string[]
          id?: string
          is_active?: boolean
          name: string
          secret_key?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          secret_key?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      email_integrations: {
        Row: {
          api_key_encrypted: string
          created_at: string
          id: string
          is_active: boolean
          list_id: string | null
          provider: string
          sync_settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          created_at?: string
          id?: string
          is_active?: boolean
          list_id?: string | null
          provider: string
          sync_settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          created_at?: string
          id?: string
          is_active?: boolean
          list_id?: string | null
          provider?: string
          sync_settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      encryption_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      extracted_data: {
        Row: {
          created_at: string
          extracted_fields: Json
          id: string
          source_path: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_fields: Json
          id?: string
          source_path?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_fields?: Json
          id?: string
          source_path?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      form_ab_tests: {
        Row: {
          conversions: number
          created_at: string
          form_id: string
          id: string
          is_active: boolean
          updated_at: string
          variant_data: Json
          variant_name: string
          views: number
        }
        Insert: {
          conversions?: number
          created_at?: string
          form_id: string
          id?: string
          is_active?: boolean
          updated_at?: string
          variant_data: Json
          variant_name: string
          views?: number
        }
        Update: {
          conversions?: number
          created_at?: string
          form_id?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          variant_data?: Json
          variant_name?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_ab_tests_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_analytics: {
        Row: {
          avg_time_to_complete: number | null
          completion_rate: number | null
          created_at: string
          form_id: string
          id: string
          last_viewed_at: string | null
          submissions: number
          updated_at: string
          views: number
        }
        Insert: {
          avg_time_to_complete?: number | null
          completion_rate?: number | null
          created_at?: string
          form_id: string
          id?: string
          last_viewed_at?: string | null
          submissions?: number
          updated_at?: string
          views?: number
        }
        Update: {
          avg_time_to_complete?: number | null
          completion_rate?: number | null
          created_at?: string
          form_id?: string
          id?: string
          last_viewed_at?: string | null
          submissions?: number
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_analytics_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: true
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assigned_to: string
          completed_at: string | null
          id: string
          rule_id: string | null
          status: string
          submission_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to: string
          completed_at?: string | null
          id?: string
          rule_id?: string | null
          status: string
          submission_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to?: string
          completed_at?: string | null
          id?: string
          rule_id?: string | null
          status?: string
          submission_id?: string
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          conditional_logic: Json | null
          created_at: string
          field_label: string
          field_name: string
          field_order: number
          field_type: string
          form_id: string
          id: string
          is_required: boolean
          updated_at: string
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string
          field_label: string
          field_name: string
          field_order: number
          field_type: string
          form_id: string
          id?: string
          is_required?: boolean
          updated_at?: string
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string
          field_label?: string
          field_name?: string
          field_order?: number
          field_type?: string
          form_id?: string
          id?: string
          is_required?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_funnel_steps: {
        Row: {
          completed: boolean | null
          form_id: string
          id: string
          session_id: string
          step_name: string
          step_number: number
          time_spent: number | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          form_id: string
          id?: string
          session_id: string
          step_name: string
          step_number: number
          time_spent?: number | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          form_id?: string
          id?: string
          session_id?: string
          step_name?: string
          step_number?: number
          time_spent?: number | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_funnel_steps_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_interactions: {
        Row: {
          element_id: string | null
          element_type: string | null
          form_id: string
          id: string
          interaction_type: string
          metadata: Json | null
          position_x: number | null
          position_y: number | null
          session_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          element_id?: string | null
          element_type?: string | null
          form_id: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          position_x?: number | null
          position_y?: number | null
          session_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          element_id?: string | null
          element_type?: string | null
          form_id?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          position_x?: number | null
          position_y?: number | null
          session_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_interactions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          form_id: string
          id: string
          payer_email: string | null
          payment_id: string | null
          payment_provider: string
          status: string
          submission_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          form_id: string
          id?: string
          payer_email?: string | null
          payment_id?: string | null
          payment_provider: string
          status: string
          submission_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          form_id?: string
          id?: string
          payer_email?: string | null
          payment_id?: string | null
          payment_provider?: string
          status?: string
          submission_id?: string | null
        }
        Relationships: []
      }
      form_recommendations: {
        Row: {
          created_at: string
          form_id: string
          id: string
          recommended_forms: Json
          similarity_score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          recommended_forms: Json
          similarity_score: number
          user_id: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          recommended_forms?: Json
          similarity_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_recommendations_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_schedules: {
        Row: {
          created_at: string
          form_id: string
          id: string
          scheduled_at: string
          status: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          scheduled_at: string
          status?: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          scheduled_at?: string
          status?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_schedules_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_signatures: {
        Row: {
          form_id: string
          id: string
          ip_address: string | null
          signature_data: string
          signed_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          form_id: string
          id?: string
          ip_address?: string | null
          signature_data: string
          signed_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          form_id?: string
          id?: string
          ip_address?: string | null
          signature_data?: string
          signed_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_signatures_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          category: string
          created_at: string
          creator_id: string
          description: string | null
          downloads: number
          id: string
          is_public: boolean
          price: number | null
          rating: number | null
          template_data: Json
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          creator_id: string
          description?: string | null
          downloads?: number
          id?: string
          is_public?: boolean
          price?: number | null
          rating?: number | null
          template_data: Json
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          downloads?: number
          id?: string
          is_public?: boolean
          price?: number | null
          rating?: number | null
          template_data?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_translations: {
        Row: {
          created_at: string
          form_id: string
          id: string
          language_code: string
          translated_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          language_code: string
          translated_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          language_code?: string
          translated_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_translations_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_versions: {
        Row: {
          change_description: string | null
          changed_by: string
          created_at: string
          form_data: Json
          form_id: string
          id: string
          version_number: number
        }
        Insert: {
          change_description?: string | null
          changed_by: string
          created_at?: string
          form_data: Json
          form_id: string
          id?: string
          version_number: number
        }
        Update: {
          change_description?: string | null
          changed_by?: string
          created_at?: string
          form_data?: Json
          form_id?: string
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_versions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          ai_filled_link: string | null
          created_at: string
          file_link: string | null
          form_name: string
          id: string
          user_id: string
        }
        Insert: {
          ai_filled_link?: string | null
          created_at?: string
          file_link?: string | null
          form_name: string
          id?: string
          user_id: string
        }
        Update: {
          ai_filled_link?: string | null
          created_at?: string
          file_link?: string | null
          form_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      gdpr_requests: {
        Row: {
          completed_at: string | null
          data_url: string | null
          id: string
          request_type: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          data_url?: string | null
          id?: string
          request_type: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          data_url?: string | null
          id?: string
          request_type?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          action: string
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_integrations: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          currency: string
          id: string
          is_active: boolean
          provider: string
          test_mode: boolean
          updated_at: string
          user_id: string
          webhook_secret: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          provider: string
          test_mode?: boolean
          updated_at?: string
          user_id: string
          webhook_secret?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          provider?: string
          test_mode?: boolean
          updated_at?: string
          user_id?: string
          webhook_secret?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string
          payment_status: string
          plan: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id: string
          payment_status: string
          plan: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          payment_status?: string
          plan?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          expiry_date: string | null
          form_limit: number
          free_plans_earned: number
          id: string
          n8n_webhook_url: string | null
          name: string
          phone: string | null
          plan_type: string
          referral_code: string | null
          referral_conversions: number
          referred_by: string | null
          used_forms: number
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          form_limit?: number
          free_plans_earned?: number
          id: string
          n8n_webhook_url?: string | null
          name: string
          phone?: string | null
          plan_type?: string
          referral_code?: string | null
          referral_conversions?: number
          referred_by?: string | null
          used_forms?: number
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          form_limit?: number
          free_plans_earned?: number
          id?: string
          n8n_webhook_url?: string | null
          name?: string
          phone?: string | null
          plan_type?: string
          referral_code?: string | null
          referral_conversions?: number
          referred_by?: string | null
          used_forms?: number
        }
        Relationships: []
      }
      progressive_profiles: {
        Row: {
          collected_data: Json
          completion_percentage: number | null
          created_at: string
          id: string
          interaction_count: number
          last_interaction: string
          profile_email: string
          user_id: string
        }
        Insert: {
          collected_data?: Json
          completion_percentage?: number | null
          created_at?: string
          id?: string
          interaction_count?: number
          last_interaction?: string
          profile_email: string
          user_id: string
        }
        Update: {
          collected_data?: Json
          completion_percentage?: number | null
          created_at?: string
          id?: string
          interaction_count?: number
          last_interaction?: string
          profile_email?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_conversions: {
        Row: {
          commission_amount: number | null
          converted_at: string
          credited_at: string | null
          id: string
          payment_amount: number | null
          payment_id: string | null
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          status: string
        }
        Insert: {
          commission_amount?: number | null
          converted_at?: string
          credited_at?: string | null
          id?: string
          payment_amount?: number | null
          payment_id?: string | null
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          status?: string
        }
        Update: {
          commission_amount?: number | null
          converted_at?: string
          credited_at?: string | null
          id?: string
          payment_amount?: number | null
          payment_id?: string | null
          referral_code?: string
          referred_user_id?: string
          referrer_user_id?: string
          status?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_read: boolean
          can_update: boolean
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_read?: boolean
          can_update?: boolean
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_read?: boolean
          can_update?: boolean
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      sla_settings: {
        Row: {
          business_hours_only: boolean
          created_at: string
          escalation_rules: Json | null
          first_response_hours: number | null
          form_id: string | null
          id: string
          is_active: boolean
          name: string
          resolution_hours: number | null
          user_id: string
        }
        Insert: {
          business_hours_only?: boolean
          created_at?: string
          escalation_rules?: Json | null
          first_response_hours?: number | null
          form_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          resolution_hours?: number | null
          user_id: string
        }
        Update: {
          business_hours_only?: boolean
          created_at?: string
          escalation_rules?: Json | null
          first_response_hours?: number | null
          form_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          resolution_hours?: number | null
          user_id?: string
        }
        Relationships: []
      }
      sla_tracking: {
        Row: {
          created_at: string
          first_response_at: string | null
          first_response_due: string | null
          id: string
          resolution_due: string | null
          resolved_at: string | null
          sla_id: string
          status: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          first_response_at?: string | null
          first_response_due?: string | null
          id?: string
          resolution_due?: string | null
          resolved_at?: string | null
          sla_id: string
          status: string
          submission_id: string
        }
        Update: {
          created_at?: string
          first_response_at?: string | null
          first_response_due?: string | null
          id?: string
          resolution_due?: string | null
          resolved_at?: string | null
          sla_id?: string
          status?: string
          submission_id?: string
        }
        Relationships: []
      }
      submission_approvals: {
        Row: {
          approval_history: Json
          created_at: string
          current_step: number
          id: string
          status: string
          submission_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          approval_history?: Json
          created_at?: string
          current_step?: number
          id?: string
          status: string
          submission_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          approval_history?: Json
          created_at?: string
          current_step?: number
          id?: string
          status?: string
          submission_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: []
      }
      submission_notes: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          is_internal: boolean
          note_text: string
          submission_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_internal?: boolean
          note_text: string
          submission_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          is_internal?: boolean
          note_text?: string
          submission_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      two_factor_auth: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          enabled: boolean
          id: string
          secret: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          enabled?: boolean
          id?: string
          secret?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          enabled?: boolean
          id?: string
          secret?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          learning_data: Json
          preference_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          learning_data?: Json
          preference_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          learning_data?: Json
          preference_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_recordings: {
        Row: {
          audio_path: string
          created_at: string
          extracted_data: Json | null
          form_id: string | null
          id: string
          transcription: string | null
          user_id: string
        }
        Insert: {
          audio_path: string
          created_at?: string
          extracted_data?: Json | null
          form_id?: string | null
          id?: string
          transcription?: string | null
          user_id: string
        }
        Update: {
          audio_path?: string
          created_at?: string
          extracted_data?: Json | null
          form_id?: string | null
          id?: string
          transcription?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_recordings_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean
          webhook_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "custom_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      white_label_settings: {
        Row: {
          company_name: string
          created_at: string
          custom_domain: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
