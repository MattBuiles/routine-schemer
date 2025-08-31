import { Exercise } from '@/types';
import { firestoreExerciseService } from './firestoreExerciseService';

class ExerciseService {
  async getAllExercises(): Promise<Exercise[]> {
    return await firestoreExerciseService.getAllExercises();
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    return await firestoreExerciseService.searchExercises(query);
  }

  async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    return await firestoreExerciseService.getExercisesByBodyPart(bodyPart);
  }

  async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
    return await firestoreExerciseService.getExercisesByEquipment(equipment);
  }

  async getExercisesByTarget(target: string): Promise<Exercise[]> {
    return await firestoreExerciseService.getExercisesByTarget(target);
  }

  async createUserExercise(userId: string, exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    return await firestoreExerciseService.createUserExercise(userId, exercise);
  }

  async getUserExercises(userId: string): Promise<Exercise[]> {
    return await firestoreExerciseService.getUserExercises(userId);
  }

  async getAllUserExercises(userId: string): Promise<Exercise[]> {
    return await firestoreExerciseService.getAllUserExercises(userId);
  }

  async updateUserExercise(exerciseId: string, updates: Partial<Exercise>): Promise<void> {
    return await firestoreExerciseService.updateUserExercise(exerciseId, updates);
  }

  async deleteUserExercise(exerciseId: string): Promise<void> {
    return await firestoreExerciseService.deleteUserExercise(exerciseId);
  }

  onUserExercisesChange(userId: string, callback: (exercises: Exercise[]) => void) {
    return firestoreExerciseService.onUserExercisesChange(userId, callback);
  }

  async seedInitialExercises(): Promise<void> {
    return await firestoreExerciseService.seedInitialExercises();
  }
}

export const exerciseService = new ExerciseService();
