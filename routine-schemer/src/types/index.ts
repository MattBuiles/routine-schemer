export interface User {
  id: string;
  email: string;
  displayName?: string;
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
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type WorkoutType = 
  | 'strength'
  | 'hypertrophy'
  | 'endurance'
  | 'power'
  | 'flexibility'
  | 'cardio'
  | 'recovery';

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
  date: string; // YYYY-MM-DD
  sessionId: string;
  session: WorkoutSession;
  completed?: boolean;
  actualDuration?: number;
  notes?: string;
}

export interface ExerciseFilter {
  bodyPart?: string;
  equipment?: string;
  target?: string;
  search?: string;
}
