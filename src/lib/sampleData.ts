import { TrainingProgram, WorkoutSession, Exercise, CalendarEvent } from '@/types';

// Sample exercises
export const sampleExercises: Exercise[] = [
  {
    id: '1',
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
    id: '2',
    name: 'Squats',
    bodyPart: 'legs',
    equipment: 'barbell',
    target: 'quadriceps',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Place the barbell on your upper back',
      'Lower your body by bending at the hips and knees',
      'Return to the starting position'
    ],
    secondaryMuscles: ['glutes', 'hamstrings', 'calves']
  },
  {
    id: '3',
    name: 'Deadlifts',
    bodyPart: 'back',
    equipment: 'barbell',
    target: 'erector spinae',
    instructions: [
      'Stand with feet hip-width apart, barbell over mid-foot',
      'Bend at hips and knees to grip the barbell',
      'Keep chest up and back straight',
      'Drive through heels to stand up straight'
    ],
    secondaryMuscles: ['glutes', 'hamstrings', 'quadriceps', 'traps']
  },
  {
    id: '4',
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
    id: '5',
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
    id: '6',
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

// Sample workout sessions
export const sampleWorkoutSessions: WorkoutSession[] = [
  {
    id: '1',
    name: 'Upper Body Strength',
    type: 'strength',
    exercises: [
      {
        id: '1',
        exerciseId: '1',
        exercise: sampleExercises[0], // Bench Press
        sets: 4,
        reps: '5',
        weight: 185,
        restTime: 180,
        order: 1
      },
      {
        id: '2',
        exerciseId: '4',
        exercise: sampleExercises[3], // Pull-ups
        sets: 4,
        reps: '8-10',
        restTime: 120,
        order: 2
      },
      {
        id: '3',
        exerciseId: '5',
        exercise: sampleExercises[4], // Overhead Press
        sets: 3,
        reps: '8',
        weight: 95,
        restTime: 120,
        order: 3
      },
      {
        id: '4',
        exerciseId: '6',
        exercise: sampleExercises[5], // Dumbbell Rows
        sets: 3,
        reps: '10-12',
        weight: 45,
        restTime: 90,
        order: 4
      }
    ],
    estimatedDuration: 75,
    notes: 'Focus on proper form and progressive overload',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Lower Body Power',
    type: 'power',
    exercises: [
      {
        id: '5',
        exerciseId: '2',
        exercise: sampleExercises[1], // Squats
        sets: 5,
        reps: '3',
        weight: 225,
        restTime: 240,
        order: 1
      },
      {
        id: '6',
        exerciseId: '3',
        exercise: sampleExercises[2], // Deadlifts
        sets: 5,
        reps: '3',
        weight: 275,
        restTime: 240,
        order: 2
      }
    ],
    estimatedDuration: 60,
    notes: 'Heavy lifting day - focus on explosive movement',
    createdAt: new Date('2023-01-16'),
    updatedAt: new Date('2023-01-16')
  },
  {
    id: '3',
    name: 'Full Body Conditioning',
    type: 'endurance',
    exercises: [
      {
        id: '7',
        exerciseId: '1',
        exercise: sampleExercises[0], // Bench Press
        sets: 3,
        reps: '15',
        weight: 135,
        restTime: 60,
        order: 1
      },
      {
        id: '8',
        exerciseId: '2',
        exercise: sampleExercises[1], // Squats
        sets: 3,
        reps: '20',
        weight: 135,
        restTime: 60,
        order: 2
      },
      {
        id: '9',
        exerciseId: '4',
        exercise: sampleExercises[3], // Pull-ups
        sets: 3,
        reps: 'AMRAP',
        restTime: 60,
        order: 3
      }
    ],
    estimatedDuration: 45,
    notes: 'Circuit style training for conditioning',
    createdAt: new Date('2023-01-17'),
    updatedAt: new Date('2023-01-17')
  }
];

// Sample training program
export const sampleTrainingProgram: TrainingProgram = {
  id: '1',
  userId: 'sample-user',
  name: 'Strength & Power Program',
  description: 'A 4-week program focused on building strength and power',
  split: 'upper_lower',
  goal: 'strength',
  duration: 4, // weeks
  sessionsPerWeek: 3,
  estimatedDuration: 75, // minutes per session
  difficulty: 'intermediate',
  isPublic: false,
  isActive: true,
  tags: ['strength', 'power', 'upper-lower'],
  workoutSessions: sampleWorkoutSessions,
  microcycles: [], // Will be populated from mesocycle data
  mesocycles: [
    {
      id: '1',
      name: 'Foundation Phase',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-28'),
      microcycles: [
        {
          id: '1',
          name: 'Week 1',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-07'),
          sessions: {
            '2023-01-02': sampleWorkoutSessions[0], // Monday - Upper
            '2023-01-04': sampleWorkoutSessions[1], // Wednesday - Lower
            '2023-01-06': sampleWorkoutSessions[0], // Friday - Upper
          },
          notes: 'Start with moderate intensity'
        },
        {
          id: '2',
          name: 'Week 2',
          startDate: new Date('2023-01-08'),
          endDate: new Date('2023-01-14'),
          sessions: {
            '2023-01-09': sampleWorkoutSessions[0], // Monday - Upper
            '2023-01-11': sampleWorkoutSessions[1], // Wednesday - Lower
            '2023-01-13': sampleWorkoutSessions[2], // Friday - Conditioning
          },
          notes: 'Increase intensity slightly'
        }
      ],
      goal: 'strength',
      notes: 'Focus on building a solid foundation'
    }
  ],
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
};

// Sample calendar events
export const sampleCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    userId: 'sample-user',
    date: '2023-01-02',
    title: 'Upper Body Strength',
    type: 'workout',
    sessionId: '1',
    session: sampleWorkoutSessions[0],
    completed: true,
    actualDuration: 80,
    notes: 'Great session, increased weight on bench press',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02')
  },
  {
    id: '2',
    userId: 'sample-user',
    date: '2023-01-04',
    title: 'Lower Body Strength',
    type: 'workout',
    sessionId: '2',
    session: sampleWorkoutSessions[1],
    completed: true,
    actualDuration: 65,
    createdAt: new Date('2023-01-04'),
    updatedAt: new Date('2023-01-04')
  },
  {
    id: '3',
    userId: 'sample-user',
    date: '2023-01-06',
    title: 'Upper Body Strength',
    type: 'workout',
    sessionId: '1',
    session: sampleWorkoutSessions[0],
    completed: false,
    createdAt: new Date('2023-01-06'),
    updatedAt: new Date('2023-01-06')
  },
  {
    id: '4',
    userId: 'sample-user',
    date: '2023-01-09',
    title: 'Upper Body Strength',
    type: 'workout',
    sessionId: '1',
    session: sampleWorkoutSessions[0],
    completed: false,
    createdAt: new Date('2023-01-09'),
    updatedAt: new Date('2023-01-09')
  },
  {
    id: '5',
    userId: 'sample-user',
    date: '2023-01-11',
    title: 'Lower Body Strength',
    type: 'workout',
    sessionId: '2',
    session: sampleWorkoutSessions[1],
    completed: false,
    createdAt: new Date('2023-01-11'),
    updatedAt: new Date('2023-01-11')
  }
];

// Helper function to get sample data
export const getSampleData = () => ({
  exercises: sampleExercises,
  workoutSessions: sampleWorkoutSessions,
  trainingProgram: sampleTrainingProgram,
  calendarEvents: sampleCalendarEvents
});

// Helper function to create realistic dates for current month
export const generateCurrentMonthEvents = (): CalendarEvent[] => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const events: CalendarEvent[] = [];
  
  // Add some events for the current month
  for (let day = 1; day <= 28; day += 3) {
    const eventDate = new Date(currentYear, currentMonth, day);
    const sessionIndex = day % 3;
    
    events.push({
      id: `current-${day}`,
      userId: 'demo-user-123',
      date: eventDate.toISOString().split('T')[0],
      title: sampleWorkoutSessions[sessionIndex].name,
      type: 'workout' as const,
      sessionId: sampleWorkoutSessions[sessionIndex].id,
      session: sampleWorkoutSessions[sessionIndex],
      completed: eventDate < today,
      actualDuration: eventDate < today ? sampleWorkoutSessions[sessionIndex].estimatedDuration + (Math.random() * 20 - 10) : undefined,
      createdAt: eventDate,
      updatedAt: eventDate
    });
  }
  
  return events;
};
