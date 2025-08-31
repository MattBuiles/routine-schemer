import { useState, useEffect } from 'react';
import { exerciseService } from '@/lib/exerciseService';
import { useRoutineStore } from '@/store/routineStore';
import { useAuth } from '@/hooks/useAuth';
import { Exercise, ExerciseFilter } from '@/types';

export const useExercises = () => {
  const { exercises, exerciseFilters, setExercises, setExerciseFilters } = useRoutineStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all exercises on mount
  useEffect(() => {
    const loadExercisesOnMount = async () => {
      setLoading(true);
      setError(null);
      try {
        // Seed initial exercises if none exist
        await exerciseService.seedInitialExercises();
        
        // Load exercises for user (global + user custom)
        let exercisesData: Exercise[] = [];
        if (user) {
          exercisesData = await exerciseService.getAllUserExercises(user.id);
        } else {
          exercisesData = await exerciseService.getAllExercises();
        }
        setExercises(exercisesData);
      } catch (err) {
        setError('Failed to load exercises');
        console.error('Error loading exercises:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadExercisesOnMount();
  }, [setExercises, user]);

  const loadExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      let exercisesData: Exercise[] = [];
      if (user) {
        exercisesData = await exerciseService.getAllUserExercises(user.id);
      } else {
        exercisesData = await exerciseService.getAllExercises();
      }
      setExercises(exercisesData);
    } catch (err) {
      setError('Failed to load exercises');
      console.error('Error loading exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchExercises = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await exerciseService.searchExercises(query);
      return results;
    } catch (err) {
      setError('Failed to search exercises');
      console.error('Error searching exercises:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getExercisesByBodyPart = async (bodyPart: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await exerciseService.getExercisesByBodyPart(bodyPart);
      return results;
    } catch (err) {
      setError('Failed to load exercises by body part');
      console.error('Error loading exercises by body part:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getExercisesByEquipment = async (equipment: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await exerciseService.getExercisesByEquipment(equipment);
      return results;
    } catch (err) {
      setError('Failed to load exercises by equipment');
      console.error('Error loading exercises by equipment:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createUserExercise = async (exercise: Omit<Exercise, 'id'>) => {
    if (!user) {
      setError('User must be logged in to create exercises');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const newExercise = await exerciseService.createUserExercise(user.id, exercise);
      await loadExercises(); // Reload exercises
      return newExercise;
    } catch (err) {
      setError('Failed to create exercise');
      console.error('Error creating exercise:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserExercise = async (exerciseId: string, updates: Partial<Exercise>) => {
    if (!user) {
      setError('User must be logged in to update exercises');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await exerciseService.updateUserExercise(exerciseId, updates);
      await loadExercises(); // Reload exercises
    } catch (err) {
      setError('Failed to update exercise');
      console.error('Error updating exercise:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUserExercise = async (exerciseId: string) => {
    if (!user) {
      setError('User must be logged in to delete exercises');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await exerciseService.deleteUserExercise(exerciseId);
      await loadExercises(); // Reload exercises
    } catch (err) {
      setError('Failed to delete exercise');
      console.error('Error deleting exercise:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter exercises based on current filters
  const getFilteredExercises = (): Exercise[] => {
    let filteredExercises = [...exercises];

    if (exerciseFilters.bodyPart) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.bodyPart === exerciseFilters.bodyPart
      );
    }

    if (exerciseFilters.equipment) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.equipment === exerciseFilters.equipment
      );
    }

    if (exerciseFilters.target) {
      filteredExercises = filteredExercises.filter(
        exercise => exercise.target === exerciseFilters.target
      );
    }

    if (exerciseFilters.search) {
      const searchTerm = exerciseFilters.search.toLowerCase();
      filteredExercises = filteredExercises.filter(
        exercise =>
          exercise.name.toLowerCase().includes(searchTerm) ||
          exercise.bodyPart.toLowerCase().includes(searchTerm) ||
          exercise.target.toLowerCase().includes(searchTerm) ||
          exercise.equipment.toLowerCase().includes(searchTerm)
      );
    }

    return filteredExercises;
  };

  const updateFilters = (filters: Partial<ExerciseFilter>) => {
    setExerciseFilters(filters);
  };

  const clearFilters = () => {
    setExerciseFilters({});
  };

  return {
    exercises: getFilteredExercises(),
    allExercises: exercises,
    exerciseFilters,
    loading,
    error,
    loadExercises,
    searchExercises,
    getExercisesByBodyPart,
    getExercisesByEquipment,
    createUserExercise,
    updateUserExercise,
    deleteUserExercise,
    updateFilters,
    clearFilters,
  };
};
