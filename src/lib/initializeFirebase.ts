import { firestoreExerciseService } from '@/lib/firestoreExerciseService';

/**
 * Initialize Firebase data with sample exercises
 * This should be run once to populate the database with initial data
 */
export const initializeFirebaseData = async (): Promise<void> => {
  console.log('🔥 Starting Firebase data initialization...');
  
  try {
    // Seed initial exercises
    console.log('📚 Seeding initial exercises...');
    await firestoreExerciseService.seedInitialExercises();
    console.log('✅ Exercises seeded successfully');
    
    console.log('🎉 Firebase data initialization completed!');
  } catch (error) {
    console.error('❌ Error initializing Firebase data:', error);
    throw error;
  }
};

/**
 * Check if initialization is needed
 */
export const checkIfInitializationNeeded = async (): Promise<boolean> => {
  try {
    const exercises = await firestoreExerciseService.getAllExercises();
    return exercises.length === 0;
  } catch (error) {
    console.error('Error checking initialization status:', error);
    return true; // Assume initialization is needed if we can't check
  }
};

/**
 * Auto-initialize if needed
 */
export const autoInitializeIfNeeded = async (): Promise<void> => {
  try {
    const needsInit = await checkIfInitializationNeeded();
    if (needsInit) {
      console.log('🚀 Auto-initializing Firebase data...');
      await initializeFirebaseData();
    } else {
      console.log('✅ Firebase data already initialized');
    }
  } catch (error) {
    console.error('Error in auto-initialization:', error);
  }
};
