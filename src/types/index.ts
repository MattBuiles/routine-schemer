export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider?: 'google' | 'email';
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  instructions: string[];
  gifUrl?: string;
  secondaryMuscles: string[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: string; // e.g., "8-12", "10", "AMRAP"
  weight?: number;
  restTime: number; // in seconds
  notes?: string;
  order: number;
}

export interface WorkoutSession {
  id: string;
  name: string;
  type: WorkoutType;
  exercises: WorkoutExercise[];
  estimatedDuration: number; // in minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Microcycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  sessions: { [key: string]: WorkoutSession }; // key is date string (YYYY-MM-DD)
  notes?: string;
}

export interface Mesocycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  microcycles: Microcycle[];
  goal: TrainingGoal;
  notes?: string;
}

export interface TrainingProgram {
  id: string;
  userId: string;
  name: string;
  description?: string;
  mesocycles: Mesocycle[];
  split: TrainingSplit;
  goal: TrainingGoal;
  duration: number; // weeks
  sessionsPerWeek: number;
  estimatedDuration: number; // minutes per session
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
  isActive: boolean;
  tags: string[];
  workoutSessions: WorkoutSession[];
  microcycles: Microcycle[];
  createdAt: Date;
  updatedAt: Date;
}

export type WorkoutType = 
  | 'strength'
  | 'hypertrophy'
  | 'endurance'
  | 'power'
  | 'flexibility'
  | 'cardio'
  | 'recovery'
  | 'mobility'
  | 'stretching'
  | 'conditioning';

export type TrainingGoal = 
  | 'muscle_gain'
  | 'strength'
  | 'fat_loss'
  | 'endurance'
  | 'general_fitness'
  | 'sport_specific';

export type TrainingSplit = 
  | 'full_body'
  | 'upper_lower'
  | 'push_pull_legs'
  | 'body_part'
  | 'custom';

export interface CalendarEvent {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM format
  title: string;
  type: 'routine' | 'habit' | 'note' | 'workout' | 'nutrition' | 'other';
  duration?: number; // in minutes
  description?: string;
  sessionId?: string;
  session?: WorkoutSession;
  completed?: boolean;
  actualDuration?: number;
  notes?: string;
  category?: 'workout' | 'nutrition' | 'habit' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseFilter {
  bodyPart?: string;
  equipment?: string;
  target?: string;
  search?: string;
}

// Nuevos tipos para hábitos y notas
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: HabitType;
  target: number; // objetivo diario (ej: 8 vasos de agua, 8 horas de sueño)
  unit: string; // unidad de medida (vasos, horas, gramos, etc.)
  color: string; // color para la UI
  icon: string; // nombre del icono
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isFavorite?: boolean;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  value: number; // valor registrado
  notes?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: NoteType;
  tags: string[];
  workoutSessionId?: string; // si está relacionada con un entrenamiento específico
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  age?: number;
  weight?: number;
  height?: number;
  bodyFat?: number;
  activityLevel: ActivityLevel;
  goals: TrainingGoal[];
  experience: ExperienceLevel;
  preferences: UserPreferences;
  weeklyGoal?: number; // target workout sessions per week
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  defaultRestTime: number; // segundos
  units: 'metric' | 'imperial';
  weekStartDay: 'monday' | 'sunday';
}

export interface NotificationSettings {
  workoutReminders: boolean;
  habitReminders: boolean;
  progressUpdates: boolean;
  emailNotifications: boolean;
}

export type HabitType = 
  | 'water_intake'
  | 'sleep'
  | 'nutrition'
  | 'supplements'
  | 'meditation'
  | 'steps'
  | 'weight'
  | 'custom';

export type NoteType = 
  | 'general'
  | 'workout'
  | 'nutrition'
  | 'progress'
  | 'idea'
  | 'reminder';

export type ActivityLevel = 
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type ExperienceLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';
