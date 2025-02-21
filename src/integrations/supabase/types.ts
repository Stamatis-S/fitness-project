export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comparison_history: {
        Row: {
          comparison_date: string | null
          id: number
          stats_a: Json | null
          stats_b: Json | null
          time_range: string | null
          user_id_a: string | null
          user_id_b: string | null
        }
        Insert: {
          comparison_date?: string | null
          id?: number
          stats_a?: Json | null
          stats_b?: Json | null
          time_range?: string | null
          user_id_a?: string | null
          user_id_b?: string | null
        }
        Update: {
          comparison_date?: string | null
          id?: number
          stats_a?: Json | null
          stats_b?: Json | null
          time_range?: string | null
          user_id_a?: string | null
          user_id_b?: string | null
        }
        Relationships: []
      }
      custom_exercises: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string
          id: number
          name: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          id?: number
          name: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_difficulty: {
        Row: {
          created_at: string
          difficulty_factor: number
          exercise_name: string
          id: number
        }
        Insert: {
          created_at?: string
          difficulty_factor?: number
          exercise_name: string
          id?: number
        }
        Update: {
          created_at?: string
          difficulty_factor?: number
          exercise_name?: string
          id?: number
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string
          id: number
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          fitness_level: string | null
          fitness_score: number | null
          id: string
          last_score_update: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          fitness_level?: string | null
          fitness_score?: number | null
          id: string
          last_score_update?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          fitness_level?: string | null
          fitness_score?: number | null
          id?: string
          last_score_update?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      workout_cycles: {
        Row: {
          completed_at: string | null
          completed_days: number | null
          created_at: string
          id: number
          is_active: boolean | null
          last_notification_sent: string | null
          notifications_enabled: boolean | null
          start_date: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_days?: number | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          last_notification_sent?: string | null
          notifications_enabled?: boolean | null
          start_date: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_days?: number | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          last_notification_sent?: string | null
          notifications_enabled?: boolean | null
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string
          custom_exercise: string | null
          exercise_id: number | null
          id: number
          reps: number | null
          set_number: number
          user_id: string
          weight_kg: number | null
          workout_date: string
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          custom_exercise?: string | null
          exercise_id?: number | null
          id?: number
          reps?: number | null
          set_number: number
          user_id: string
          weight_kg?: number | null
          workout_date?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          custom_exercise?: string | null
          exercise_id?: number | null
          id?: number
          reps?: number | null
          set_number?: number
          user_id?: string
          weight_kg?: number | null
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_fitness_score: {
        Args: {
          user_id_param: string
        }
        Returns: number
      }
      delete_user_data: {
        Args: {
          user_id_to_delete: string
        }
        Returns: undefined
      }
      get_user_comparison_stats: {
        Args: {
          time_range?: string
        }
        Returns: {
          user_id: string
          username: string
          total_workouts: number
          total_volume: number
          max_weight: number
          estimated_calories: number
          pr_count: number
          comparison_date: string
        }[]
      }
      get_user_workout_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          username: string
          total_workouts: number
          max_weight: number
          total_volume: number
          favorite_category: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      exercise_category:
        | "ΣΤΗΘΟΣ"
        | "ΠΛΑΤΗ"
        | "ΔΙΚΕΦΑΛΑ"
        | "ΤΡΙΚΕΦΑΛΑ"
        | "ΩΜΟΙ"
        | "ΠΟΔΙΑ"
        | "ΚΟΡΜΟΣ"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
