/**
 * ROUTINE SCHEMER - PROGRAM ARCHITECTURE TYPES
 * 
 * "Esto es un plano arquitectónico, no un diario de entrenamiento."
 * 
 * Sistema de tipos para planificación estructural de programas de entrenamiento.
 * TODO es diseño, NADA es logging.
 */

// ============================================================================
// CORE PROGRAM STRUCTURE
// ============================================================================

export type PhaseType = 'volume' | 'intensity' | 'peaking' | 'deload' | 'transition';
export type SessionType = 'strength' | 'hypertrophy' | 'power' | 'endurance' | 'skill' | 'recovery';
export type SplitType = 'push_pull_legs' | 'upper_lower' | 'full_body' | 'body_part' | 'custom';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// ============================================================================
// PROGRESSION RULES
// ============================================================================

export interface ProgressionRule {
  id: string;
  type: 'linear' | 'wave' | 'step' | 'custom';
  variable: 'weight' | 'reps' | 'sets' | 'intensity';
  startValue: number;
  incrementPerWeek: number;
  incrementPerMesocycle?: number;
  capValue?: number; // valor máximo
  deloadReduction?: number; // % de reducción en deload (ej: 0.7 = -30%)
}

// ============================================================================
// SESSION TEMPLATE (Plantilla de sesión reutilizable)
// ============================================================================

export interface SessionExercise {
  id: string;
  exerciseId: string; // referencia a Exercise de la librería
  exerciseName: string;
  sets: number;
  reps: string; // "8-12", "5", "AMRAP"
  intensityPercent?: number; // % de 1RM (ej: 75)
  tempo?: string; // "3010" (eccentric-pause-concentric-pause)
  restSeconds: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
  order: number;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export interface SessionTemplate {
  id: string;
  name: string;
  type: SessionType;
  focus: string[]; // ["chest", "triceps", "shoulders"]
  exercises: SessionExercise[];
  estimatedDurationMinutes: number;
  estimatedVolume: number; // sets × reps × peso promedio (calculado)
  color: string; // para UI (#3b82f6, etc.)
  icon?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// WEEKLY SPLIT (Semana Modelo / Template)
// ============================================================================

export interface WeeklySplitDay {
  dayOfWeek: DayOfWeek;
  sessionTemplateId: string | null;
  sessionTemplate?: SessionTemplate;
  isRestDay: boolean;
  notes?: string;
}

export interface WeeklySplit {
  id: string;
  name: string;
  type: SplitType;
  days: WeeklySplitDay[]; // siempre 7 elementos (lun-dom)
  totalSessionsPerWeek: number;
  estimatedWeeklyVolume: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MESOCYCLE (Bloque de entrenamiento)
// ============================================================================

export interface MesocycleWeek {
  weekNumber: number; // 1-6 dentro del mesociclo
  weeklySplitId: string;
  weeklySplit?: WeeklySplit;
  progressionModifier?: number; // multiplicador (1.0 = normal, 1.05 = +5%, 0.7 = deload)
  intensityModifier?: number;
  volumeModifier?: number;
  notes?: string;
}

export interface Mesocycle {
  id: string;
  name: string;
  phase: PhaseType;
  goal: string; // "Aumentar volumen de press", "Peaking de sentadilla"
  durationWeeks: number;
  weeks: MesocycleWeek[];
  baseIntensityPercent: number; // % promedio de 1RM (ej: 70)
  baseVolumeMultiplier: number; // 1.0 = normal, 1.2 = +20% volumen
  color: string; // azul para volumen, rojo para intensidad, verde para deload
  order: number; // orden en el programa
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PROGRAM (Programa completo - El Blueprint)
// ============================================================================

export interface Program {
  id: string;
  userId: string;
  name: string;
  description?: string;
  splitType: SplitType;
  totalWeeks: number;
  sessionsPerWeek: number;
  mesocycles: Mesocycle[];
  sessionTemplates: SessionTemplate[]; // biblioteca de sesiones
  weeklySplits: WeeklySplit[]; // biblioteca de splits semanales
  progressionRules: ProgressionRule[];
  isActive: boolean;
  isTemplate: boolean; // puede guardarse como plantilla reutilizable
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ANALYTICS & STATISTICS (Análisis del diseño, NO del rendimiento)
// ============================================================================

export interface MuscleGroupVolume {
  muscleGroup: string;
  totalSets: number;
  totalReps: number;
  avgIntensity: number;
  sessionsPerWeek: number;
}

export interface ProgramAnalytics {
  programId: string;
  totalWeeks: number;
  totalMesocycles: number;
  avgSessionsPerWeek: number;
  
  // Distribución de volumen
  volumeByMuscleGroup: MuscleGroupVolume[];
  totalWeeklyVolume: number;
  
  // Balance de entrenamiento
  pushPullRatio: number; // ej: 1.2 (20% más empuje que tracción)
  upperLowerRatio: number;
  compoundIsolationRatio: number;
  
  // Distribución de rangos de repeticiones
  repRangeDistribution: {
    strength: number; // % de series en 1-5 reps
    hypertrophy: number; // % en 6-12 reps
    endurance: number; // % en 13+ reps
  };
  
  // Distribución de tipos de sesión
  sessionTypeDistribution: {
    [key in SessionType]: number; // % de sesiones de cada tipo
  };
  
  // Estimación de fatiga/recuperación
  estimatedRecoveryScore: number; // 0-100 (basado en volumen + frecuencia)
  deloadFrequency: number; // cada cuántas semanas hay deload
}

// ============================================================================
// UI / VIEW MODELS
// ============================================================================

export interface WeekViewModel {
  weekNumber: number;
  mesocycleId: string;
  mesocycleName: string;
  phase: PhaseType;
  days: {
    dayOfWeek: DayOfWeek;
    sessionName: string | null;
    sessionType: SessionType | null;
    estimatedVolume: number;
    focus: string[];
    isRestDay: boolean;
  }[];
}

export interface MesocycleTimelineItem {
  id: string;
  name: string;
  phase: PhaseType;
  durationWeeks: number;
  startWeek: number; // semana global del programa
  endWeek: number;
  color: string;
  goal: string;
}

export interface ProgramTimeline {
  totalWeeks: number;
  mesocycles: MesocycleTimelineItem[];
  currentWeek?: number; // solo si hay progreso real (opcional)
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

export const PHASE_COLORS: Record<PhaseType, string> = {
  volume: '#3b82f6', // blue-500
  intensity: '#ef4444', // red-500
  peaking: '#f59e0b', // amber-500
  deload: '#10b981', // green-500
  transition: '#8b5cf6', // violet-500
};

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  strength: '#dc2626', // red-600
  hypertrophy: '#2563eb', // blue-600
  power: '#f59e0b', // amber-500
  endurance: '#10b981', // green-500
  skill: '#8b5cf6', // violet-500
  recovery: '#06b6d4', // cyan-500
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mié',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sáb',
  sunday: 'Dom',
};

export const PHASE_LABELS: Record<PhaseType, string> = {
  volume: 'Volumen',
  intensity: 'Intensidad',
  peaking: 'Peaking',
  deload: 'Descarga',
  transition: 'Transición',
};
