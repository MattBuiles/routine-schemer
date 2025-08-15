import { useState, useEffect } from 'react';
import { exerciseService } from '@/lib/exerciseService';
import { useRoutineStore } from '@/store/routineStore';
import { Exercise, ExerciseFilter } from '@/types';

export const useExercises = () => {
  const { exercises, exerciseFilters, setExercises, setExerciseFilters } = useRoutineStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all exercises on mount
  useEffect(() => {
    const loadExercisesOnMount = async () => {
      setLoading(true);
      setError(null);
      try {
        const exercisesData = await exerciseService.getAllExercises();
        setExercises(exercisesData);
      } catch (err) {
        setError('Failed to load exercises');
        console.error('Error loading exercises:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadExercisesOnMount();
  }, [setExercises]);

  const loadExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const exercisesData = await exerciseService.getAllExercises();
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
          exercise.target.toLowerCase().includes(searchTerm) ||
          exercise.bodyPart.toLowerCase().includes(searchTerm)
      );
    }

    return filteredExercises;
  };

  const updateFilters = (newFilters: Partial<ExerciseFilter>) => {
    setExerciseFilters(newFilters);
  };

  const clearFilters = () => {
    setExerciseFilters({});
  };

  const getBodyParts = () => exerciseService.getBodyParts();
  const getEquipmentTypes = () => exerciseService.getEquipmentTypes();

  return {
    exercises: getFilteredExercises(),
    allExercises: exercises,
    filters: exerciseFilters,
    loading,
    error,
    loadExercises,
    searchExercises,
    getExercisesByBodyPart,
    getExercisesByEquipment,
    updateFilters,
    clearFilters,
    getBodyParts,
    getEquipmentTypes,
  };
};
