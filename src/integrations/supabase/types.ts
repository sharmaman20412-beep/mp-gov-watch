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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      complaint_actions: {
        Row: {
          action: string
          actor_name: string | null
          actor_role: string
          complaint_id: string
          created_at: string
          escalation_level: number | null
          id: string
          reason: string
        }
        Insert: {
          action: string
          actor_name?: string | null
          actor_role: string
          complaint_id: string
          created_at?: string
          escalation_level?: number | null
          id?: string
          reason: string
        }
        Update: {
          action?: string
          actor_name?: string | null
          actor_role?: string
          complaint_id?: string
          created_at?: string
          escalation_level?: number | null
          id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_actions_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_evidence: {
        Row: {
          complaint_id: string
          created_at: string
          file_path: string
          id: string
          kind: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          file_path: string
          id?: string
          kind: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          file_path?: string
          id?: string
          kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_evidence_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_filers: {
        Row: {
          complaint_id: string
          contact_phone: string | null
          created_at: string
          user_id: string | null
        }
        Insert: {
          complaint_id: string
          contact_phone?: string | null
          created_at?: string
          user_id?: string | null
        }
        Update: {
          complaint_id?: string
          contact_phone?: string | null
          created_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_filers_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: true
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          accused_designation: string | null
          accused_name: string | null
          amount_demanded: number | null
          created_at: string
          description: string
          escalation_level: number
          id: string
          incident_date: string | null
          is_anonymous: boolean
          last_action_at: string
          overcharge_alert: boolean
          status: Database["public"]["Enums"]["complaint_status"]
          tracking_no: string
          type: Database["public"]["Enums"]["complaint_type"]
          work_id: string | null
        }
        Insert: {
          accused_designation?: string | null
          accused_name?: string | null
          amount_demanded?: number | null
          created_at?: string
          description: string
          escalation_level?: number
          id?: string
          incident_date?: string | null
          is_anonymous?: boolean
          last_action_at?: string
          overcharge_alert?: boolean
          status?: Database["public"]["Enums"]["complaint_status"]
          tracking_no: string
          type: Database["public"]["Enums"]["complaint_type"]
          work_id?: string | null
        }
        Update: {
          accused_designation?: string | null
          accused_name?: string | null
          amount_demanded?: number | null
          created_at?: string
          description?: string
          escalation_level?: number
          id?: string
          incident_date?: string | null
          is_anonymous?: boolean
          last_action_at?: string
          overcharge_alert?: boolean
          status?: Database["public"]["Enums"]["complaint_status"]
          tracking_no?: string
          type?: Database["public"]["Enums"]["complaint_type"]
          work_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          id: string
          name_en: string
          name_hi: string
        }
        Insert: {
          code: string
          id?: string
          name_en: string
          name_hi: string
        }
        Update: {
          code?: string
          id?: string
          name_en?: string
          name_hi?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          code: string
          id: string
          name_en: string
          name_hi: string
        }
        Insert: {
          code: string
          id?: string
          name_en: string
          name_hi: string
        }
        Update: {
          code?: string
          id?: string
          name_en?: string
          name_hi?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          department_id: string | null
          district_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          district_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          district_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      work_audit_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_by_name: string | null
          field: string
          id: string
          new_value: string | null
          old_value: string | null
          reason: string | null
          work_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          field: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          work_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_by_name?: string | null
          field?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_audit_log_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      works: {
        Row: {
          block: string | null
          code: string
          completed_on: string | null
          contractor_contact: string | null
          contractor_name: string | null
          created_at: string
          deadline: string | null
          department_id: string
          description_en: string | null
          description_hi: string | null
          district_id: string
          govt_order_no: string
          govt_order_url: string | null
          id: string
          lat: number | null
          lng: number | null
          sanctioned_amount: number
          spent_amount: number
          start_date: string | null
          status: Database["public"]["Enums"]["work_status"]
          title_en: string
          title_hi: string
          updated_at: string
          village: string | null
        }
        Insert: {
          block?: string | null
          code: string
          completed_on?: string | null
          contractor_contact?: string | null
          contractor_name?: string | null
          created_at?: string
          deadline?: string | null
          department_id: string
          description_en?: string | null
          description_hi?: string | null
          district_id: string
          govt_order_no: string
          govt_order_url?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          sanctioned_amount: number
          spent_amount?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          title_en: string
          title_hi: string
          updated_at?: string
          village?: string | null
        }
        Update: {
          block?: string | null
          code?: string
          completed_on?: string | null
          contractor_contact?: string | null
          contractor_name?: string | null
          created_at?: string
          deadline?: string | null
          department_id?: string
          description_en?: string | null
          description_hi?: string | null
          district_id?: string
          govt_order_no?: string
          govt_order_url?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          sanctioned_amount?: number
          spent_amount?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          title_en?: string
          title_hi?: string
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "works_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_official: { Args: { _user_id: string }; Returns: boolean }
      mark_overdue_works: { Args: never; Returns: number }
      run_escalations: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "citizen" | "dept_officer" | "collector" | "admin"
      complaint_status:
        | "submitted"
        | "under_review"
        | "action_taken"
        | "resolved"
        | "rejected"
      complaint_type: "overcharging" | "delay_quality"
      work_status: "planned" | "in_progress" | "delayed" | "completed"
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
      app_role: ["citizen", "dept_officer", "collector", "admin"],
      complaint_status: [
        "submitted",
        "under_review",
        "action_taken",
        "resolved",
        "rejected",
      ],
      complaint_type: ["overcharging", "delay_quality"],
      work_status: ["planned", "in_progress", "delayed", "completed"],
    },
  },
} as const
