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
      assistant_chats: {
        Row: {
          assistant_message: string
          created_at: string
          id: number
          user_id: string
          user_message: string
        }
        Insert: {
          assistant_message: string
          created_at?: string
          id?: number
          user_id: string
          user_message: string
        }
        Update: {
          assistant_message?: string
          created_at?: string
          id?: number
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
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
      power_sets: {
        Row: {
          created_at: string
          exercise1_category: string
          exercise1_name: string
          exercise2_category: string
          exercise2_name: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          exercise1_category: string
          exercise1_name: string
          exercise2_category: string
          exercise2_name: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          exercise1_category?: string
          exercise1_name?: string
          exercise2_category?: string
          exercise2_name?: string
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
          profile_photo_url: string | null
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
          profile_photo_url?: string | null
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
          profile_photo_url?: string | null
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
        Args: { user_id_param: string }
        Returns: number
      }
      get_user_comparison_stats: {
        Args: { time_range?: string }
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
        | "CARDIO"
        | "POWER SETS"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      exercise_category: [
        "ΣΤΗΘΟΣ",
        "ΠΛΑΤΗ",
        "ΔΙΚΕΦΑΛΑ",
        "ΤΡΙΚΕΦΑΛΑ",
        "ΩΜΟΙ",
        "ΠΟΔΙΑ",
        "ΚΟΡΜΟΣ",
        "CARDIO",
        "POWER SETS",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
