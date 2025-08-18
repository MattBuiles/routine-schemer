'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrainingProgram, TrainingSplit, TrainingGoal } from '@/types';

export interface CreateProgramData {
  name: string;
  description: string;
  goal: TrainingGoal;
  split: TrainingSplit;
  duration: number; // weeks
  sessionsPerWeek: number;
  estimatedDuration: number; // minutes per session
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
}

export function useCreateProgram() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProgram = async (data: CreateProgramData): Promise<string | null> => {
    if (!user) {
      setError('Usuario no autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const newProgram: Omit<TrainingProgram, 'id'> = {
        userId: user.id,
        name: data.name,
        description: data.description || '', // Ensure it's never undefined
        goal: data.goal,
        split: data.split,
        duration: data.duration,
        sessionsPerWeek: data.sessionsPerWeek,
        estimatedDuration: data.estimatedDuration,
        difficulty: data.difficulty,
        isActive: true,
        isPublic: data.isPublic ?? false, // Default to false if undefined
        workoutSessions: [],
        microcycles: [],
        mesocycles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [data.goal, data.split, data.difficulty].filter(Boolean), // Remove any undefined values
      };

      const docRef = await addDoc(collection(db, 'routines'), {
        ...newProgram,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      return docRef.id;
    } catch (err) {
      console.error('Error creating program:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
      return null;
    }
  };

  const validateStep = (data: Partial<CreateProgramData>, step: number): { isValid: boolean; errors: Record<string, string> } => {
    const errorArray: string[] = [];
    const errorObject: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!data.name || data.name.trim() === '') {
          errorArray.push('El nombre de la rutina es obligatorio');
          errorObject.name = 'El nombre de la rutina es obligatorio';
        }
        if (data.name && data.name.length < 3) {
          errorArray.push('El nombre debe tener al menos 3 caracteres');
          errorObject.name = 'El nombre debe tener al menos 3 caracteres';
        }
        if (data.name && data.name.length > 50) {
          errorArray.push('El nombre no puede tener más de 50 caracteres');
          errorObject.name = 'El nombre no puede tener más de 50 caracteres';
        }
        if (data.description && data.description.length > 200) {
          errorArray.push('La descripción no puede tener más de 200 caracteres');
          errorObject.description = 'La descripción no puede tener más de 200 caracteres';
        }
        if (!data.duration || data.duration < 1) {
          errorArray.push('La duración debe ser al menos 1 semana');
          errorObject.duration = 'La duración debe ser al menos 1 semana';
        }
        if (data.duration && data.duration > 52) {
          errorArray.push('La duración no puede ser más de 52 semanas');
          errorObject.duration = 'La duración no puede ser más de 52 semanas';
        }
        if (!data.sessionsPerWeek || data.sessionsPerWeek < 1) {
          errorArray.push('Debe haber al menos 1 sesión por semana');
          errorObject.sessionsPerWeek = 'Debe haber al menos 1 sesión por semana';
        }
        if (data.sessionsPerWeek && data.sessionsPerWeek > 7) {
          errorArray.push('No puede haber más de 7 sesiones por semana');
          errorObject.sessionsPerWeek = 'No puede haber más de 7 sesiones por semana';
        }
        if (!data.estimatedDuration || data.estimatedDuration < 15) {
          errorArray.push('La duración mínima por sesión es 15 minutos');
          errorObject.estimatedDuration = 'La duración mínima por sesión es 15 minutos';
        }
        if (data.estimatedDuration && data.estimatedDuration > 180) {
          errorArray.push('La duración máxima por sesión es 180 minutos');
          errorObject.estimatedDuration = 'La duración máxima por sesión es 180 minutos';
        }
        break;

      case 2: // Configuration
        if (!data.goal) {
          errorArray.push('El objetivo de entrenamiento es obligatorio');
          errorObject.goal = 'El objetivo de entrenamiento es obligatorio';
        }
        if (!data.split) {
          errorArray.push('El tipo de división de entrenamiento es obligatorio');
          errorObject.split = 'El tipo de división de entrenamiento es obligatorio';
        }
        if (!data.difficulty) {
          errorArray.push('El nivel de dificultad es obligatorio');
          errorObject.difficulty = 'El nivel de dificultad es obligatorio';
        }
        break;

      case 3: // Privacy - all previous validations
        // Validate all steps for final submission
        const step1Validation = validateStep(data, 1);
        const step2Validation = validateStep(data, 2);
        
        if (!step1Validation.isValid) {
          Object.assign(errorObject, step1Validation.errors);
          errorArray.push(...Object.values(step1Validation.errors));
        }
        if (!step2Validation.isValid) {
          Object.assign(errorObject, step2Validation.errors);
          errorArray.push(...Object.values(step2Validation.errors));
        }
        break;
    }

    return {
      isValid: errorArray.length === 0,
      errors: errorObject
    };
  };

  return {
    createProgram,
    validateStep,
    isLoading: loading,
    error,
    clearError: () => setError(null)
  };
}
