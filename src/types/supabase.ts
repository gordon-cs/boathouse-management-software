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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      additional_rower: {
        Row: {
          check_out_id: number
          user_id: number
        }
        Insert: {
          check_out_id?: number
          user_id: number
        }
        Update: {
          check_out_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "check_out_user_check_out_id_fkey"
            columns: ["check_out_id"]
            isOneToOne: true
            referencedRelation: "check_out"
            referencedColumns: ["check_out_id"]
          },
          {
            foreignKeyName: "check_out_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      boat: {
        Row: {
          boat_id: number
          inboard: number | null
          make: string | null
          max_weight: number | null
          min_weight: number | null
          name: string | null
          pitch: number | null
          seats: number
          year: number | null
        }
        Insert: {
          boat_id: number
          inboard?: number | null
          make?: string | null
          max_weight?: number | null
          min_weight?: number | null
          name?: string | null
          pitch?: number | null
          seats: number
          year?: number | null
        }
        Update: {
          boat_id?: number
          inboard?: number | null
          make?: string | null
          max_weight?: number | null
          min_weight?: number | null
          name?: string | null
          pitch?: number | null
          seats?: number
          year?: number | null
        }
        Relationships: []
      }
      check_out: {
        Row: {
          boat_id: number
          check_out_id: number
          date: string
          time_in: string | null
          time_out: string | null
          user_id: number
        }
        Insert: {
          boat_id: number
          check_out_id: number
          date: string
          time_in?: string | null
          time_out?: string | null
          user_id: number
        }
        Update: {
          boat_id?: number
          check_out_id?: number
          date?: string
          time_in?: string | null
          time_out?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "check_out_log_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boat"
            referencedColumns: ["boat_id"]
          },
          {
            foreignKeyName: "check_out_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      repair: {
        Row: {
          boat_id: number | null
          check_out_id: number | null
          data: string | null
          date: string | null
          repair_id: number
          repair_type: string | null
          user_id: number | null
        }
        Insert: {
          boat_id?: number | null
          check_out_id?: number | null
          data?: string | null
          date?: string | null
          repair_id: number
          repair_type?: string | null
          user_id?: number | null
        }
        Update: {
          boat_id?: number | null
          check_out_id?: number | null
          data?: string | null
          date?: string | null
          repair_id?: number
          repair_type?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boat"
            referencedColumns: ["boat_id"]
          },
          {
            foreignKeyName: "repair_check_out_id_fkey"
            columns: ["check_out_id"]
            isOneToOne: false
            referencedRelation: "check_out"
            referencedColumns: ["check_out_id"]
          },
          {
            foreignKeyName: "repair_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user: {
        Row: {
          is_single_approved: boolean | null
          user_id: number
          user_name: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          is_single_approved?: boolean | null
          user_id: number
          user_name: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          is_single_approved?: boolean | null
          user_id?: number
          user_name?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "master" | "collegiate" | "junior" | "middie" | "other"
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
    Enums: {
      user_type: ["master", "collegiate", "junior", "middie", "other"],
    },
  },
} as const
