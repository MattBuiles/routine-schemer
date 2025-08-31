import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Exercise } from '@/types';

export class FirestoreExerciseService {
  // Create a global exercise (admin functionality)
  async createGlobalExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    const docRef = await addDoc(collection(db, 'exercises'), exercise);
    return {
      ...exercise,
      id: docRef.id,
    };
  }

  // Get all global exercises
  async getAllExercises(): Promise<Exercise[]> {
    try {
      const q = query(
        collection(db, 'exercises'),
        limit(100) // Limit to 100 exercises to avoid quota issues
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
  }

  // Search exercises
  async searchExercises(searchTerm: string): Promise<Exercise[]> {
    try {
      const exercises = await this.getAllExercises();
      return exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching exercises:', error);
      return [];
    }
  }

  // Get exercises by body part
  async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    try {
      const q = query(
        collection(db, 'exercises'),
        where('bodyPart', '==', bodyPart.toLowerCase()),
        limit(50) // Limit to 50 exercises to avoid quota issues
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
    } catch (error) {
      console.error('Error fetching exercises by body part:', error);
      return [];
    }
  }

  // Get exercises by equipment
  async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
    try {
      const q = query(
        collection(db, 'exercises'),
        where('equipment', '==', equipment.toLowerCase()),
        limit(50) // Limit to 50 exercises to avoid quota issues
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
    } catch (error) {
      console.error('Error fetching exercises by equipment:', error);
      return [];
    }
  }

  // Get exercises by target muscle
  async getExercisesByTarget(target: string): Promise<Exercise[]> {
    try {
      const q = query(
        collection(db, 'exercises'),
        where('target', '==', target.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
    } catch (error) {
      console.error('Error fetching exercises by target:', error);
      return [];
    }
  }

  // Create user custom exercise
  async createUserExercise(userId: string, exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    const exerciseData = {
      ...exercise,
      userId, // Mark as user-created
      isCustom: true,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    const docRef = await addDoc(collection(db, 'userExercises'), exerciseData);
    return {
      ...exercise,
      id: docRef.id,
    };
  }

  // Get user's custom exercises
  async getUserExercises(userId: string): Promise<Exercise[]> {
    try {
      const q = query(
        collection(db, 'userExercises'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
    } catch (error) {
      console.error('Error fetching user exercises:', error);
      return [];
    }
  }

  // Get combined exercises (global + user custom)
  async getAllUserExercises(userId: string): Promise<Exercise[]> {
    try {
      const [globalExercises, userExercises] = await Promise.all([
        this.getAllExercises(),
        this.getUserExercises(userId)
      ]);
      return [...globalExercises, ...userExercises];
    } catch (error) {
      console.error('Error fetching all user exercises:', error);
      return [];
    }
  }

  // Update user exercise
  async updateUserExercise(exerciseId: string, updates: Partial<Exercise>): Promise<void> {
    const docRef = doc(db, 'userExercises', exerciseId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  // Delete user exercise
  async deleteUserExercise(exerciseId: string): Promise<void> {
    const docRef = doc(db, 'userExercises', exerciseId);
    await deleteDoc(docRef);
  }

  // Listen to real-time updates for user exercises
  onUserExercisesChange(userId: string, callback: (exercises: Exercise[]) => void) {
    const q = query(
      collection(db, 'userExercises'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const exercises = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
      callback(exercises);
    });
  }

  // Seed initial exercises (run once)
  async seedInitialExercises(): Promise<void> {
    const initialExercises: Omit<Exercise, 'id'>[] = [
      {
        name: 'Push-ups',
        bodyPart: 'chest',
        equipment: 'body weight',
        target: 'pectorals',
        instructions: [
          'Start in a plank position with arms extended',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Repeat for desired repetitions'
        ],
        secondaryMuscles: ['triceps', 'anterior deltoid']
      },
      {
        name: 'Squats',
        bodyPart: 'legs',
        equipment: 'body weight',
        target: 'quadriceps',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body as if sitting back into a chair',
          'Keep your chest up and knees behind toes',
          'Return to standing position'
        ],
        secondaryMuscles: ['glutes', 'hamstrings', 'calves']
      },
      {
        name: 'Pull-ups',
        bodyPart: 'back',
        equipment: 'pull-up bar',
        target: 'latissimus dorsi',
        instructions: [
          'Hang from pull-up bar with arms extended',
          'Pull your body up until chin clears the bar',
          'Lower yourself back to starting position',
          'Repeat for desired repetitions'
        ],
        secondaryMuscles: ['biceps', 'rhomboids', 'middle trapezius']
      },
      {
        name: 'Planks',
        bodyPart: 'core',
        equipment: 'body weight',
        target: 'abs',
        instructions: [
          'Start in a push-up position',
          'Lower to forearms keeping body straight',
          'Hold position maintaining straight line from head to heels',
          'Breathe normally throughout'
        ],
        secondaryMuscles: ['shoulders', 'glutes', 'legs']
      },
      {
        name: 'Deadlifts',
        bodyPart: 'back',
        equipment: 'barbell',
        target: 'erector spinae',
        instructions: [
          'Stand with feet hip-width apart, barbell over mid-foot',
          'Bend at hips and knees to grip barbell',
          'Keep chest up and back straight',
          'Drive through heels to stand up straight',
          'Lower barbell back to ground'
        ],
        secondaryMuscles: ['glutes', 'hamstrings', 'quadriceps', 'traps']
      },
      {
        name: 'Bench Press',
        bodyPart: 'chest',
        equipment: 'barbell',
        target: 'pectorals',
        instructions: [
          'Lie on a flat bench with your eyes under the bar',
          'Grip the bar with hands slightly wider than shoulder width',
          'Lower the bar to your chest in a controlled manner',
          'Press the bar back up to the starting position'
        ],
        secondaryMuscles: ['triceps', 'anterior deltoid']
      },
      {
        name: 'Overhead Press',
        bodyPart: 'shoulders',
        equipment: 'barbell',
        target: 'deltoids',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Hold barbell at shoulder level',
          'Press the bar straight up overhead',
          'Lower back to shoulder level'
        ],
        secondaryMuscles: ['triceps', 'upper chest', 'core']
      },
      {
        name: 'Dumbbell Rows',
        bodyPart: 'back',
        equipment: 'dumbbell',
        target: 'latissimus dorsi',
        instructions: [
          'Place one knee and hand on bench',
          'Hold dumbbell in opposite hand',
          'Pull dumbbell to hip level',
          'Lower in controlled manner'
        ],
        secondaryMuscles: ['biceps', 'rhomboids', 'rear deltoids']
      }
    ];

    try {
      // Check if exercises already exist
      const existingExercises = await this.getAllExercises();
      if (existingExercises.length > 0) {
        console.log('Exercises already exist, skipping seed');
        return;
      }

      // Add initial exercises
      for (const exercise of initialExercises) {
        await this.createGlobalExercise(exercise);
      }
      console.log('Initial exercises seeded successfully');
    } catch (error) {
      console.error('Error seeding initial exercises:', error);
    }
  }
}

export const firestoreExerciseService = new FirestoreExerciseService();
