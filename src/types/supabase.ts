export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          age: number | null
          weight: number | null
          height: number | null
          body_fat: number | null
          activity_level: string | null
          experience: string | null
          weekly_goal: number | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          age?: number | null
          weight?: number | null
          height?: number | null
          body_fat?: number | null
          activity_level?: string | null
          experience?: string | null
          weekly_goal?: number | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          age?: number | null
          weight?: number | null
          height?: number | null
          body_fat?: number | null
          activity_level?: string | null
          experience?: string | null
          weekly_goal?: number | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_goals: {
        Row: {
          id: string
          user_id: string
          goal: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal?: string
          created_at?: string
        }
      }
      training_programs: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          split_type: string
          total_weeks: number
          sessions_per_week: number
          is_active: boolean
          is_template: boolean
          tags: string[]
          difficulty: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          split_type: string
          total_weeks: number
          sessions_per_week: number
          is_active?: boolean
          is_template?: boolean
          tags?: string[]
          difficulty?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          split_type?: string
          total_weeks?: number
          sessions_per_week?: number
          is_active?: boolean
          is_template?: boolean
          tags?: string[]
          difficulty?: string
          created_at?: string
          updated_at?: string
        }
      }
      session_templates: {
        Row: {
          id: string
          program_id: string
          name: string
          type: string
          focus: string[]
          color: string
          estimated_duration_minutes: number
          order_index: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          name: string
          type: string
          focus?: string[]
          color?: string
          estimated_duration_minutes?: number
          order_index?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          name?: string
          type?: string
          focus?: string[]
          color?: string
          estimated_duration_minutes?: number
          order_index?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_exercises: {
        Row: {
          id: string
          session_template_id: string
          exercise_id: string | null
          exercise_name: string
          sets: number
          reps: string
          intensity_percent: number | null
          tempo: string | null
          rest_seconds: number
          rpe: number | null
          notes: string | null
          order_index: number
          primary_muscles: string[]
          secondary_muscles: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_template_id: string
          exercise_id?: string | null
          exercise_name: string
          sets: number
          reps: string
          intensity_percent?: number | null
          tempo?: string | null
          rest_seconds?: number
          rpe?: number | null
          notes?: string | null
          order_index?: number
          primary_muscles?: string[]
          secondary_muscles?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_template_id?: string
          exercise_id?: string | null
          exercise_name?: string
          sets?: number
          reps?: string
          intensity_percent?: number | null
          tempo?: string | null
          rest_seconds?: number
          rpe?: number | null
          notes?: string | null
          order_index?: number
          primary_muscles?: string[]
          secondary_muscles?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      weekly_splits: {
        Row: {
          id: string
          program_id: string
          name: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          name: string
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          name?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      weekly_split_days: {
        Row: {
          id: string
          weekly_split_id: string
          day_of_week: string
          session_template_id: string | null
          is_rest_day: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          weekly_split_id: string
          day_of_week: string
          session_template_id?: string | null
          is_rest_day?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          weekly_split_id?: string
          day_of_week?: string
          session_template_id?: string | null
          is_rest_day?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mesocycles: {
        Row: {
          id: string
          program_id: string
          name: string
          phase: string
          goal: string
          duration_weeks: number
          base_intensity_percent: number
          base_volume_multiplier: number
          color: string
          order_index: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          name: string
          phase: string
          goal: string
          duration_weeks: number
          base_intensity_percent?: number
          base_volume_multiplier?: number
          color?: string
          order_index?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          name?: string
          phase?: string
          goal?: string
          duration_weeks?: number
          base_intensity_percent?: number
          base_volume_multiplier?: number
          color?: string
          order_index?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mesocycle_weeks: {
        Row: {
          id: string
          mesocycle_id: string
          week_number: number
          weekly_split_id: string | null
          progression_modifier: number
          intensity_modifier: number
          volume_modifier: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mesocycle_id: string
          week_number: number
          weekly_split_id?: string | null
          progression_modifier?: number
          intensity_modifier?: number
          volume_modifier?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mesocycle_id?: string
          week_number?: number
          weekly_split_id?: string | null
          progression_modifier?: number
          intensity_modifier?: number
          volume_modifier?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      progression_rules: {
        Row: {
          id: string
          program_id: string
          type: string
          variable: string
          start_value: number
          increment_per_week: number
          increment_per_mesocycle: number | null
          cap_value: number | null
          deload_reduction: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          type: string
          variable: string
          start_value: number
          increment_per_week: number
          increment_per_mesocycle?: number | null
          cap_value?: number | null
          deload_reduction?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          type?: string
          variable?: string
          start_value?: number
          increment_per_week?: number
          increment_per_mesocycle?: number | null
          cap_value?: number | null
          deload_reduction?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          body_part: string
          equipment: string
          target: string
          instructions: string[]
          gif_url: string | null
          secondary_muscles: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          body_part: string
          equipment: string
          target: string
          instructions?: string[]
          gif_url?: string | null
          secondary_muscles?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          body_part?: string
          equipment?: string
          target?: string
          instructions?: string[]
          gif_url?: string | null
          secondary_muscles?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_program_total_weeks: {
        Args: { program_id_param: string }
        Returns: number
      }
      get_program_timeline: {
        Args: { program_id_param: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
