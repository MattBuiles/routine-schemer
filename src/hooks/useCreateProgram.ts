import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { firestoreService } from '@/lib/firestoreService';
import { TrainingProgram, WorkoutSession, TrainingGoal, TrainingSplit } from '@/types';
import toast from 'react-hot-toast';

type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';

export const useCreateProgram = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProgram = async (programData: {
    name: string;
    description?: string;
    goal: TrainingGoal;
    split: TrainingSplit;
    duration: number; // weeks
    sessionsPerWeek: number;
    difficulty: ProgramDifficulty;
    sessions: WorkoutSession[];
  }): Promise<TrainingProgram | null> => {
    if (!user) {
      toast.error('You must be logged in to create programs');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const program: Omit<TrainingProgram, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        name: programData.name,
        description: programData.description || '',
        goal: programData.goal,
        split: programData.split,
        duration: programData.duration,
        difficulty: programData.difficulty,
        sessionsPerWeek: programData.sessionsPerWeek,
        estimatedDuration: 60, // Default to 60 minutes
        workoutSessions: programData.sessions,
        mesocycles: [],
        microcycles: [],
        isPublic: false,
        isActive: true,
        tags: [],
      };

      const createdProgram = await firestoreService.createTrainingProgram(program);
      toast.success('Program created successfully!');
      return createdProgram;
    } catch (err) {
      const errorMessage = 'Failed to create program';
      setError(errorMessage);
      console.error('Error creating program:', err);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProgram = async (programId: string, updates: Partial<TrainingProgram>): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to update programs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await firestoreService.updateTrainingProgram(programId, updates);
      toast.success('Program updated successfully!');
    } catch (err) {
      const errorMessage = 'Failed to update program';
      setError(errorMessage);
      console.error('Error updating program:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProgram = async (programId: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to delete programs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await firestoreService.deleteTrainingProgram(programId);
      toast.success('Program deleted successfully!');
    } catch (err) {
      const errorMessage = 'Failed to delete program';
      setError(errorMessage);
      console.error('Error deleting program:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAllPrograms = async (): Promise<TrainingProgram[]> => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      const programs = await firestoreService.getTrainingProgramsByUserId(user.id);
      return programs;
    } catch (err) {
      const errorMessage = 'Failed to load programs';
      setError(errorMessage);
      console.error('Error loading programs:', err);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const duplicateProgram = async (programId: string, newName: string): Promise<TrainingProgram | null> => {
    if (!user) {
      toast.error('You must be logged in to duplicate programs');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Get original program
      const programs = await firestoreService.getTrainingProgramsByUserId(user.id);
      const originalProgram = programs.find(p => p.id === programId);

      if (!originalProgram) {
        throw new Error('Program not found');
      }

      // Create duplicate
      const duplicatedProgram = await createProgram({
        name: newName,
        description: originalProgram.description,
        goal: originalProgram.goal,
        split: originalProgram.split,
        duration: originalProgram.duration,
        sessionsPerWeek: originalProgram.sessionsPerWeek,
        difficulty: originalProgram.difficulty,
        sessions: originalProgram.workoutSessions,
      });

      return duplicatedProgram;
    } catch (err) {
      const errorMessage = 'Failed to duplicate program';
      setError(errorMessage);
      console.error('Error duplicating program:', err);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProgram,
    updateProgram,
    deleteProgram,
    getAllPrograms,
    duplicateProgram,
    loading,
    error,
  };
};
