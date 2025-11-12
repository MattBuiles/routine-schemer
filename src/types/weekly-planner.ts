import { WorkoutSession } from './index';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped';

export interface ScheduledSession {
  id: string;
  workoutSession: WorkoutSession;
  dayOfWeek: DayOfWeek;
  startTime?: string; // HH:mm format
  status: SessionStatus;
  progress?: number; // 0-100
  completedAt?: Date;
  notes?: string;
}

export interface WeeklyPlan {
  id: string;
  userId: string;
  weekStartDate: Date;
  sessions: ScheduledSession[];
  totalVolume?: number;
  completionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutLibraryItem {
  id: string;
  session: WorkoutSession;
  isFavorite: boolean;
  lastUsed?: Date;
  useCount: number;
}
