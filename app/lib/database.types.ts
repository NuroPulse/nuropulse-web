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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          measurement_id: string | null
          message: string
          patient_id: string
          resolved_at: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          measurement_id?: string | null
          message: string
          patient_id: string
          resolved_at?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          measurement_id?: string | null
          message?: string
          patient_id?: string
          resolved_at?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "alerts_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "measurements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_details: {
        Row: {
          avatar_url: string | null
          id: string
          organization_name: string | null
          organization_type: string | null
          phone: string | null
          specialization: string | null
          str_number: string | null
          updated_at: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          organization_name?: string | null
          organization_type?: string | null
          phone?: string | null
          specialization?: string | null
          str_number?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          organization_name?: string | null
          organization_type?: string | null
          phone?: string | null
          specialization?: string | null
          str_number?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "doctor_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          algo_version: string
          band_power_ratio: number | null
          band_rms_g: number | null
          condition: string
          consistency: number | null
          device: Json
          duration_s: number
          features: Json | null
          id: string
          invalid_reason: string | null
          measured_at: string
          patient_id: string | null
          peak_frequency_hz: number | null
          snr: number | null
          status: string
          uploaded_at: string
        }
        Insert: {
          algo_version: string
          band_power_ratio?: number | null
          band_rms_g?: number | null
          condition: string
          consistency?: number | null
          device: Json
          duration_s: number
          features?: Json | null
          id: string
          invalid_reason?: string | null
          measured_at: string
          patient_id?: string | null
          peak_frequency_hz?: number | null
          snr?: number | null
          status: string
          uploaded_at?: string
        }
        Update: {
          algo_version?: string
          band_power_ratio?: number | null
          band_rms_g?: number | null
          condition?: string
          consistency?: number | null
          device?: Json
          duration_s?: number
          features?: Json | null
          id?: string
          invalid_reason?: string | null
          measured_at?: string
          patient_id?: string | null
          peak_frequency_hz?: number | null
          snr?: number | null
          status?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "measurements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "measurements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          id: string
          logged_at: string
          patient_id: string
          patient_medication_id: string
          schedule_id: string
          scheduled_at: string
          status: string
          taken_at: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          logged_at: string
          patient_id?: string
          patient_medication_id: string
          schedule_id?: string
          scheduled_at: string
          status?: string
          taken_at?: string | null
          uploaded_at: string
        }
        Update: {
          id?: string
          logged_at?: string
          patient_id?: string
          patient_medication_id?: string
          schedule_id?: string
          scheduled_at?: string
          status?: string
          taken_at?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "medication_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_patient_medication_id_fkey"
            columns: ["patient_medication_id"]
            isOneToOne: false
            referencedRelation: "patient_medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_schedules: {
        Row: {
          created_at: string
          doctor_id: string
          dose: string
          end_date: string | null
          id: string
          instructions: string | null
          is_active: boolean
          medicine_id: string
          patient_id: string
          start_date: string
          times: string[]
          updated_at: string
        }
        Insert: {
          created_at: string
          doctor_id?: string
          dose: string
          end_date?: string | null
          id?: string
          instructions?: string | null
          is_active: boolean
          medicine_id?: string
          patient_id?: string
          start_date: string
          times: string[]
          updated_at: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          dose?: string
          end_date?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          medicine_id?: string
          patient_id?: string
          start_date?: string
          times?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_schedules_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_schedules_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_details"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          common_dosage: string
          created_at: string
          created_by: string | null
          created_by_name?: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          common_dosage: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          common_dosage?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicines_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "doctor_details"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          alert_id: string | null
          body: string
          created_at: string
          id: string
          is_read: boolean
          patient_id: string | null
          recipient_id: string
          title: string
        }
        Insert: {
          alert_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          patient_id?: string | null
          recipient_id: string
          title: string
        }
        Update: {
          alert_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          patient_id?: string | null
          recipient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_details: {
        Row: {
          connected_at: string | null
          doctor_id: string | null
          email: string | null
          full_name: string | null
          id: string
          last_measured_at: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          connected_at?: string | null
          doctor_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_measured_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          connected_at?: string | null
          doctor_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_measured_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medications: {
        Row: {
          created_at: string
          dose: string
          end_date: string | null
          id: string
          is_active: boolean
          medicine_id: string
          notes: string | null
          patient_id: string
          prescribed_by: string
          schedule_times: string[]
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dose: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          medicine_id: string
          notes?: string | null
          patient_id: string
          prescribed_by?: string
          schedule_times?: string[]
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dose?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          medicine_id?: string
          notes?: string | null
          patient_id?: string
          prescribed_by?: string
          schedule_times?: string[]
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_medications_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medications_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_medications_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          connected_at: string | null
          connection_code: string | null
          created_at: string
          doctor_id: string | null
          email: string
          full_name: string
          id: string
          phone: string
          role: string
        }
        Insert: {
          connected_at?: string | null
          connection_code?: string | null
          created_at?: string
          doctor_id?: string | null
          email: string
          full_name: string
          id: string
          phone: string
          role: string
        }
        Update: {
          connected_at?: string | null
          connection_code?: string | null
          created_at?: string
          doctor_id?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "profiles_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      patient_overview: {
        Row: {
          connected_at: string | null
          date_of_birth: string | null
          diagnosis: string | null
          doctor_id: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          last_measured_at: string | null
          last_measurement_status: string | null
          last_peak_frequency_hz: number | null
          monitoring_status: string | null
          open_alerts: number | null
          patient_id: string | null
          phone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "patient_overview"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "profiles_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      claim_measurements: { Args: { p_ids: string[] }; Returns: number }
      connect_to_doctor: { Args: { p_code: string }; Returns: string }
      generate_connection_code: { Args: never; Returns: string }
      is_my_patient: { Args: { p_patient: string }; Returns: boolean }
      make_doctor: { Args: { p_user_id: string }; Returns: string }
      my_doctor_id: { Args: never; Returns: string }
      my_role: { Args: never; Returns: string }
      regenerate_connection_code: { Args: never; Returns: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
