import { useState } from 'react';
import { supabaseService } from '@/lib/supabaseService';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';

export interface CreateProgramData {
  // Basic Info
  name: string;
  description: string;
  
  // Program Details
  split: 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part' | 'custom';
  goal: 'muscle_gain' | 'strength' | 'fat_loss' | 'endurance' | 'general_fitness' | 'sport_specific';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // Structure
  duration: number; // weeks
  sessionsPerWeek: number;
  estimatedDuration: number; // minutes per session
  
  // Optional
  tags?: string[];
}

export function useSupabaseCreateProgram() {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProgram = async (data: CreateProgramData) => {
    if (!user) {
      setError('Debes iniciar sesión para crear un programa');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const program = await supabaseService.createTrainingProgram({
        userId: user.id,
        name: data.name,
        description: data.description,
        split: data.split,
        goal: data.goal,
        difficulty: data.difficulty,
        duration: data.duration,
        sessionsPerWeek: data.sessionsPerWeek,
        estimatedDuration: data.estimatedDuration,
        tags: data.tags || [],
        isPublic: false,
        isActive: false,
        mesocycles: [],
        workoutSessions: [],
        microcycles: [],
      });

      return program;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el programa';
      setError(errorMessage);
      console.error('Error creating program:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (data: Partial<CreateProgramData>, step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    switch (step) {
      case 1: // Basic Info
        if (!data.name) errors.push('El nombre es requerido');
        if (!data.description) errors.push('La descripción es requerida');
        break;
      
      case 2: // Program Details
        if (!data.split) errors.push('Debes seleccionar un tipo de división');
        if (!data.goal) errors.push('Debes seleccionar un objetivo');
        if (!data.difficulty) errors.push('Debes seleccionar una dificultad');
        break;
      
      case 3: // Structure
        if (!data.duration || data.duration <= 0) errors.push('La duración debe ser mayor a 0');
        if (!data.sessionsPerWeek || data.sessionsPerWeek <= 0) errors.push('Las sesiones por semana deben ser mayores a 0');
        if (!data.estimatedDuration || data.estimatedDuration <= 0) errors.push('La duración estimada debe ser mayor a 0');
        break;
      
      default:
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    createProgram,
    isLoading,
    error,
    validateStep,
  };
}
