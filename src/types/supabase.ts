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
          activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
          experience: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
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
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
          experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
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
          activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | null
          experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null
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
          goal: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal?: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific'
          created_at?: string
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
      training_programs: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          split: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part' | 'custom'
          goal: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific'
          duration: number
          sessions_per_week: number
          estimated_duration: number | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          is_public: boolean
          is_active: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          split: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part' | 'custom'
          goal: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific'
          duration: number
          sessions_per_week: number
          estimated_duration?: number | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          is_public?: boolean
          is_active?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          split?: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part' | 'custom'
          goal?: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific'
          duration?: number
          sessions_per_week?: number
          estimated_duration?: number | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          is_public?: boolean
          is_active?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          program_id: string | null
          user_id: string
          name: string
          type: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'flexibility' | 'cardio' | 'recovery' | 'mobility' | 'stretching' | 'conditioning'
          estimated_duration: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id?: string | null
          user_id: string
          name: string
          type: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'flexibility' | 'cardio' | 'recovery' | 'mobility' | 'stretching' | 'conditioning'
          estimated_duration?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string | null
          user_id?: string
          name?: string
          type?: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'flexibility' | 'cardio' | 'recovery' | 'mobility' | 'stretching' | 'conditioning'
          estimated_duration?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          sets: number
          reps: string
          weight: number | null
          rest_time: number
          notes: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          sets: number
          reps: string
          weight?: number | null
          rest_time: number
          notes?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          sets?: number
          reps?: string
          weight?: number | null
          rest_time?: number
          notes?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      mesocycles: {
        Row: {
          id: string
          program_id: string
          name: string
          start_date: string
          end_date: string
          goal: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          name: string
          start_date: string
          end_date: string
          goal: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          name?: string
          start_date?: string
          end_date?: string
          goal?: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      microcycles: {
        Row: {
          id: string
          mesocycle_id: string | null
          program_id: string
          name: string
          start_date: string
          end_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mesocycle_id?: string | null
          program_id: string
          name: string
          start_date: string
          end_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mesocycle_id?: string | null
          program_id?: string
          name?: string
          start_date?: string
          end_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      microcycle_sessions: {
        Row: {
          id: string
          microcycle_id: string
          session_id: string
          scheduled_date: string
          created_at: string
        }
        Insert: {
          id?: string
          microcycle_id: string
          session_id: string
          scheduled_date: string
          created_at?: string
        }
        Update: {
          id?: string
          microcycle_id?: string
          session_id?: string
          scheduled_date?: string
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          date: string
          time: string | null
          title: string
          type: 'routine' | 'habit' | 'note' | 'workout' | 'nutrition' | 'other'
          duration: number | null
          description: string | null
          session_id: string | null
          completed: boolean
          actual_duration: number | null
          notes: string | null
          category: 'workout' | 'nutrition' | 'habit' | 'other' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          time?: string | null
          title: string
          type: 'routine' | 'habit' | 'note' | 'workout' | 'nutrition' | 'other'
          duration?: number | null
          description?: string | null
          session_id?: string | null
          completed?: boolean
          actual_duration?: number | null
          notes?: string | null
          category?: 'workout' | 'nutrition' | 'habit' | 'other' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          time?: string | null
          title?: string
          type?: 'routine' | 'habit' | 'note' | 'workout' | 'nutrition' | 'other'
          duration?: number | null
          description?: string | null
          session_id?: string | null
          completed?: boolean
          actual_duration?: number | null
          notes?: string | null
          category?: 'workout' | 'nutrition' | 'habit' | 'other' | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          type: 'water_intake' | 'sleep' | 'nutrition' | 'supplements' | 'meditation' | 'steps' | 'weight' | 'custom'
          target: number
          unit: string
          color: string
          icon: string
          is_active: boolean
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          type: 'water_intake' | 'sleep' | 'nutrition' | 'supplements' | 'meditation' | 'steps' | 'weight' | 'custom'
          target: number
          unit: string
          color: string
          icon: string
          is_active?: boolean
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          type?: 'water_intake' | 'sleep' | 'nutrition' | 'supplements' | 'meditation' | 'steps' | 'weight' | 'custom'
          target?: number
          unit?: string
          color?: string
          icon?: string
          is_active?: boolean
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      habit_records: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          date: string
          value: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          date: string
          value: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          date?: string
          value?: number
          notes?: string | null
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: 'general' | 'workout' | 'nutrition' | 'progress' | 'idea' | 'reminder'
          tags: string[]
          workout_session_id: string | null
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          type: 'general' | 'workout' | 'nutrition' | 'progress' | 'idea' | 'reminder'
          tags?: string[]
          workout_session_id?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          type?: 'general' | 'workout' | 'nutrition' | 'progress' | 'idea' | 'reminder'
          tags?: string[]
          workout_session_id?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      workout_sessions_with_details: {
        Row: {
          id: string
          program_id: string | null
          user_id: string
          name: string
          type: string
          estimated_duration: number | null
          notes: string | null
          created_at: string
          updated_at: string
          exercise_count: number
          body_parts_targeted: string[]
        }
      }
      user_workout_stats: {
        Row: {
          user_id: string
          completed_workouts: number
          workouts_this_week: number
          workouts_this_month: number
          avg_workout_duration: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
