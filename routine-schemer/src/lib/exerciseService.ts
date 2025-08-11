import { Exercise } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_EXERCISE_API_KEY;
const API_HOST = process.env.NEXT_PUBLIC_EXERCISE_API_HOST;

// Fallback exercises in case API is not available
const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
  }
];

interface ApiExercise {
  id?: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  instructions?: string[];
  gifUrl?: string;
  secondaryMuscles?: string[];
}

class ExerciseService {
  private baseUrl = `https://${API_HOST}`;

  async getAllExercises(): Promise<Exercise[]> {
    try {
      if (!API_KEY || !API_HOST) {
        console.warn('Exercise API not configured, using fallback exercises');
        return FALLBACK_EXERCISES;
      }

      const response = await fetch(`${this.baseUrl}/exercises`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }

      const data = await response.json();
      return data.slice(0, 100).map(this.transformExercise); // Limit to 100 exercises
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return FALLBACK_EXERCISES;
    }
  }

  async getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
    try {
      if (!API_KEY || !API_HOST) {
        return FALLBACK_EXERCISES.filter(ex => ex.bodyPart === bodyPart);
      }

      const response = await fetch(`${this.baseUrl}/exercises/bodyPart/${bodyPart}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exercises by body part');
      }

      const data = await response.json();
      return data.slice(0, 50).map(this.transformExercise);
    } catch (error) {
      console.error('Error fetching exercises by body part:', error);
      return FALLBACK_EXERCISES.filter(ex => ex.bodyPart === bodyPart);
    }
  }

  async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
    try {
      if (!API_KEY || !API_HOST) {
        return FALLBACK_EXERCISES.filter(ex => ex.equipment === equipment);
      }

      const response = await fetch(`${this.baseUrl}/exercises/equipment/${equipment}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exercises by equipment');
      }

      const data = await response.json();
      return data.slice(0, 50).map(this.transformExercise);
    } catch (error) {
      console.error('Error fetching exercises by equipment:', error);
      return FALLBACK_EXERCISES.filter(ex => ex.equipment === equipment);
    }
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const allExercises = await this.getAllExercises();
    return allExercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase()) ||
      exercise.target.toLowerCase().includes(query.toLowerCase()) ||
      exercise.bodyPart.toLowerCase().includes(query.toLowerCase())
    );
  }

  getBodyParts(): string[] {
    return [
      'back',
      'cardio',
      'chest',
      'lower arms',
      'lower legs',
      'neck',
      'shoulders',
      'upper arms',
      'upper legs',
      'waist'
    ];
  }

  getEquipmentTypes(): string[] {
    return [
      'assisted',
      'band',
      'barbell',
      'body weight',
      'bosu ball',
      'cable',
      'dumbbell',
      'elliptical machine',
      'ez barbell',
      'hammer',
      'kettlebell',
      'leverage machine',
      'medicine ball',
      'olympic barbell',
      'resistance band',
      'roller',
      'rope',
      'skierg machine',
      'sled machine',
      'smith machine',
      'stability ball',
      'stationary bike',
      'stepmill machine',
      'tire',
      'trap bar',
      'upper body ergometer',
      'weighted',
      'wheel roller'
    ];
  }

  private transformExercise(apiExercise: ApiExercise): Exercise {
    return {
      id: apiExercise.id || Math.random().toString(),
      name: apiExercise.name,
      bodyPart: apiExercise.bodyPart,
      equipment: apiExercise.equipment,
      target: apiExercise.target,
      instructions: apiExercise.instructions || [],
      gifUrl: apiExercise.gifUrl,
      secondaryMuscles: apiExercise.secondaryMuscles || []
    };
  }
}

export const exerciseService = new ExerciseService();
