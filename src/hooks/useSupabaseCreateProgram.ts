import { useState } from 'react';
import { supabaseService } from '@/lib/supabaseService';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import { PhaseType, SessionType, SplitType, DayOfWeek } from '@/types/program';

export interface CreateCompleteProgramData {
  name: string;
  description?: string;
  splitType: SplitType;
  totalWeeks: number;
  sessionsPerWeek: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  sessionTemplates: Array<{
    name: string;
    type: SessionType;
    focus: string[];
    color: string;
    estimatedDurationMinutes: number;
    exercises: Array<{
      exerciseId?: string;
      exerciseName: string;
      sets: number;
      reps: string;
      intensityPercent?: number;
      restSeconds: number;
      primaryMuscles: string[];
      secondaryMuscles: string[];
      notes?: string;
    }>;
  }>;
  weeklySplit: {
    name: string;
    type: SplitType;
    days: Array<{
      dayOfWeek: DayOfWeek;
      sessionTemplateName?: string;
      isRestDay: boolean;
      notes?: string;
    }>;
  };
  mesocycles: Array<{
    name: string;
    phase: PhaseType;
    goal: string;
    durationWeeks: number;
    baseIntensityPercent: number;
    baseVolumeMultiplier: number;
    color: string;
    notes?: string;
  }>;
  progressionRules?: Array<{
    type: 'linear' | 'wave' | 'step' | 'custom';
    variable: 'weight' | 'reps' | 'sets' | 'intensity';
    startValue: number;
    incrementPerWeek: number;
    incrementPerMesocycle?: number;
    capValue?: number;
    deloadReduction?: number;
  }>;
}

export function useSupabaseCreateProgram() {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCompleteProgram = async (data: CreateCompleteProgramData) => {
    if (!user) {
      setError('Debes iniciar sesión para crear un programa');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const programId = await supabaseService.createCompleteProgram({
        userId: user.id,
        ...data,
      });

      setIsLoading(false);
      return programId;
    } catch (err) {
      console.error('Error creating program:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsLoading(false);
      return null;
    }
  };

  return {
    createCompleteProgram,
    isLoading,
    error,
  };
}
