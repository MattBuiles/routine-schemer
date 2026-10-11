export interface CalendarEvent {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM format
  title: string;
  type: 'routine' | 'habit' | 'note' | 'workout' | 'nutrition' | 'other';
  duration?: number; // in minutes
  description?: string;
  sessionId?: string; // plantilla de sesión enlazada (session_templates)
  completed?: boolean;
  actualDuration?: number;
  notes?: string;
  category?: 'workout' | 'nutrition' | 'habit' | 'other';
  createdAt: Date;
  updatedAt: Date;
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

export type NoteType = 'general' | 'workout' | 'nutrition' | 'progress' | 'idea' | 'reminder';

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
