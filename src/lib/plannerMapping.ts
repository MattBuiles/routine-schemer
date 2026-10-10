import type { CalendarEvent, WorkoutSession, WorkoutType } from '@/types';
import type { SessionTemplate, SessionType } from '@/types/program';
import type { DayOfWeek, ScheduledSession } from '@/types/weekly-planner';

const WORKOUT_TYPE_BY_SESSION_TYPE: Record<SessionType, WorkoutType> = {
  strength: 'strength',
  hypertrophy: 'hypertrophy',
  power: 'power',
  endurance: 'endurance',
  skill: 'conditioning',
  recovery: 'recovery',
};

/** Adapta una plantilla del programa a la forma de sesión que usan los componentes del planificador. */
export function templateToWorkoutSession(template: SessionTemplate): WorkoutSession {
  return {
    id: template.id,
    name: template.name,
    type: WORKOUT_TYPE_BY_SESSION_TYPE[template.type] ?? 'conditioning',
    exercises: template.exercises.map(e => ({
      id: e.id,
      exerciseId: e.exerciseId,
      exercise: {
        id: e.exerciseId || e.id,
        name: e.exerciseName,
        bodyPart: e.primaryMuscles[0] ?? '',
        equipment: '',
        target: e.primaryMuscles[0] ?? '',
        instructions: [],
        secondaryMuscles: e.secondaryMuscles,
      },
      sets: e.sets,
      reps: e.reps,
      restTime: e.restSeconds,
      notes: e.notes,
      order: e.order,
    })),
    estimatedDuration: template.estimatedDurationMinutes,
    notes: template.notes,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

/** Un evento de calendario con tipo `workout` pasa a ser una sesión planificada del planificador semanal. */
export function eventToScheduledSession(
  event: CalendarEvent,
  templatesById: Map<string, SessionTemplate>
): ScheduledSession {
  const template = event.sessionId ? templatesById.get(event.sessionId) : undefined;
  const workoutSession: WorkoutSession = template
    ? templateToWorkoutSession(template)
    : {
        id: event.sessionId ?? event.id,
        name: event.title,
        type: 'conditioning',
        exercises: [],
        estimatedDuration: event.duration ?? 0,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };

  return {
    id: event.id,
    workoutSession,
    dayOfWeek: new Date(`${event.date}T00:00:00`).getDay() as DayOfWeek,
    startTime: event.time,
    status: event.completed ? 'completed' : 'scheduled',
    notes: event.notes,
  };
}
