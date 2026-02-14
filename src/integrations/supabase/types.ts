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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          crq_id: string
          details: Json | null
          id: string
          new_state: string | null
          performed_by: string
          previous_state: string | null
          timestamp: string
        }
        Insert: {
          action: string
          crq_id: string
          details?: Json | null
          id?: string
          new_state?: string | null
          performed_by: string
          previous_state?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          crq_id?: string
          details?: Json | null
          id?: string
          new_state?: string | null
          performed_by?: string
          previous_state?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_crq_id_fkey"
            columns: ["crq_id"]
            isOneToOne: false
            referencedRelation: "crqs"
            referencedColumns: ["id"]
          },
        ]
      }
      crq_attachments: {
        Row: {
          crq_id: string
          file_name: string
          file_path: string
          file_type: Database["public"]["Enums"]["attachment_type"]
          id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          crq_id: string
          file_name: string
          file_path: string
          file_type?: Database["public"]["Enums"]["attachment_type"]
          id?: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          crq_id?: string
          file_name?: string
          file_path?: string
          file_type?: Database["public"]["Enums"]["attachment_type"]
          id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "crq_attachments_crq_id_fkey"
            columns: ["crq_id"]
            isOneToOne: false
            referencedRelation: "crqs"
            referencedColumns: ["id"]
          },
        ]
      }
      crqs: {
        Row: {
          change_type: Database["public"]["Enums"]["change_type"]
          created_at: string
          created_by: string
          description: string
          domain: string
          id: string
          scheduled_date: string | null
          state: Database["public"]["Enums"]["crq_state"]
          title: string
          updated_at: string
        }
        Insert: {
          change_type?: Database["public"]["Enums"]["change_type"]
          created_at?: string
          created_by: string
          description: string
          domain: string
          id?: string
          scheduled_date?: string | null
          state?: Database["public"]["Enums"]["crq_state"]
          title: string
          updated_at?: string
        }
        Update: {
          change_type?: Database["public"]["Enums"]["change_type"]
          created_at?: string
          created_by?: string
          description?: string
          domain?: string
          id?: string
          scheduled_date?: string | null
          state?: Database["public"]["Enums"]["crq_state"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          domain: string | null
          email: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          email: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          email?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_domain: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "engineer"
        | "cfm"
        | "domain_head"
        | "cab"
        | "change_manager"
        | "noc"
      attachment_type: "mop" | "backout" | "other"
      change_type: "standard" | "normal" | "emergency" | "latent"
      crq_state:
        | "draft"
        | "impact_analysis"
        | "approval_pending"
        | "cab_review"
        | "scheduled"
        | "pre_validation"
        | "implemented"
        | "closed"
        | "rejected"
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
      app_role: [
        "engineer",
        "cfm",
        "domain_head",
        "cab",
        "change_manager",
        "noc",
      ],
      attachment_type: ["mop", "backout", "other"],
      change_type: ["standard", "normal", "emergency", "latent"],
      crq_state: [
        "draft",
        "impact_analysis",
        "approval_pending",
        "cab_review",
        "scheduled",
        "pre_validation",
        "implemented",
        "closed",
        "rejected",
      ],
    },
  },
} as const
